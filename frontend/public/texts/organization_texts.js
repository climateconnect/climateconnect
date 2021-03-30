import { Link } from "@material-ui/core";
import React from "react";

export default function getOrganizationTexts({ organization }) {
  return {
    log_in_to_edit_organization: {
      en: "You have to log in to edit an organization.",
      de: "Du musst dich einloggen, um eine Organisation zu bearbeiten.",
    },
    successfully_edited_organization: {
      en: "You have successfully edited your organization.",
      de: "",
    },
    image_required_error: {
      en: 'Please add an avatar image by clicking the "Add Image" button.',
      de: "",
    },
    type_required_errror: {
      en:
        'Please choose at least one organization type by clicking the "Add Type" button under the avatar.',
      de: "",
    },
    name_required_error: {
      en: "Please type your organization name under the avatar image",
      de: "",
    },
    location_required_error: {
      en: "Please specify your location",
      de: "",
    },
    how_to_describe_organization: {
      en:
        "Describe what your organization is doing, how you work and what impact you have on climate change. Please only use english!",
      de: "",
    },
    we_are_a_suborganization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "",
    },
    parent_organization: {
      en: "Parent organization",
      de: "",
    },
    edit_parent_organization_label: {
      en: "Edit your parent organization",
      de: "",
    },
    edit_parent_organization_helper_text: {
      en: "Type the name of your parent organization",
      de: "",
    },
    no_organization_found: {
      en: "No organizations found. Try changing or removing your filter or search query.",
      de: "",
    },
    to_manage_org_members: {
      en: "to manage the members of this organization",
      de: "",
    },
    you_are_not_a_member_of_this_organization: {
      en: "You are not a member of this organization.",
      de: "",
    },
    go_to_org_page_and_click_join_to_join_it: {
      en: (
        <>
          Go to the <Link href={"/organizations/" + organization?.url_slug}>organization page</Link>{" "}
          and click join to join it.
        </>
      ),
      de: <></>,
    },
    no_permission_to_manage_members_of_this_org: {
      en: "No Permission to Manage Members of this Organization",
      de: "",
    },
    need_to_be_admin_to_manage_org_members: {
      en: "You need to be an administrator of the organization to manage organization members.",
      de: "",
    },
    manage_organizations_members: {
      en: "Manage organization's Members",
      de: "",
    },
    you_have_to_log_in_to_manage_organization_members: {
      en: "You have to log in to manage an organization's members.",
      de: "",
    },
    successfully_updated_org_members: {
      en: "You have successfully updated your organization members",
      de: "",
    },
    there_must_be_exactly_one_creator_of_organization: {
      en: "There must be exactly one creator of an organization.",
      de: "",
    },
    manage_members_of_organization_name: {
      en: `Manage members of ${organization?.name}`,
      de: ``,
    },
    search_for_your_organizations_members: {
      en: "Search for your organization's members",
      de: "",
    },
    type_name_of_next_team_member: {
      en: "Type the name of the team member you want to add next.",
      de: "",
    },
    role_in_organization: {
      en: "Role in organization",
      de: "",
    },
    edit_organization: {
      en: "Edit organization",
      de: "",
    },
    to_see_this_organizations_full_information: {
      en: "to see this organization's full information",
      de: "",
    },
    this_organizations_projects: {
      en: "This organization's Projects",
      de: "",
    },
    this_organization_has_not_listed_any_projects_yet: {
      en: "This organization has not listed any projects yet!",
      de: "",
    },
    none_of_the_members_of_this_organization_has_signed_up_yet: {
      en: "None of the members of this organization has signed up yet!",
      de: "",
    },
    return_to_home: {
      en: "Return to home.",
      de: "",
    },
    not_found_lowercase: {
      en: "not found.",
      de: "",
    },
    organizations_logo: {
      en: `${organization?.name}'s logo`,
      de: ``,
    },
    you_have_not_selected_a_parent_organization_either_untick: {
      en:
        "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization.",
      de: "",
    },
    an_organization_with_this_name_already_exists: {
      en: "An organization with this name already exists.",
      de: "",
    },
    //Context: An organization with this name already exists. Click here to see it.
    to_see_it: {
      en: "to see it.",
      de: "",
    },
    you_have_successfully_created_an_organization_you_can_add_members: {
      en:
        "You have successfully created an organization! You can add members by scrolling down to the members section.",
      de: "",
    },
    to_create_an_organization: {
      en: "to create an organization",
      de: "",
    },
    create_an_organization: {
      en: "Create an Organization",
      de: "",
    },
    organization_name: {
      en: "Organization name",
      de: "",
    },
    we_are_a_sub_organization_of_a_larger_organization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "",
    },
    parent_organization_name: {
      en: "Parent organization name",
      de: "",
    },
    search_for_your_parent_organization: {
      en: "Search for your parent organization",
      de: "",
    },
    type_the_name_of_your_parent_organization: {
      en: "Type the name of your parent organization.",
      de: "",
    },
    i_verify_that_i_am_an_authorized_representative_of_this_organization: {
      en: `I verify that I am an authorized representative of this organization 
      and have the right to act on its behalf in the creation and management of this page.`,
      de: ``,
    },
    almost_done_here_you_can_customize_your_organization_page_and_add_details: {
      en: "Almost done! Here you can customize your organization page and add details",
      de: "",
    },
  };
}
