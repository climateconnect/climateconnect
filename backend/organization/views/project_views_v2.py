from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from django.core.cache import cache
from django.db.models import Q, Case, When, Prefetch, Count
from django.contrib.gis.db.models.functions import Distance

from django_filters.rest_framework import DjangoFilterBackend

from climateconnect_api.models.badge import UserBadge
from climateconnect_api.models.donation import Donation
from organization.models.sector import ProjectSectorMapping
from organization.utility.project_ranking import ProjectRanking
from climateconnect_api.models.common import Skill

from organization.models.tags import OrganizationTagging, OrganizationTags
from organization.utility.cache import generate_project_ranking_cache_key
from organization.utility.sector import (
    create_context_for_hub_specific_sector,
    sanitize_sector_inputs,
)
from organization.pagination import ProjectsPagination
from organization.views.project_views import ProjectsOrderingFilter
from organization.serializers.project import ProjectStubSerializer
from organization.models.project import Project, ProjectParents

from hubs.models import Hub

from location.models import Location
from location.utility import get_location_with_range

import logging

logger = logging.getLogger(__name__)

USING_CACHE = True


class ListProjectsViewV2(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend, ProjectsOrderingFilter]
    search_fields = ["name", "translation_project__name_translation"]
    filterset_fields = ["collaborators_welcome"]
    pagination_class = ProjectsPagination
    serializer_class = ProjectStubSerializer
    _cached_queryset = None

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests for search functionality.
        """
        # Extract location from the POST data
        location = request.data

        # Add location to the query params
        query_params = request.query_params.copy()

        if "place_id" in location and "geojson" in location:
            query_params["location"] = location

        # Replace request.query_params with our updated version
        request._request.GET = query_params

        # Call the standard list method which handles filtering and pagination
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        if self._cached_queryset is not None:
            return self._cached_queryset

        # Get project ranking
        projects = Project.objects.filter(is_draft=False, is_active=True)

        if "sectors" in self.request.query_params:
            _sector_names = self.request.query_params.get("sectors")
            sector_names, err = sanitize_sector_inputs(_sector_names)

            # ommiting sectors if parsing error
            if err:
                logger.error(
                    "Passed sectors are not in list format: 'error':'{}','sector_keys':{}".format(
                        err, _sector_names
                    )
                )
            else:
                projects = projects.filter(
                    Q(project_sector_mapping__sector__name__in=sector_names)
                    | Q(
                        project_sector_mapping__sector__relates_to_sector__name__in=sector_names
                    )
                )

        if "hub" in self.request.query_params:
            # retrieve hub and its parents
            hub = Hub.objects.filter(url_slug=self.request.query_params["hub"]).first()
            if not hub:
                return projects.none()

            hubs = [hub]
            if hub.parent_hub:
                hubs.append(hub.parent_hub)

            for current_hub in hubs:
                if current_hub.hub_type == Hub.SECTOR_HUB_TYPE:
                    sectors = current_hub.sectors.all()
                    sector_ids = [x.id for x in sectors]

                    projects = projects.filter(
                        project_sector_mapping__sector_id__in=sector_ids
                    ).distinct()

                elif current_hub.hub_type == Hub.LOCATION_HUB_TYPE:
                    location = current_hub.location.all()[0]
                    location_multipolygon = location.multi_polygon
                    projects = projects.filter(Q(loc__country=location.country))
                    if location_multipolygon:
                        projects = projects.filter(
                            Q(loc__multi_polygon__coveredby=(location_multipolygon))
                            | Q(loc__centre_point__coveredby=(location_multipolygon))
                        ).annotate(
                            distance=Distance(
                                "loc__centre_point", location_multipolygon
                            )
                        )

                elif current_hub.hub_type == Hub.CUSTOM_HUB_TYPE:
                    projects = projects.filter(related_hubs=current_hub)

        if "collaboration" in self.request.query_params:
            collaborators_welcome = self.request.query_params.get("collaboration")
            if collaborators_welcome == "yes":
                projects = projects.filter(collaborators_welcome=True)
            if collaborators_welcome == "no":
                projects = projects.filter(collaborators_welcome=False)

        if "status" in self.request.query_params:
            statuses = self.request.query_params.get("status").split(",")
            projects = projects.filter(status__name__in=statuses)

        if "skills" in self.request.query_params:
            skill_names = self.request.query_params.get("skills").split(",")
            skills = Skill.objects.filter(name__in=skill_names)
            # Use .distinct to dedupe selected rows.
            # https://docs.djangoproject.com/en/dev/ref/models/querysets/#django.db.models.query.QuerySet.distinct
            # We then sort by rating, to show most relevant results
            projects = projects.filter(skills__in=skills).distinct()

        if "organization_type" in self.request.query_params:
            organization_type_names = self.request.query_params.get(
                "organization_type"
            ).split(",")
            organization_types = OrganizationTags.objects.filter(
                name__in=organization_type_names
            )
            organization_taggings = OrganizationTagging.objects.filter(
                organization_tag__in=organization_types
            )
            project_parents = ProjectParents.objects.filter(
                parent_organization__tag_organization__in=organization_taggings
            )
            projects = projects.filter(project_parent__in=project_parents)

        if "place" in self.request.query_params and "osm" in self.request.query_params:
            location_data = get_location_with_range(self.request.query_params)
            projects = (
                projects.filter(
                    Q(loc__country=location_data["country"])
                    & (
                        Q(
                            loc__multi_polygon__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                        | Q(
                            loc__centre_point__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                    )
                )
                .annotate(
                    distance=Distance("loc__centre_point", location_data["location"])
                )
                .order_by("distance")
            )

        if "country" and "city" in self.request.query_params:
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country"),
                city=self.request.query_params.get("city"),
            )
            projects = projects.filter(loc__in=location_ids)

        if (
            "city" in self.request.query_params
            and "country" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                city=self.request.query_params.get("city")
            )
            projects = projects.filter(loc__in=location_ids)

        if (
            "country" in self.request.query_params
            and "city" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country")
            )
            projects = projects.filter(loc__in=location_ids)

        project_ids = projects.values_list("id", flat=True)

        if USING_CACHE:
            # preparation
            cache_keys = [
                generate_project_ranking_cache_key(project_id=pid)
                for pid in project_ids
            ]
            # get cached rankings
            cached_rankings = cache.get_many(cache_keys)
            rankings = {
                pid: cached_rankings[key]
                for key, pid in zip(cache_keys, project_ids)
                if key in cached_rankings
            }

            # recalculate cache misses
            project_ids_cache_misses = [
                pid
                for key, pid in zip(cache_keys, project_ids)
                if key not in cached_rankings
            ]
            if len(project_ids_cache_misses) > 0:
                recalculated_rankings = ProjectRanking().calculate_all_project_rankings(
                    project_ids=project_ids_cache_misses
                )
                # merge dicts:
                rankings = rankings | recalculated_rankings
        else:
            rankings = ProjectRanking().calculate_all_project_rankings()

        preferred_order = Case(
            *(
                When(id=id, then=position)
                for position, id in enumerate(project_ids, start=1)
            )
        )

        # queryset of project parents for prefetching

        project_parent_qs = ProjectParents.objects.select_related(
            # TODO: look into organizations and optimize further with prefetching and select related (e.g. sectors)
            "parent_organization__location",
            # TODO: look into user and userprofile and optimize further with prefetching and select relate
            "parent_user__user_profile__location",
        ).prefetch_related(
            Prefetch(
                "parent_user__donation_user",
                queryset=Donation.objects.all(),
            ),
            Prefetch(
                "parent_user__userbadge_user",
                queryset=UserBadge.objects.select_related("badge"),
            ),
            # Prefetch(),
        )

        queryset = (
            Project.objects.filter(is_draft=False, is_active=True)
            .select_related("loc", "language", "status")
            .prefetch_related(
                # "skills",
                "tag_project",  # TODO: remove after updating frontend to use sectors
                Prefetch(
                    "project_parent",
                    queryset=project_parent_qs,
                ),
                "project_collaborator",
                Prefetch(
                    "project_sector_mapping",
                    queryset=ProjectSectorMapping.objects.select_related("sector"),
                ),
            )
            .filter(id__in=project_ids)
            .annotate(
                comment_count=Count("project_comment", distinct=True),
                like_count=Count("project_liked", distinct=True),
            )
            .order_by(preferred_order)
        )
        # cache queryset
        self._cached_queryset = queryset

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        _context = create_context_for_hub_specific_sector(self.request)
        context.update({**_context})
        return context
