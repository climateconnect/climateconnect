from typing import (Dict, Optional)
from rest_framework import status
from rest_framework.response import Response
from enum import Enum
from django.utils import timezone
from django.db.models import Q

from climateconnect_api.models import Role
from .project import add_project_member
from .organization import add_organization_member
from ..models.members import MembershipRequests
from . import MembershipTarget, RequestStatus
import logging

logger = logging.getLogger(__name__)







class MembershipRequestsManager(object):
    """
    Manages the project/org membership requests. 
    2 instantiations possible: 
    A. Either to create a new request. In that case, supply the paramn: user, membership_target, user_availability, project, organization, message
    B. To manage an existing request, provide the request id only as a kwargs
    """
    def __init__(self,**kwargs):
        
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
                raise NotImplementedError(f"{membership_target} is not implemented!")
            self.user = user
            


            # check if the request exists already
            n = MembershipRequests.objects.filter(user=self.user
                                          ,target_membership_type=self.membership_target.value
                                          ,target_project_id=self.project
                                          ,target_organization_id=self.organization).count()


            
            self.duplicate_request = True if n > 0 else False
            self.user_availability = user_availability
            self.message = kwargs['message'] 
            self.membership_request = None



        else: #id of request is supplied
            self._request_operation_invalid = False
            self.membership_request = MembershipRequests.objects.get(id=int(kwargs['membership_request_id']))
            self.membership_target = MembershipTarget(self.membership_request.target_membership_type)
            self.user = self.membership_request.user
            self.user_availability = self.membership_request.availability
            self.project = self.membership_request.target_project
            if 'project' in kwargs:
                if kwargs['project'] != self.membership_request.target_project: self._request_operation_invalid = True



        return



    def create_membership_request(self,**kwargs):
        if self.duplicate_request: return False 
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
        if self.membership_request is None: raise Exception("Cannot approve request without having a request id")
        if self._request_operation_invalid: raise Exception("The target project is inconsistent with the original request")

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



