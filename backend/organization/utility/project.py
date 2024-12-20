import logging
from typing import Dict

from climateconnect_api.models import Skill
from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import get_translations
from climateconnect_main.utility.general import get_image_from_data_url
from location.utility import get_location
from climateconnect_api.utility.common import create_unique_slug

from organization.models import Project, ProjectMember
from organization.models.tags import ProjectTags
from organization.models.type import ProjectTypesChoices

from django.db.models import Q
from climateconnect_api.models import Role

import pandas as pd

logger = logging.getLogger(__name__)


def create_new_project(data: Dict, source_language: Language) -> Project:
    project_type = ProjectTypesChoices[data["project_type"]["type_id"]]
    project = Project.objects.create(
        name=data["name"],
        short_description=data["short_description"],
        collaborators_welcome=data["collaborators_welcome"],
        status_id=data["status"],
        project_type=project_type,
    )
    # Add all non required parameters if they exists in the request.
    if "start_date" in data:
        project.start_date = data["start_date"]
    if "loc" in data:
        location = get_location(data["loc"])
        project.loc = location
    if "country" in data:
        project.country = data["country"]
    if "city" in data:
        project.city = data["city"]
    if "image" in data:
        project.image = get_image_from_data_url(data["image"])[0]
    if "thumbnail_image" in data:
        project.thumbnail_image = get_image_from_data_url(data["thumbnail_image"])[0]
    if "description" in data:
        project.description = data["description"]
    if "end_date" in data:
        project.end_date = data["end_date"]
    if "helpful_connections" in data:
        project.helpful_connections = data["helpful_connections"]
    if "is_draft" in data:
        project.is_draft = data["is_draft"]
    if "website" in data:
        project.website = data["website"]
    if "additional_loc_info" in data:
        project.additional_loc_info = data["additional_loc_info"]
    project.language = source_language

    project.url_slug = create_unique_slug(project.name, project.id, Project.objects)

    if "skills" in data:
        for skill_id in data["skills"]:
            try:
                skill = Skill.objects.get(id=int(skill_id))
                project.skills.add(skill)
            except Skill.DoesNotExist:
                logger.error("Passed skill ID {} does not exists".format(skill_id))
                continue
    project.save()
    return project


def get_project_helpful_connections(project: Project, language_code: str) -> str:
    if (
        language_code != project.language.language_code
        and project.translation_project.filter(
            language__language_code=language_code
        ).exists()
    ):
        return project.translation_project.get(
            language__language_code=language_code
        ).helpful_connections_translation

    return project.helpful_connections


def get_project_name(project: Project, language_code: str) -> str:
    if (
        project.language
        and language_code != project.language.language_code
        and project.translation_project.filter(
            language__language_code=language_code
        ).exists()
    ):
        return project.translation_project.get(
            language__language_code=language_code
        ).name_translation

    return project.name


def get_project_short_description(project: Project, language_code: str) -> str:
    if (
        project.language
        and language_code != project.language.language_code
        and project.translation_project.filter(
            language__language_code=language_code
        ).exists()
    ):
        return project.translation_project.get(
            language__language_code=language_code
        ).short_description_translation

    return project.short_description


def get_project_description(project: Project, language_code: str) -> str:
    if (
        project.language
        and language_code != project.language.language_code
        and project.translation_project.filter(
            language__language_code=language_code
        ).exists()
    ):
        return project.translation_project.get(
            language__language_code=language_code
        ).description_translation

    return project.description


