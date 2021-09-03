from django.db import DefaultConnectionProxy
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from climate_match.permissions import  UserResourceMatchPermission
from climate_match.utility.sort_resources import sort_user_resource_preferences
from climateconnect_api.models import UserProfile
from ideas.serializers.idea import IdeaSerializer
from ideas.models import Idea
from organization.serializers.organization import OrganizationSerializer
from organization.serializers.project import ProjectSerializer
from organization.models import Project, Organization

import logging
logger = logging.getLogger(__name__)


class UserResourcesMatchView(APIView):
	permission_classes = [UserResourceMatchPermission]

	def get(self, request, url_slug):
		"""
		params required in URL: `range_start` and `range_end`. example: range_start=0&range_end=10
		"""
		try:
			user_profile = UserProfile.objects.get(url_slug=str(url_slug))
		except UserProfile.DoesNotExist:
			return Response({
				'message': 'Profile not found'
			}, status=status.status.HTTP_404_NOT_FOUND)
		
		# Get offset number from frontend to return range of data instead of returning the entire list
		# This range start from 0 to 
		if 'range_start' not in request.query_params or 'range_end' not in request.query_params:
			return Response({'message': 'Missing parameters'}, status=status.HTTP_400_BAD_REQUEST)
		
		range_start = int(request.query_params.get('range_start'))
		range_end = int(request.query_params.get('range_end'))
		
		LOGGER_PREFIX = 'ResourceNotFound'
		user_resources = sort_user_resource_preferences(user=user_profile.user)
		total_resources = len(user_resources)
		user_matched_resources = []
		for resource in user_resources[range_start:range_end]:
			resource_id = resource['resource_id']
			table_name = resource['table_name']
			if table_name == 'project':
				try:
					project = Project.objects.get(id=resource_id)
				except Project.DoesNotExist:
					logger.info(f"{LOGGER_PREFIX} Project not found for resource id {resource_id}")
					continue
				resource_data = ProjectSerializer(project).data
			elif table_name == 'idea':
				try:
					idea = Idea.objects.get(id=resource_id)
				except Idea.DoesNotExist:
					logger.info(f"{LOGGER_PREFIX} Idea not found for resource id {resource_id}")
					continue
				resource_data = IdeaSerializer(idea).data
			elif table_name == 'organization':
				try:
					organization = Organization.objects.get(id=resource_id)
				except Organization.DoesNotExist:
					logger.info(f"{LOGGER_PREFIX} Organization not found for resource id {resource_id}")
					continue
				resource_data = OrganizationSerializer(organization).data
			else:
				logger.info(f"{LOGGER_PREFIX} Unknown table name {table_name}")
				continue
			user_matched_resources.append(resource_data)
		
		return Response({
			'current_range_start': range_start,
			'current_range_end': range_end,
			'total_resources': total_resources,
			'matched_resources' : user_matched_resources
		}, status=status.HTTP_200_OK)
