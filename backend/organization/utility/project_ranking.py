import datetime
import random
from django.core.cache import cache
from django.utils import timezone
from typing import Dict, List, Optional
from organization.models.type import ProjectTypesChoices
from organization.utility.cache import generate_project_ranking_cache_key
from climateconnect_api.models.user import UserProfile
from django.db import connection


class ProjectRanking:
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile
        self.EVENT_DURATION_IN_DAYS = 14
        self.DEFAULT_CACHE_TIMEOUT_IN_SECONDS = 86400  # 1 day

    def _randomize_ranking(self, project_rank: int) -> int:
        # a random number gives a boost to different projects to get the top of the list
        return int(random.triangular(1, 1.2) * project_rank)

    def _weights(self) -> Dict:
        return {
            "total_comments": 2,
            "total_likes": 2,
            "total_followers": 2,
            "last_project_comment": 1.4,
            "last_project_like": 1.6,
            "last_project_follower": 1.4,
            "total_tags": 0.2,
            "location": 0.2,
            "description": 10,
            "total_skills": 0.2,
            "created_at": 5,
        }

    # Projects or interactions older than this timeframe don't get any recency score
    DEFAULT_BASE_SCORE_TIMEFRAME = 100 * 24 * 60 * 60

    def _recency_score(
        self,
        timedelta: int,
        max_boost=20,
        base_score_timeframe=DEFAULT_BASE_SCORE_TIMEFRAME,
    ) -> Dict:
        # The base score is the maximum score possible if max_boost=0
        base_score = 10
        # If timedelta < timeframe a boost between min_boost_percentage*max_boost and max_boost_percentage*max_boost is added to the base score
        boosts = [
            {
                "timeframe": 3 * 24 * 60 * 60,
                "min_boost_percentage": 0.6,
                "max_boost_percentage": 1,
            },
            {
                "timeframe": 7 * 24 * 60 * 60,
                "min_boost_percentage": 0.2,
                "max_boost_percentage": 0.6,
            },
            {
                "timeframe": 14 * 24 * 60 * 60,
                "min_boost_percentage": 0.05,
                "max_boost_percentage": 0.2,
            },
        ]

        def get_recency_score_with_boost(
            reference_timespan: int, min_boost, max_boost=200
        ):
            time_left = base_score_timeframe - timedelta
            percentage_of_time_left = time_left / base_score_timeframe
            # First we calculate the score without a boost based on base_score and base_score_timeframe
            score = max(0, percentage_of_time_left * base_score)
            # If the item is applicable for a boost we add the boost score
            if min_boost > 0:
                time_left_boost = reference_timespan - timedelta
                percentage_of_time_left_boost = time_left_boost / reference_timespan
                boost_delta = max_boost - min_boost
                boost = min_boost + percentage_of_time_left_boost * boost_delta
                score += boost
            return score

        # If timedelta fits any boost, we apply them
        for boost in boosts:
            if timedelta < boost["timeframe"]:
                return get_recency_score_with_boost(
                    reference_timespan=boost["timeframe"],
                    min_boost=boost["min_boost_percentage"] * max_boost,
                    max_boost=boost["max_boost_percentage"] * max_boost,
                )

        # Otherwise we simply return the score without any boosts
        return get_recency_score_with_boost(
            reference_timespan=base_score_timeframe, min_boost=0, max_boost=0
        )

    # This is simply a helper function to call self._recency_score
    def calculate_recency_of_interaction(
        self,
        last_interaction_timestamp: Optional[datetime.datetime],
        max_boost: Optional[int],
        base_score_timeframe=DEFAULT_BASE_SCORE_TIMEFRAME,
    ) -> int:
        if not last_interaction_timestamp:
            return 0

        current_timestamp = timezone.now().timestamp()
        timedelta = current_timestamp - last_interaction_timestamp
        if max_boost:
            self._recency_score(
                timedelta=timedelta,
                max_boost=max_boost,
                base_score_timeframe=base_score_timeframe,
            )
        return self._recency_score(timedelta=timedelta)

    # TODO: a future refactor could tackle the code duplication issue regarding the ranking calculation
    # IMO: one could remove the "recalculate ranking" daily job, as the ranking should now be fast enough
    # and cachemisses are calculated on the fly

    def calculate_ranking(
        self,
        description: str,
        location: Optional[int],
        project_id: int,
        project_manually_set_rating: int,
        total_skills: int,
        project_type: ProjectTypesChoices,
        start_date: Optional[datetime.datetime],
        end_date: Optional[datetime.datetime],
        created_at: datetime.datetime,
    ) -> int:
        from organization.models import (
            ProjectComment,
            ProjectLike,
            ProjectTagging,
            ProjectFollower,
        )

        cache_key = generate_project_ranking_cache_key(project_id=project_id)

        weights = self._weights()

        last_project_comment = (
            ProjectComment.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_comment_timestamp = (
            None
            if not last_project_comment
            else last_project_comment.created_at.timestamp()
        )
        last_project_like = (
            ProjectLike.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_like_timestamp = (
            None if not last_project_like else last_project_like.created_at.timestamp()
        )
        last_project_follower = (
            ProjectFollower.objects.filter(project_id=project_id)
            .order_by("-created_at")
            .last()
        )
        last_project_follower_timestamp = (
            None
            if not last_project_follower
            else last_project_follower.created_at.timestamp()
        )

        is_past_event = (
            project_type == ProjectTypesChoices.event
            and end_date.timestamp() < timezone.now().timestamp()
        )

        def get_created_at_factor():
            # For events the start_date and end_date are more important than the creation time
            if project_type == ProjectTypesChoices.event:
                # The event is in the past -> attribute a negative score
                if is_past_event:
                    return -99
                # The event is currently ongoing. Increase its score the closer it its end it is (this is especially relevant for multi-week-projects)
                elif start_date.timestamp() < timezone.now().timestamp():
                    return self._recency_score(
                        timedelta=end_date.timestamp() - timezone.now().timestamp(),
                        base_score_timeframe=end_date.timestamp()
                        - start_date.timestamp(),
                    )
                # The event is in the future -> take into account how soon the event is coming up
                else:
                    created_at_score = self.calculate_recency_of_interaction(
                        last_interaction_timestamp=created_at.timestamp(), max_boost=5
                    )
                    start_date_timedelta = (
                        start_date.timestamp() - timezone.now().timestamp()
                    )
                    start_date_score = self._recency_score(
                        timedelta=start_date_timedelta,
                        base_score_timeframe=14 * 24 * 60 * 60,
                    )
                    return max(created_at_score, start_date_score)
            # For ideas and projects simple use the creation date as reference for the created_at_factor
            return self.calculate_recency_of_interaction(
                last_interaction_timestamp=created_at.timestamp(), max_boost=None
            )

        project_factors = {
            "total_comments": ProjectComment.objects.filter(
                project_id=project_id
            ).count(),
            "total_likes": ProjectLike.objects.filter(project_id=project_id).count(),
            "total_followers": ProjectFollower.objects.filter(
                project_id=project_id
            ).count(),
            "last_project_comment": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_comment_timestamp,
                max_boost=None,
            ),
            "last_project_like": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_like_timestamp, max_boost=None
            ),
            "last_project_follower": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_follower_timestamp,
                max_boost=None,
            ),
            "total_tags": ProjectTagging.objects.filter(project_id=project_id).count(),
            "location": 1 if location else 0,
            "description": 1 if description and len(description) > 0 else 0,
            "total_skills": total_skills,
            "created_at": get_created_at_factor(),
        }

        project_rank = (
            int(sum(project_factors[factor] * weights[factor] for factor in weights))
            + project_manually_set_rating
        )

        # Now we want to change the order every time somebody
        # visits the page we would add some randomization.
        # For past events we do not add any randomization because they should be downranked regardless
        if not is_past_event:
            project_rank = self._randomize_ranking(project_rank=project_rank)

        cache.set(
            cache_key, project_rank, timeout=self.DEFAULT_CACHE_TIMEOUT_IN_SECONDS
        )

        return project_rank

    def calculate_all_project_rankings(
        self, project_ids: List[int] | None = None
    ) -> Dict[int, int]:
        vectors = self.__get_project_ranking_vectors(project_ids)

        ranks = {}
        for vector in vectors:
            project_rank = self.__calculate_individual_project_ranking(
                project_id=vector[0],
                project_manually_set_rating=vector[1],
                created_at=vector[2],
                start_date=vector[3],
                end_date=vector[4],
                project_type=vector[5],
                total_comments=vector[6],
                total_likes=vector[7],
                total_followers=vector[8],
                total_skills=vector[9],
                total_tags=vector[10],
                last_project_comment_timestamp=vector[11],
                last_project_like_timestamp=vector[12],
                last_project_follower_timestamp=vector[13],
                has_location=vector[14],
                has_description=vector[15],
            )
            ranks[vector[0]] = project_rank

        # TODO: do we want to (re-)cache all rankings here, or just the new ones?
        cache_data = {}
        for ranking in ranks.items():
            project_id = ranking[0]
            project_rank = ranking[1]
            cache_key = generate_project_ranking_cache_key(project_id=project_id)
            cache_data[cache_key] = project_rank
        cache.set_many(cache_data, timeout=self.DEFAULT_CACHE_TIMEOUT_IN_SECONDS)

        return ranks

    def __get_project_ranking_vectors(self, project_ids: List[int] | None = None):
        """
        Pulls together the ranking vector for each project (using a list of features, that will be used to
        calculate the ranking score (e.g. number of likes, comments, recency of last interaction, etc.):
        - project_manually_set_rating
        - created_at
        - start_date
        - end_date
        - project_type

        - total_comments
        - total_likes
        - total_followers
        - total_skills
        - total_tags (should moved to sectors ... todo)

        - last_project_comment
        - last_project_like
        - last_project_follower

        - has_location
        - has_description

        TODOs:
        - total_sectors (todo)
        - has_abusive_content (todo)
        - has_short_description (todo)
        """

        with connection.cursor() as cursor:
            query_template = """
                SELECT
                    proj.id                             AS project_id,
                    proj.rating                         AS project_manually_set_rating,
                    proj.created_at                     AS created_at,
                    proj.start_date                     AS start_date,
                    proj.end_date                       AS end_date,
                    proj.project_type                   AS project_type,
                    
                    

                    COUNT(DISTINCT comment.id)          AS total_comments,
                    COUNT(DISTINCT likes.id)            AS total_likes,
                    COUNT(DISTINCT follower.id)         AS total_followers,
                    COUNT(DISTINCT skill_mapping.id)    AS total_skills,
                    0                                   AS total_tags,

                    MAX(comment.created_at)             AS last_project_comment,
                    MAX(likes.created_at)               AS last_project_like,
                    MAX(follower.created_at)            AS last_project_follower,

                    (proj.loc_id IS NOT NULL)           AS has_location,
                    (LENGTH(proj.description) > 0)      AS has_description


                FROM
                    organization_project proj

                LEFT JOIN   organization_projectcomment     comment_mapping     ON  proj.id = comment_mapping.project_id
                LEFT JOIN   organization_comment            comment             ON  comment_mapping.comment_ptr_id = comment.id
                LEFT JOIN   organization_projectlike        likes               ON  proj.id = likes.project_id
                LEFT JOIN   organization_projectfollower    follower            ON  proj.id = follower.project_id
                LEFT JOIN   organization_project_skills     skill_mapping       ON  proj.id = skill_mapping.project_id
            """
            if project_ids:
                placeholders = ", ".join(["%s"] * len(project_ids))
                query_template += f" WHERE proj.id IN ({placeholders}) "
                query_template += " GROUP BY proj.id; "
                cursor.execute(query_template, project_ids)
            else:
                query_template += " GROUP BY proj.id;"
                cursor.execute(query_template)
            rows = cursor.fetchall()

            return rows

    def __calculate_individual_project_ranking(
        self,
        project_id: int,
        project_manually_set_rating: int,
        created_at: datetime.datetime,
        start_date: Optional[datetime.datetime],
        end_date: Optional[datetime.datetime],
        project_type: ProjectTypesChoices,
        total_comments: int,
        total_likes: int,
        total_followers: int,
        total_skills: int,
        total_tags: int,
        last_project_comment_timestamp: Optional[datetime.datetime],
        last_project_like_timestamp: Optional[datetime.datetime],
        last_project_follower_timestamp: Optional[datetime.datetime],
        has_location: bool,
        has_description: bool,
    ) -> int:

        weights = self._weights()

        is_past_event = (
            project_type == ProjectTypesChoices.event
            and end_date.timestamp() < timezone.now().timestamp()
        )

        def get_created_at_factor():
            # For events the start_date and end_date are more important than the creation time
            if project_type == ProjectTypesChoices.event:
                # The event is in the past -> attribute a negative score
                if is_past_event:
                    return -99
                # The event is currently ongoing. Increase its score the closer it its end it is (this is especially relevant for multi-week-projects)
                elif start_date.timestamp() < timezone.now().timestamp():
                    return self._recency_score(
                        timedelta=end_date.timestamp() - timezone.now().timestamp(),
                        base_score_timeframe=end_date.timestamp()
                        - start_date.timestamp(),
                    )
                # The event is in the future -> take into account how soon the event is coming up
                else:
                    created_at_score = self.calculate_recency_of_interaction(
                        last_interaction_timestamp=created_at.timestamp(), max_boost=5
                    )
                    start_date_timedelta = (
                        start_date.timestamp() - timezone.now().timestamp()
                    )
                    start_date_score = self._recency_score(
                        timedelta=start_date_timedelta,
                        base_score_timeframe=14 * 24 * 60 * 60,
                    )
                    return max(created_at_score, start_date_score)
            # For ideas and projects simple use the creation date as reference for the created_at_factor
            return self.calculate_recency_of_interaction(
                last_interaction_timestamp=created_at.timestamp(), max_boost=None
            )

        project_factors = {
            "total_comments": total_comments,
            "total_likes": total_likes,
            "total_followers": total_followers,
            "total_tags": total_tags,
            "total_skills": total_skills,
            "created_at": get_created_at_factor(),
            "last_project_comment": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_comment_timestamp,
                max_boost=None,
            ),
            "last_project_like": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_like_timestamp, max_boost=None
            ),
            "last_project_follower": self.calculate_recency_of_interaction(
                last_interaction_timestamp=last_project_follower_timestamp,
                max_boost=None,
            ),
            "location": 1 if has_location else 0,
            "description": 1 if has_description else 0,
        }

        project_rank = (
            int(sum(project_factors[factor] * weights[factor] for factor in weights))
            + project_manually_set_rating
        )

        # TODO: the following comment is an old one and it is wrong. Yet, I am not sure about whether we want
        # to implement this feature or not. The randomization happens before the caching. Thus, every user would
        # see the same ranking until the cache expires. So currently it only adds a day by day variation.

        # -----------------------------------------------------------------------------------------------------
        # Now we want to change the order every time somebody
        # visits the page we would add some randomization.
        # For past events we do not add any randomization because they should be downranked regardless
        # -----------------------------------------------------------------------------------------------------

        if not is_past_event:
            project_rank = self._randomize_ranking(project_rank=project_rank)

        return project_rank