def get_projecttag_name(tag: ProjectTags, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(tag, lang_translation_attr):
        translation = getattr(tag, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return tag.name


def get_project_translations(data: Dict):
    texts = {"name": data["name"], "short_description": data["short_description"]}
    if "description" in data:
        texts["description"] = data["description"]
    if "helpful_connections" in data:
        texts["helpful_connections"] = data["helpful_connections"]
    try:
        return get_translations(texts, data["translations"], data["source_language"])
    except ValueError:
        raise ValueError


def add_project_member(project, user, user_role, role_in_project, availability):
    """
    Adds a user to a project. Assumes valid data at input.
    """
    ProjectMember.objects.create(
        availability=availability,
        project=project,
        role_in_project=role_in_project,
        role=user_role,
        user=user,
    )


def get_project_admin_creators(project, limit_to_admins=False):
    """
    Returns a given project UserProfiles of Creators or Administrators. if limit_to_admins is set to True, only admins will be returned.
    :param project: target project
    :type project: Project
    :param limit_to_admins: limit output to admins only
    :type limit_to_admins: bool
    """
    targets_roles = Role.objects.filter(
        Q(name="Creator") | Q(name="Administrator")
    ).all()
    if targets_roles.count() < 1:
        raise Exception(
            f"Role 'Creator' or role 'Administrator' doesn't exist: {targets_roles}"
        )

    admin_role, creator_role = (
        targets_roles.filter(name="Administrator").first(),
        targets_roles.filter(name="Creator").first(),
    )

    role_sub_query = (
        Q(role=admin_role)
        if limit_to_admins
        else (Q(role=admin_role) | Q(role=creator_role))
    )
    query = Q(project=project) & role_sub_query

    admins = ProjectMember.objects.filter(query)

    return [u.user for u in admins.all()]


def is_part_of_project(user, project):
    """
    Returns True if user belongs to a project
    :param user: user to be checked
    :type user: User
    :param project: project to be checked
    :type project: ProjectMember
    """
    return ProjectMember.objects.filter(project=project, user=user).count() > 0


def get_similar_projects(url_slug: str, return_count=5):
    """Returns a list of similar projects to the given project input
    Arguments:
    url_slug (str): url_slug of the source project for which similar projects will returned
    return_count (int) : Maximum number of similar projects to return. Defaults to 5

    Returns:
        List of similar projects url_slug

    """

    def sets_match(source_set: set, target_set: set):
        """returns the % of matching elements from the source set to the target set.
        eg: source:  {1,2,3,4} / target : {3,4,5,6} ==> output : 0.5 (50%)
            source: {3,4} / target : {3,4,5,6} ==> output : 1 (100%)

        """
        source_set_count = len(source_set)
        if source_set_count == 0:
            return 0
        matching_elements = 0
        for source_set_element in source_set:
            if source_set_element in target_set:
                matching_elements += 1

        return matching_elements / source_set_count

    target_projects = Project.objects.filter(is_active=True).values(
        "url_slug",
        "country",
        "city",
        "project_parent__id",
        "tag_project",
        "skills",
        "language",
    )  # project_parent__id 'tag_project' 'skills'

    df = pd.DataFrame.from_dict(target_projects)

    # calcaulte skills match %
    # since skills are 1 to Many to projects, we need to group the skills in a list
    skills_df = df.groupby(["url_slug"]).agg({"skills": set})
    source_skills = skills_df.loc[url_slug][0]
    skills_df["source_skills"] = [source_skills for i in range(0, len(skills_df))]
    skills_df["skills_match"] = skills_df.apply(
        lambda x: sets_match(x["source_skills"], x["skills"]), axis=1
    )

    # calcualte tags match %
    # since tags are 1 to Many to projects, we need to group the tags in a list
    tags_df = df.groupby(["url_slug"]).agg({"tag_project": set})
    source_tags = tags_df.loc[url_slug][0]
    tags_df["source_tag_project"] = [source_tags for i in range(0, len(tags_df))]
    tags_df["tags_match"] = tags_df.apply(
        lambda x: sets_match(x["source_tag_project"], x["tag_project"]), axis=1
    )

    # calculate parent/country/city/language similarity. It is a binary evaluation where 1 means a match and 0 no match
    source_proj_country = df.loc[df.url_slug == url_slug].country.iloc[0]
    source_proj_city = df.loc[df.url_slug == url_slug].city.iloc[0]
    source_proj_language = df.loc[df.url_slug == url_slug].language.iloc[0]
    source_proj_parent_id = df.loc[df.url_slug == url_slug].project_parent__id.iloc[0]

    df = (
        df.drop(["skills", "tag_project"], axis=1)
        .drop_duplicates()
        .set_index("url_slug")
    )

    df["is_same_parent"] = df.project_parent__id.apply(
        lambda x: 1 if x == source_proj_parent_id else 0
    )
    df["is_same_city"] = df.apply(
        lambda x: (
            1
            if x["city"] == source_proj_city and x["country"] == source_proj_country
            else 0
        ),
        axis=1,
    )
    df["is_same_language"] = df.language.apply(
        lambda x: 1 if x == source_proj_language else 0
    )
    df["is_same_country"] = df.country.apply(
        lambda x: 1 if x == source_proj_country else 0
    )

    # calculate similarity score based on the above calculated features

    # join the dataframes from above on url_slug index and drop the source project
    df = pd.concat(
        [
            df[
                [
                    "is_same_parent",
                    "is_same_city",
                    "is_same_language",
                    "is_same_country",
                ]
            ],
            skills_df[["skills_match"]],
            tags_df[["tags_match"]],
        ],
        axis=1,
    )

    df = df.drop(url_slug)
    # weights given to each factor. Increase the integer value to strenghten the weight of a particular factor
    weights_mapping = {
        "is_same_parent": 3,
        "is_same_city": 2,
        "is_same_language": 2,
        "is_same_country": 1,
        "skills_match": 3,
        "tags_match": 3,
    }
    total_weights = sum(weights_mapping.values())
    factors = weights_mapping.keys()

    for factor in factors:
        df[factor] = df[factor] * weights_mapping[factor]

    # calulate the similarity score
    df["similarity_score"] = df.apply(
        lambda x: sum(x) / total_weights, axis=1, raw=True
    )

    return (
        df.sort_values(by=["similarity_score"], ascending=False)
        .head(return_count)
        .index.values
    )
