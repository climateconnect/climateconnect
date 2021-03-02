from organization.models import Organization, OrganizationMember


def check_organization(organization_id: str) -> Organization:
    try:
        organization = Organization.objects.get(id=int(organization_id))
    except Organization.DoesNotExist:
        organization = None
    return organization

def add_organization_member(organization, user, user_role, role_in_organization):
    OrganizationMember.objects.create(
                    organization=organization, user=user, role=user_role, role_in_organization=role_in_organization
                )
                    
    return