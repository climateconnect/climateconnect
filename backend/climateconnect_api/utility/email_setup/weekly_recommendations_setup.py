from django.conf import settings
from django.contrib.auth.models import User
from typing import List

from organization.models.project import Project
from organization.models.organization import Organization
from organization.models.members import OrganizationMember
from organization.serializers.project import ProjectStubSerializer
from organization.serializers.organization import OrganizationCardSerializer
from ideas.models.ideas import Idea
from ideas.serializers.idea import IdeaSerializer


def create_messages_for_weekly_recommendations(user_ids) -> List:
    """This function creates variables for mailjet that contain user information like name and email for mailjet batch processing"""
    users = User.objects.filter(id__in=user_ids).values_list(
        "email", "first_name", "last_name"
    )
    messages = []
    for user in users:
        messages.append(
            {
                "To": [{"Email": user[0], "Name": user[1] + " " + user[2]}],
                "Variables": {"FirstName": user[1]},
            }
        )
    return messages


def create_global_variables_for_weekly_recommendations(
    entity_ids: dict,
    lang_code: str,
    is_in_hub: bool = False,
):
    """This function creates all global variables for mailjet that contain the information about all shown content,
    namely the projects, organizations or ideas"""
    content = []

    projects = Project.objects.filter(id__in=entity_ids["project"])
    project_serializer = ProjectStubSerializer(
        projects, many=True, context={"language_code": lang_code}
    )

    for entity in project_serializer.data:
        content.append(generate_project_mailjet_vars(entity, is_in_hub))

    organizations = Organization.objects.filter(id__in=entity_ids["organization"])
    org_serializer = OrganizationCardSerializer(
        organizations, many=True, context={"language_code": lang_code}
    )
    for entity in org_serializer.data:
        content.append(generate_org_mailjet_vars(entity, is_in_hub))

    ideas = Idea.objects.filter(id__in=entity_ids["idea"])
    idea_serializer = IdeaSerializer(
        ideas, many=True, context={"language_code": lang_code}
    )
    for entity in idea_serializer.data:
        content.append(generate_idea_mailjet_vars(entity))

    return content


def generate_project_mailjet_vars(entity: dict, is_in_hub: bool):
    """This function creates all global variables for mailjet for a project"""
    main_page = "https://climateconnect.earth"
    url = (
        (settings.FRONTEND_URL + "/projects/" + entity["url_slug"])
        if entity["url_slug"]
        else main_page
    )
    image_url = (settings.BACKEND_URL + entity["image"]) if entity["image"] else ""
    location = entity["location"] if not is_in_hub else ""
    for parent in entity["project_parents"]:
        if parent["parent_organization"]:
            creator = parent["parent_organization"]["name"]
            if parent["parent_organization"]["thumbnail_image"]:
                creator_image = (
                    settings.BACKEND_URL
                    + parent["parent_organization"]["thumbnail_image"]
                )
            else:
                creator_image = ""
        elif parent["parent_user"]:
            creator = (
                parent["parent_user"]["first_name"]
                + " "
                + parent["parent_user"]["last_name"]
            )
            if parent["parent_user"]["thumbnail_image"]:
                creator_image = (
                    settings.BACKEND_URL + parent["parent_user"]["thumbnail_image"]
                )
            else:
                creator_image = ""
        else:
            creator = ""
            creator_image = ""
    if entity["tags"]:
        category = entity["tags"][0]["project_tag"]["name"]
    else:
        category = ""

    card = generate_project_card(
        entity["name"],
        url,
        image_url,
        location,
        creator,
        creator_image,
        category,
    )
    return {
        "card": card,
        "shortDescription": entity["short_description"],
        "url": url,
        "type": "organization",
    }


