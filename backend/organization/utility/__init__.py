from enum import Enum 

class RequestStatus(Enum): 
   PENDING =  1
   APPROVED = 2
   REJECTED = 3

class MembershipTarget(Enum):
   ORGANIZATION = 1 
   PROJECT = 2