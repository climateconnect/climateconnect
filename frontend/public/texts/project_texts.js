import { Link } from "@material-ui/core";
import React from "react";

export default function getProjectTexts({ project, user, url_slug }) {
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
    you_can_not_add_the_same_connection_twice: {
      en: "You can not add the same connection twice.",
      de: "",
    },
    personal: {
      en: "Personal",
      de: "Persönlich",
    },
    personal_project: {
      en: "Personal Project",
      de: "",
    },
    organizations_project: {
      en: "Organization's project",
      de: "",
    },
    created_by: {
      en: "Created by",
      de: "",
    },
    project_status: {
      en: "Project status",
      de: "",
    },
    describe_your_project_in_detail_please_only_use_language: {
      en: "Describe your project in detail. Please only use English!",
      de: "",
    },
    // \n\n creates two newlines
    describe_your_project_in_more_detail: {
      en: `Describe your project in more detail.\n\n-What are you trying to achieve?\n-How are you trying to achieve it\n-What were the biggest challenges?\n-What insights have you gained during the implementation?`,
      de: ``,
    },
    add_connections: {
      en: "Add Connections",
      de: "",
    },
    connection: {
      en: "Connection",
      de: "",
    },
    add_a_helpful_connection: {
      en: "Add a helpful connection",
      de: "",
    },
    do_you_really_want_to_delete_your_project: {
      en: "Do you really want to delete your project?",
      de: "",
    },
    if_you_delete_your_project_it_will_be_lost: {
      en: "If you delete your project, it will be lost. Are you sure that you want to delete it?",
      de: "",
    },
    briefly_summarise_what_you_are_doing_up_to_240_characters: {
      en: "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!",
      de: "",
    },
    project_categories: {
      en: "Project categories",
      de: "",
    },
    project_website: {
      en: "Project website",
      de: "",
    },
    if_your_project_has_a_website_you_can_enter_it_here: {
      en: "If your project has a website, you can enter it here.",
      de: "",
    },
    edit_categories: {
      en: "Edit categories",
      de: "",
    },
    add_categories: {
      en: "Add categories",
      de: "",
    },
    project_name: {
      en: "Project name",
      de: "",
    },
    your_project_draft_is_missing_the_following_reqired_property: {
      en: "Your project draft is missing the following reqired property:",
      de: "",
    },
    you_have_successfully_edited_your_project: {
      en: "You have successfully edited your project.",
      de: "",
    },
    your_project_has_been_published_great_work: {
      en: "Your project has been published. Great work!",
      de: "",
    },
    save_changes_as_draft: {
      en: "Save Changes as draft",
      de: "",
    },
    save_as_draft: {
      en: "Save as draft",
      de: "",
    },
    you_have_successfully_deleted_your_project: {
      en: "You have successfully deleted your project.",
      de: "",
    },
    leave_without_saving_changes: {
      en: "Leave without saving changes?",
      de: "",
    },
    do_you_really_want_to_leave_without_saving_your_changes: {
      en: "Do you really want to leave without saving your changes?",
      de: "",
    },
    publish: {
      en: "Publish",
      de: "",
    },
    next_step: {
      en: "Next Step",
      de: "",
    },
    climate_action_projects_shared_by_climate_connect_users: {
      en: "Climate action projects shared by Climate Connect users",
      de: "",
    },
    climate_action_projects_shared_by_climate_connect_users_text: {
      en: `Find the best climate change solutions from around the world. Get involved, share your own
      solutions or spread effective projects and ideas to your location.`,
      de: ``,
    },
    show_all_projects: {
      en: "Show all projects",
      de: "",
    },
    what_is_the_climate_impact_of_the_idea: {
      en: "What is the climate impact of the idea?",
      de: "",
    },
    what_would_the_climate_impact_of_the_project_have_been: {
      en: "What would the climate impact of the project have been?",
      de: "",
    },
    what_was_or_is_the_climate_impact_of_the_project: {
      en: "What was/is the climate impact of the project?",
      de: "",
    },
    what_are_you_trying_to_achieve: {
      en: "What are you trying to achieve?",
      de: "",
    },
    what_were_you_trying_to_achieve: {
      en: "What were you trying to achieve?",
      de: "",
    },
    what_did_you_achieve: {
      en: "What did you achieve?",
      de: "",
    },
    what_are_you_achieving: {
      en: "What are you achieving?",
      de: "",
    },
    how_are_you_going_to_try_to_achieve_it: {
      en: "How are you going to try to achieve it?",
      de: "",
    },
    how_are_you_trying_to_achieve_it: {
      en: "How are you trying to achieve it?",
      de: "",
    },
    how_did_you_try_to_achieve_it: {
      en: "How did you try to achieve it?",
      de: "",
    },
    how_did_you_make_your_project_a_success: {
      en: "How did you make your project a success?",
      de: "",
    },
    how_are_you_achieving_it: {
      en: "How are you achieving it?",
      de: "",
    },
    what_are_going_to_be_the_biggest_challenges: {
      en: "What are going to be the biggest challenges?",
      de: "",
    },
    what_are_the_biggest_challenges: {
      en: "What are the biggest challenges?",
      de: "",
    },
    what_were_the_biggest_challenges: {
      en: "What were the biggest challenges?",
      de: "",
    },
    which_insights_have_you_gained_so_far: {
      en: "Which insights have you gained so far?",
      de: "",
    },
    which_insights_did_you_gain: {
      en: "Which insights did you gain?",
      de: "",
    },
    which_insights_did_you_gain_during_the_implementation: {
      en: "Which insights did you gain during the implementation?",
      de: "",
    },
    could_this_project_be_replicated_somewhere_else: {
      en: "Show all projects",
      de: "",
    },
    what_would_you_have_needed_to_make_this_project_a_sucess: {
      en: "What would you have needed to make this project a sucess?",
      de: "",
    },
    how_can_this_project_be_replicated_by_other_climate_protectors: {
      en: "How can this project be replicated by other climate protectors?",
      de: "",
    },
    please_touch_on_the_following_points_in_your_project_description: {
      en: "Please touch on the following points in your project description",
      de: "",
    },
    if_you_want_to_include_a_video_in_your_project_description: {
      en: `If you want to include a video: the first YouTube link will be converted to an embedded
      video on your project page.`,
      de: ``,
    },
    role_in_project: {
      en: "Role in project",
      de: "",
    },
    use_the_search_bar_to_add_members_to_your_project: {
      en: "Use the search bar to add members to your project.",
      de: "",
    },
    summarize_your_project: {
      en: "Summarize your project",
      de: "",
    },
    briefly_summarise_what_you_are_doing: {
      en: "Briefly summarise what you are doing (up to 240 characters)",
      de: "",
    },
    search_for_your_team_members: {
      en: "Search for your team members",
      de: "",
    },
    type_the_name_of_the_team_member_you_want_to_add_next: {
      en: "Type the name of the team member you want to add next.",
      de: "",
    },
    short_summary: {
      en: "Short summary",
      de: "",
    },
    please_add_an_image: {
      en: "Please add an image!",
      de: "",
    },
    general_information: {
      en: "General Information",
      de: "",
    },
    your_project_is: {
      en: "Your project is",
      de: "",
    },
    add_photo_helptext: {
      en:
        "Upload a photo that represents your project. This way other climate protectors can see at a glance what your project is about. It is recommended to use a non-transparent image in 16:9 format",
      de: "",
    },
    short_description_helptext: {
      en:
        "Summarize your project in less than 240 characters. Other climate protectors should be able to grasp what your project wants to achieve.",
      de: "",
    },
    description_helptext: {
      en:
        "Describe your project in more detail. What are you exactly doing? What is the climate impact of your project?",
      de: "",
    },
    collaboration_helptext: {
      en:
        "Select if you are would be open to accept help and work with other climate protectors on your project.",
      de: "",
    },
    add_skills_helptext: {
      en:
        "If you are looking for someone with specific skills to help you with your project, select these here.",
      de: "",
    },
    add_connections_helptext: {
      en:
        "Add connections that would be helpful for collaborators to have. Specifically this could be connections to organizations that could help accelerate your project.",
      de: "",
    },
    search_for_collaborating_organizations: {
      en: "Search for collaborating organizations",
      de: "",
    },
    type_the_name_of_the_collaborating_organization_you_want_to_add_next: {
      en: "Type the name of the collaborating organization you want to add next.",
      de: "",
    },
    use_the_search_bar_to_add_collaborating_organizations: {
      en: "Use the search bar to add collaborating organizations.",
      de: "",
    },
    responsible_organization: {
      en: "Responsible Organization",
      de: "",
    },
    collaborating_organizations: {
      en: "Collaborating Organizations",
      de: "",
    },
    there_has_been_an_error_when_trying_to_publish_your_project: {
      en:
        "There has been an error when trying to publish your project. Check the console for more information.",
      de: "",
    },
    your_project_has_saved_as_a_draft: {
      en: "Your project has saved as a draft!",
      de: "",
    },
    you_can_view_edit_and_publish_your_project_drafts_in_the: {
      en: (
        <>
          You can view, edit and publish your project drafts{" "}
          <a href={"/profiles/" + user?.url_slug + "/#projects"}>in the my projects section</a> of
          your profile
        </>
      ),
      de: <></>,
    },
    congratulations_your_project_has_been_published: {
      en: "Congratulations! Your project has been published!",
      de: "",
    },
    we_are_really_happy_that_you_inspire_the_global_climate_action_community: {
      en: "We are really happy that you inspire the global climate action community!",
      de: "",
    },
    you_can_view_your_project_here: {
      en: (
        <>
          You can view your project <a href={"/projects/" + url_slug}>here</a>
        </>
      ),
      de: "",
    },
    please_choose_at_least_one_category: {
      en: "Please choose at least one category!",
      de: "",
    },
    you_can_only_choose_up_to_3_categories: {
      en: "You can only choose up to 3 categories.",
      de: "",
    },
    you_can_combine_categories_text: {
      en: `You can combine categories. For example if you fund treeplanting, select both 
      Afforestation/Reforestration and Funding`,
      de: ``,
    },
    this_way_you_can_specify_what_you_are_doing_and_in_which_field: {
      en: "This way you can specify what you are doing and in which field.",
      de: "",
    },
    if_your_organization_does_not_exist_yet_click_here: {
      en: (
        <>
          If your organization does not exist yet{" "}
          <Link href="/createorganization" underline="always">
            click here
          </Link>{" "}
          to create it.
        </>
      ),
      de: <></>,
    },
    title_with_explanation_and_example: {
      en: "Title (Use a short, english title, e.g. 'Generating energy from ocean waves')",
      de: "",
    },
    use_a_title_that_makes_people_curious_to_learn_more_about_your_project: {
      en: "Use a title that makes people curious to learn more about your project",
      de: "",
    },
    are_you_sure_you_want_to_leave_you_will_lose_your_project: {
      en: "Are you sure you want to leave? You will lose your project.",
      de: "",
    },
  };
}