def generate_org_mailjet_vars(entity: dict, is_in_hub: bool):
    """This function creates all global variables for mailjet for an organization"""
    main_page = "https://climateconnect.earth"
    url = (
        (settings.FRONTEND_URL + "/organizations/" + entity["url_slug"])
        if entity["url_slug"]
        else main_page
    )
    image_url = (
        (settings.BACKEND_URL + entity["thumbnail_image"])
        if entity["thumbnail_image"]
        else ""
    )
    location = entity["location"] if not is_in_hub else ""

    org_creators = OrganizationMember.objects.filter(
        organization__id=entity["id"], role__role_type=2
    ).values_list(
        "user__first_name",
        "user__last_name",
        "user__user_profile__thumbnail_image",
    )
    creator = ""
    creator_image = ""
    # only one creator possible but the query needs to be iterated through
    for org_creator in org_creators:
        creator += org_creator[0] + " " + org_creator[1]
        creator_image = settings.BACKEND_URL + org_creator[2] if org_creator[2] else ""

    card = generate_org_card(
        entity["name"],
        url,
        image_url,
        location,
        creator,
        creator_image,
        str(entity["members_count"]),
        str(entity["projects_count"]),
    )
    return {
        "card": card,
        "shortDescription": entity["short_description"],
        "url": url,
        "type": "organization",
    }


def generate_idea_mailjet_vars(entity: dict):
    """This function creates all global variables for mailjet for an idea"""
    # url for ideas: URL/hubs/<hubUrl>?idea=<url_slug>#ideas
    url = (
        settings.FRONTEND_URL
        + "/hubs/"
        + entity["hub_shared_in"]["url_slug"]
        + "?idea="
        + entity["url_slug"]
        + "#ideas"
    )
    image_url = (
        (settings.BACKEND_URL + entity["thumbnail_image"])
        if entity["thumbnail_image"]
        else ""
    )
    creator = (
        entity["user"]["first_name"] + " " + entity["user"]["last_name"]
        if entity["user"]
        else ""
    )
    creator_image = (
        settings.BACKEND_URL + entity["user"]["image"]
        if entity["user"]["image"]
        else ""
    )
    hub_icon = settings.BACKEND_URL + entity["hub_shared_in"]["icon"]

    card = generate_idea_card(
        entity["name"],
        url,
        image_url,
        creator,
        creator_image,
        hub_icon,
    )
    return {
        "card": card,
        "shortDescription": entity["short_description"],
        "url": url,
        "type": "idea",
    }


