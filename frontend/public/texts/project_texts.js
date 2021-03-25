import { Link } from "@material-ui/core";
import React from "react";

export default function getProjectTexts({ project }) {
  return {
    please_log_in_to_edit_project: {
      en: "Please Log In to Edit a project.",
      de: "",
    },
    to_edit_this_project: {
      en: "to edit this project",
      de: ", um dieses Project zu bearbeiten",
    },
    project_not_found: {
      en: "Project not Found",
      de: "",
    },
    project_does_not_exist: {
      en: "This project does not exist.",
      de: "",
    },
    to_create_a_project: {
      en: "to create a project",
      de: "",
    },
    not_a_member: {
      en: "You are not a member of this project",
      de: "",
    },
    "project page": {
      en: "project page",
      de: "",
    },
    and_ask_to_be_part_of_the_team: {
      en: "and ask to be part of the team",
      de: "",
    },
    no_permissions_to_edit_project: {
      en: "No Permission to Edit this project",
      de: "",
    },
    need_to_be_admin_to_manage_project_team: {
      en: "You need to be an administrator of the project to manage the team.",
      de: "",
    },
    edit_project: {
      en: "Edit Project",
      de: "",
    },
    edit_draft: {
      en: "Edit Draft",
      de: "",
    },
    no_projects_found: {
      en: "No projects found.",
      de: "",
    },
    project_image_of_project: {
      en: "Project image of project",
      de: "",
    },
    you_have_to_log_in_to_manage_a_projects_members: {
      en: "You have to log in to manage a project's members.",
      de: "",
    },
    please_log_in_to_manage_the_members_of_this_project: {
      en: "Please Log In to Manage the Members of this project",
      de: "",
    },
    to_manage_the_members_of_this_project: {
      en: "to manage the members of this project",
      de: "",
    },
    you_are_not_a_member_of_this_project: {
      en: "You are not a member of this project.",
      de: "",
    },
    go_to_project_page_and_click_join_to_join: {
      en: (
        <>
          Go to <Link href={"/projects/" + project?.url_slug}>the project page</Link> and click join
          to join it.
        </>
      ),
      de: <></>,
    },
    you_need_to_be_an_administrator_of_the_project_to_manage_project_members: {
      en: "You need to be an administrator of the project to manage project members.",
      de: "",
    },
    no_permission_to_manage_members_of_this_project: {
      en: "No Permission to Manage Members of this project",
      de: "",
    },
    manage_projects_members: {
      en: "Manage Project's Members",
      de: "",
    },
    you_have_successfully_updated_your_team: {
      en: "You have successfully updated your team",
      de: "",
    },
    there_must_be_exactly_one_creator_of_a_project: {
      en: "There must be exactly one creator of a project.",
      de: "",
    },
    manage_members_of_project: {
      en: `Manage members of {project.name}`,
      de: ``,
    },
    team: {
      en: "Team",
      de: "",
    },
    comments: {
      en: "Comments",
      de: "",
    },
    you_have_successfully_left_the_project: {
      en: "You have successfully left the project.",
      de: "",
    },
    please_log_in_to_follow_a_project: {
      en: (
        <>
          Please <Link href="/signin">log in</Link> to follow a project.
        </>
      ),
      de: "",
    },
    you_cant_leave_a_project_as_the_creator: {
      en: `You can't leave a project as the creator. Please give the creator role to another team member by clicking "Manage Members" in the team tab`,
      de: ``,
    },
    do_you_really_want_to_unfollow: {
      en: "Do you really want to unfollow?",
      de: "",
    },
    are_you_sure_that_you_want_to_unfollow_this_project: {
      en: (
        <>
          Are you sure that you want to unfollow this project?
          <br />
          You {"won't"} receive updates about it anymore
        </>
      ),
      de: <></>,
    },
    do_you_really_want_to_leave_this_project: {
      en: "Do you really want to leave this project?",
      de: "",
    },
    are_you_sure_that_you_want_to_leave_this_project: {
      en: "Are you sure that you want to leave this project?",
      de: "",
    },
    you_wont_be_part_of_the_team_anymore: {
      en: "You won't be part of the team anymore.",
      de: "",
    },
    you_are_the_only_member_of_this_project: {
      en: (
        <>
          Danger: You are the only member of this project. <br />
          If you leave the project it will be deactivated.
        </>
      ),
      de: "",
    },
    please_create_an_account_or_log_in_to_contact_a_projects_organizer: {
      en: "Please create an account or log in to contact a project's organizer.",
      de: "",
    },
    summary: {
      en: "Summary",
      de: "",
    },
    contact_the_projects_creator_with_just_one_click: {
      en: "Contact the project's creator with just one click!",
      de: "",
    },
    contact_creator: {
      en: "Contact creator",
      de: "",
    },
    followers: {
      en: "Followers",
      de: "",
    },
    follower: {
      en: "follower",
      de: "",
    },
    follow: {
      en: "Follow",
      de: "",
    },
    following: {
      en: "Following",
      de: "",
    },
    leave_project: {
      en: "Leave project",
      de: "",
    },
    in_collaboration_with: {
      en: "in collaboration_with",
      de: "",
    },
    total_duration: {
      en: "Total duration",
      de: "",
    },
    project_description: {
      en: "Project description",
      de: "",
    },
    this_project_hasnt_added_a_description_yet: {
      en: "This project hasn't added a description yet.",
      de: "",
    },
    this_project_is_not_looking_for_collaborators_right_now: {
      en: "This project is not looking for collaborators right now.",
      de: "",
    },
    progress: {
      en: "Progress",
      de: "",
    },
    follow_the_project_to_be_notified_when_they_make_an_update_post: {
      en: "Follow the project to be notified when they make an update post.",
      de: "",
    },
    to_fight_climate_change_we_all_need_to_work_together: {
      en: `To fight climate change, we all need to work together! If you like the project, offer to
      work with the team to make it a success!`,
      de: ``,
    },
    this_project_is_open_to_collaborators: {
      en: "This project is open to collaborators.",
      de: "",
    },
    helpful_skills_for_collaborating: {
      en: "Helpful skills for collaborating",
      de: "",
    },
    connections_to_these_organizations_could_help_the_project: {
      en: "Connections to these organizations could help the project",
      de: "",
    },
    to_see_this_projects_team_members: {
      en: "to see this project's team  members",
      de: "",
    },
    to_see_this_projects_followers: {
      en: "to see this project's followers",
      de: "",
    },
    we_could_not_find_any_members_of_this_project: {
      en: "We could not find any members of this project.",
      de: "",
    },
    allow_collaboration_on_your_project: {
      en: "Allow collaboration on your project?",
      de: "",
    },
    encourage_collaboration_to_make_your_project_a_success: {
      en: "Encourage collaboration to make your project a success?",
      de: "",
    },
    would_you_assist_in_the_replication_of_your_project: {
      en: "Would you assist in the replication of your project?",
      de: "",
    },
    add_skills_that_would_be_beneficial_for_collaborators_to_have: {
      en: "Add skills that would be beneficial for collaborators to have",
      de: "",
    },
    add_skills_that_are_helpful_to_make_your_project_a_success: {
      en: "Add skills that are helpful to make your project a success",
      de: "",
    },
    add_skills_that_are_helpful_to_replicate_your_project: {
      en: "Add skills that are helpful to replicate your project",
      de: "",
    },
    add_connections_that_would_be_beneficial_for_collaborators_to_have: {
      en: "Add connections that would be beneficial for collaborators to have",
      de: "",
    },
    add_connections_that_would_be_beneficial_to_make_your_project_a_success: {
      en: "Add connections that would be beneficial to make your project a success",
      de: "",
    },
    add_connection_that_would_be_beneficial_to_have_to_replicate_your_project: {
      en: "Add connection that would be beneficial to have to replicate your project",
      de: "",
    },
    to_share_a_project: {
      en: "to share a project",
      de: "",
    },
    share_your_climate_solution: {
      en: "Share your Climate Solution",
      de: "",
    },
    //Kontext: Followers of Projektname
    followers_of: {
      en: "Followers of",
      de: "",
    },
    this_project_does_not_have_any_followers_yet: {
      en: "This project does not have any followers yet.",
      de: "",
    },
    following_since: {
      en: "Following since",
      de: "",
    },
    delete_draft: {
      en: "Delete Draft",
      de: "",
    },
    delete_project: {
      en: "Delete Project",
      de: "",
    },
  };
}
