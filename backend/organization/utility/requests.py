from typing import (Dict, Optional)
from rest_framework import status
from rest_framework.response import Response
from enum import Enum
from django.utils import timezone
from django.db.models import Q

from climateconnect_api.models import Role
from organization.utility.project import add_project_member,is_part_of_project
from organization.utility.organization import add_organization_member
from organization.models.members import MembershipRequests
from organization.utility import MembershipTarget, RequestStatus
import logging

logger = logging.getLogger(__name__)

class MembershipRequestsManager(object):
    """
    Manages the project/org membership requests.

    2 instantiations possible:
    A. Either to create a new request. In that case, supply the params: user, membership_target, user_availability, project, organization, message
    B. To manage an existing request, provide the request id only as a kwargs. If project or organization are added, then the class check for the consistency of the supplied id
    and the corresponding project/ organization. If validation fails, property validation_failed will be True and errors property will contain a list of errors.
    """
    def __init__(self,**kwargs):

        self.validation_failed = False
        self.duplicate_request = False

        self.errors = list()
        if 'membership_request_id' not in kwargs.keys(): #new request
            user = kwargs['user']
            membership_target = kwargs['membership_target']
            user_availability = kwargs['user_availability']
            self.membership_target = membership_target
            if self.membership_target == MembershipTarget.PROJECT:
                self.project = kwargs['project']
                self.organization = None
            elif self.membership_target == MembershipTarget.ORGANIZATION:
                self.organization = kwargs['organization']
                self.project = None
            else:
                self.validation_failed=True
                self.errors.append(NotImplementedError(f"{membership_target} is not implemented!"))
            self.user = user
            self.user_availability = user_availability
            self.message = kwargs['message']
            self.membership_request = None

            # check if the request exists already
            n = MembershipRequests.objects.filter(user=self.user
                                          ,target_membership_type=self.membership_target.value
                                          ,target_project_id=self.project
                                          ,target_organization_id=self.organization).count()



            if n > 0:
                self.validation_failed = True
                self.errors.append("Request Already Exists")
                self.duplicate_request = True


        else: #id of request is supplied
            self.membership_request = MembershipRequests.objects.filter(id=int(kwargs['membership_request_id']))
            ## check if user is already part of a project


            if self.membership_request.count()!=1 :
                self.corrupt_membership_request_id = True
                self.validation_failed = True
                self.errors.append(f"More than a record or not a single record was found in membership requests for request id {int(kwargs['membership_request_id'])}")
            else:
                self.membership_request = self.membership_request.first()
                user_in_project = is_part_of_project(user=self.membership_request.user,project=self.membership_request.target_project)
                if user_in_project:
                    self.validation_failed = True
                    self.errors.append("User is already a member of the project")
                self.corrupt_membership_request_id = False
                self.membership_target = MembershipTarget(self.membership_request.target_membership_type)
                self.user = self.membership_request.user
                self.user_availability = self.membership_request.availability
                self.project = self.membership_request.target_project
                if 'project' in kwargs:
                    if kwargs['project'].id != self.membership_request.target_project.id:
                        self.validation_failed = True
                        self.errors.append("Inconsistent Project and Request")

        return

    def create_membership_request(self,**kwargs):
        if self.duplicate_request:
            return False

        request_obj = MembershipRequests.objects.create(user=self.user
                                                        ,target_membership_type=self.membership_target.value
                                                        ,target_project=self.project
                                                        ,target_organization=self.organization
                                                        ,availability=self.user_availability
                                                        ,requested_at=timezone.now()
                                                        ,message=self.message
                                                        ,request_status=RequestStatus.PENDING.value
                )

        request_id = request_obj.id
        return request_id




    def approve_request(self,**kwargs):


        self.membership_request.request_status = RequestStatus.APPROVED.value
        self.membership_request.approved_at = timezone.now()

        #create a record in ProjectMember
        user_role = Role.objects.filter(name="Member").first()
        if self.membership_target == MembershipTarget.PROJECT:
            add_project_member(
                        project=self.project
                        ,user=self.user
                        ,user_role=user_role
                        ,role_in_project=None
                        ,availability=self.user_availability
                    )
        elif self.membership_target == MembershipTarget.ORGANIZATION:

            add_organization_member(
                organization=self.organization
                ,user=self.user
                ,user_role=user_role
                ,role_in_organization=None
            )




        self.membership_request.save()


        return 0

    def reject_request(self,**kwargs):
        self.membership_request.request_status = RequestStatus.REJECTED.value
        self.membership_request.rejected_at = timezone.now()
        self.membership_request.save()
        return 0