def generate_project_card(
    name, url, thumbnail_url, location, creator, creator_image_url, category
):
    """This function creates the html code for a project card that gets copied into the mailjet email for weekly recommendatin newsletter"""
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                        <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""
                    <div>
                      <span style="display:inline-flex;text-align:left;align-items:center;">
{creator_image_htmlsection}
                        <h6 style="margin-top:8px;margin-bottom:8px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{creator}
                        </h6>
                      </span>
                    </div>           
        """
    else:
        creator_htmlsection = ""

    if location:
        location_htmlsection = f"""
                    <div>
                      <span style="display:inline-flex;text-align:left;align-items:center;">
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">place</span>
                        <h6 style="margin-top:6px;margin-bottom:6px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{location}
                        </h6>
                      </span>
                    </div>
        """
    else:
        location_htmlsection = ""

    if category:
        category_htmlsection = f"""
                    <div>
                    <span style="display:inline-flex;text-align:left;align-items:center;">
                        <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: rgba(0, 0, 0, 0.87)">explore</span>
                        <h6 style="margin-top:6px;margin-bottom:2px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{category}
                        </h6>
                    </span>
                    </div>
        """
    else:
        category_htmlsection = ""

    card = f"""<div style="padding:8px;box-sizing:border-box;font-size:14px;font-weight:400;font-family:open sans;line-height:20px;">
            <a href="{url}" target="_blank" style="box-sizing:inherit;color: black; text-decoration: none;">
              <div style="box-sizing:inherit;height:350px;background-color:#FFF;border:1px solid #EEE;border-radius:3px;
              color: rgba(0, 0, 0, 0.87);transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;display:flex;flex-direction:column;overflow:hidden;box-shadow: rgb(0 0 0 / 16%) 3px 3px 6px;">
                <div style="height:175px;box-sizing: inherit;display: block;background-size: cover;background-repeat: no-repeat;background-position: center;background-image: url({thumbnail_url});">

                </div>
                <div style="box-sizing:inherit;display:block;">
                  <div style="box-sizing:inherit;display:block;margin-bottom:6px;padding:16px 16px 0px;">
                    <h2 style="font-family:open sans; font-size:15px;font-weight:700;line-height:24px">{name}</h2>
                  </div>
                  <div style="box-sizing:inherit;display:block;padding:0px 16px 16px;margin-left:auto;margin-right:auto;">
{creator_htmlsection}
{location_htmlsection}
{category_htmlsection}
                  </div>
                </div>
              </div>
            </a>
          </div>
          """
    return card


def generate_org_card(
    name,
    url,
    thumbnail_url,
    location,
    creator,
    creator_image_url,
    members_count,
    projects_count,
):
    """This function creates the html code for an organization card that gets copied into the mailjet email for weekly recommendatin newsletter"""
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                            <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                    <span class="material-icons" style="display:block;flex-basis:40px;flex-grow:0;flex-shrink:0;font-size:20px;width:40px;color: #207178">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""
                <div style="display:block;margin-top:20px">
                    <span style="align-items:center;display:grid;margin-bottom:4px;grid-template-columns: 40px min-content;justify-content:center;text-align:center;">
{creator_image_htmlsection}
                      <span style="font-family:open sans;font-size:14px;font-weight:400;line-height:20px;overflow:hidden;max-width:220px;text-align:center">{creator}</span>
                    </span>
                  </div>
        """
    else:
        creator_htmlsection = ""

    if location:
        location_htmlsection = f"""
                  <div style="display:block;margin-top:20px">
                    <span style="align-items:center;display:grid;margin-bottom:4px;grid-template-columns: 40px min-content;justify-content:center;text-align:center;">
                      <span class="material-icons" style="display:block;flex-basis:40px;flex-grow:0;flex-shrink:0;font-size:20px;width:40px;color:#207178">place</span>
                      <span style="font-family:open sans;font-size:14px;font-weight:400;line-height:20px;overflow:hidden;max-width:220px;text-align:center">{location}</span>
                    </span>
                  </div>        
        """
    else:
        location_htmlsection = ""

    card = f"""   
          <div style="padding:8px;color: rgba(0, 0, 0, 0.87);line-height:20px;">
            <a href="{url}" target="_blank" style="color: black; text-decoration: none;">
              <div style="display:flex;flex-direction:column;height:350px;margin:0px;background-color:rgb(241,241,241);background-size: calc(100% - 1px) 100%;border:1px solid rgba(0,0,0,0.12);border-radius:5px;border-image-repeat:stretch;box-shadow:rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;overflow:hidden;box-sizing:border-box;display:grid;grid-template-rows: min-content;transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;padding:0 14px;text-align:center;">
                <div style="display:block;">
                  <div style="height:80px;width80px;display:flex;justify-content:center;margin:24px auto 0px;overflow:hidden;position:relative;">
                    <img style="max-width: 220px;margin:0px;padding:0px;width:80px;border-radius:50%;object-fit:cover;" src="{thumbnail_url}" alt="" />
                  </div>

                  <div style="display:block;">
                    <h2 style="margin:5px;display:inline-block;line-height:32px;font-family:open sans;font-size:20px;font-weight:700;overflow:hidden;text-overflow:ellipsis;">{name}</h2>
                  </div>
                </div>
                <div style="padding:0px;display:grid;box-sizing:border-box;grid-template-rows: min-content;">
                  {creator_htmlsection}
                  {location_htmlsection}
                </div>
                <div style="box-sizing:border-box;align-items:center;align-self:end;display: grid;margin-bottom: 10px;padding:8px;grid-template-columns: 1fr 1fr;>
                    <div style="box-sizing:inherit;font-size: 14px;font-family: Open Sans;font-weight: 400;line-height: 20px;float: right;display: grid;margin-right: 20px;justify-content: center;grid-template-columns: 40px min-content;list-style-type: none;">
                        <span style="box-sizing:inherit;align-items:center;text-align:center;float: right;display: grid;margin-right: 20px;justify-content: center;grid-template-columns: 40px min-content;font-size:14px;font-family: Open Sans;font-weight: 400;line-height: 20px;">
                            <span class="material-icons" style="width:24px;height:24px;display: inline-block;font-size: 24px;flex-shrink: 0;overflow:hidden; text-align:center;color: #207178">group</span>
                            <p style="box-sizing:inherit;font-size: 1rem;font-family: Open Sans;font-weight: 400;line-height: 1.5;margin:0px;display: block;list-style-type: none;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 0px;margin-inline-end: 0px;text-align: center;color: rgba(0, 0, 0, 0.87);">
                                {members_count}
                            </p>
                        </span
                    </div>
                    <div style="box-sizing:inherit;margin-left: 8px;font-size: 14px;font-family: Open Sans;font-weight: 400;line-height: 20px;display:block;text-align:center;">
                        <span style="align-items:center;box-sizing:inherit;float: left;display: grid;margin-left: 20px;justify-content: center;grid-template-columns: 40px min-content;">
                            <span class="material-icons" style="width:24px;height:24px;display: inline-block;font-size: 24px;flex-shrink: 0;overflow:hidden; text-align:center;color: #207178">assignment</span>
                            <p style="display: block;font-size: 1rem;font-family: Open Sans;font-weight: 400;line-height: 1.5;margin:0px;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 0px;margin-inline-end: 0px;box-sizing:inherit;text-align: center;color: rgba(0, 0, 0, 0.87);">
                                {projects_count}
                            </p>
                        </span>
                    </div>
                </div>
              </div>
            </a>
          </div>
    """
    return card


def generate_idea_card(name, url, thumbnail_url, creator, creator_image_url, hub_icon):
    """This function creates the html code for an idea card that gets copied into the mailjet email for weekly recommendatin newsletter"""
    if creator_image_url:
        creator_image_htmlsection = f"""
                        <div style="justify-content:center;display:flex;height:20px;width:20px;overflow:hidden;border-radius:50%;">
                        <img src={creator_image_url} style="object-fit:cover;">
                        </div> 
        """
    else:
        creator_image_htmlsection = f"""
                    <span class="material-icons" style="display:block;flex-basis:40px;font-size:20px;color: #bdbdbd">account_circle</span>
        """

    if creator:
        creator_htmlsection = f"""                 
                <div>
                    <span style="display:inline-flex;text-align:left;align-items:center;">
{creator_image_htmlsection}
                      <h6 style="margin-top:8px;margin-bottom:8px;display: inline-block;margin-left: 8px;white-space: nowrap;vertical-align: middle;font-weight:500;font-family:open sans;font-size:14px;">{creator}
                      </h6>
                    </span>
                  </div>
        """

    card = f"""
          <div style="padding:8px;color:rgba(0, 0, 0, 0.87);line-height:20px;font-family:open sans;font-size:14px;font-weight:400;">
            <a href="{url}" target="_blank" style="color: black; text-decoration: none;">
              <div style="display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;height:350px;background-color:rgb(248,248,248);border-radius:16px;border:3px solid #207178;overflow:hidden;text-align:center;transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;box-shadow: rgb(0 0 0 / 16%) 3px 3px 6px;">
                <div style="box-sizing:inherit;display:block;padding:8px;font-family:open sans;font-size:14px;font-weight:400;">
                  <h2 style="font-size:18px;font-weight:600;line-height:27px;margin:0px;">{name}</h2>
                  {creator_htmlsection}
                  <div style="box-sizing:inherit;display: flex;margin-top: 8px;align-items: center;justify-content: center;">
                    <img style="box-sizing:inherit; fill: #207178;color: #207178;margin-right: 12px;" src="{hub_icon}">
                    <div style="box-sizing:inherit;width: 47px;height: 40px;position: relative;margin-left: 12px;">
                        <div style="box-sizing:inherit; display:block;left: 0;height: 40px;position: absolute;">
                            <div style="box-sizing:inherit;width: 100%;bottom: 0px;height: 100%;position: absolute;background: url(https://climateconnect.earth/images/planet-earth-heart.svg) center bottom / 100% no-repeat;">
                                <img style="" src="https://climateconnect.earth/images/planet-earth-heart.svg"> 
                            </div>
                        </div>
                    </div>
                  </div>

                </div>
                <div style="box-sizing:inherit;display:block;">
                  <div style="background-repeat: no-repeat;display:block;margin:0px;padding:0px;background-size:100%;background-origin:content-box;width:100%;background-position-y:50%;background-position-x:50%;background-image: url({thumbnail_url});">
                    <img style="margin:0px;padding:0px;width:100%;object-fit:cover;border-radius:inherit;background-position-y:inherit;visibility:hidden;" src="{thumbnail_url}" alt="" />
                  </div>
                </div>
              </div>
            </a>
          </div>
    """
    return card

