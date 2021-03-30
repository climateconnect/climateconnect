import { Link } from "@material-ui/core";
import React from "react";

export default function getProfileTexts({ profile }) {
  return {
    no_members_found: {
      en: "No members found. Try changing or removing your filter or search query.",
      de: "",
    },
    availability_user_profile_missing_message: {
      en: "This user hasn't specified their availibility yet.",
      de: "",
    },
    add_skill: {
      en: "Add skill",
      de: "",
    },
    skills_user_profile_missing_message: {
      en: "This user hasn't specified their availibility yet.",
      de: "",
    },
    bio: {
      en: "Bio",
      de: "",
    },
    bio_user_profile_missing_message: {
      en: "This user hasn't added a bio yet.",
      de: "",
    },
    location_user_profile_missing_message: {
      en: "This user hasn't specified their location yet.",
      de: "",
    },
    choose_what_permissions_the_user_should_have: {
      en: "Choose what permissions the user should have.",
      de: "",
    },
    role_in_project: {
      en: "Role in project",
      de: "",
    },
    role_in_organization: {
      en: "Role in organization",
      de: "",
    },
    pick_or_describe_role_in_organization: {
      en: "Pick or describe what the user's role in the organization is.",
      de: "",
    },
    pick_or_describe_role_in_project: {
      en: "Pick or describe what the user's role in the project is.",
      de: "",
    },
    pick_or_type_users_role: {
      en: "Pick or type user's role",
      de: "",
    },
    hours_contributed_per_week: {
      en: "Hour contributed per week",
      de: "",
    },
    pick_how_many_hours_user_contributes_to_org: {
      en: "Pick how many hours per week the user contributes to this organization on average.",
      de: "",
    },
    pick_how_many_hours_user_contributes_to_project: {
      en: "Pick how many hours per week the user contributes to this project on average.",
      de: "",
    },
    do_you_really_want_to_lose_creators_permissions: {
      en: "Do you really want to lose Creator permissions?",
      de: "",
    },
    there_is_always_one_org_member_with_creator_privileges: {
      en: "There is always exactly one organization member with Creator privileges.",
      de: "",
    },
    there_is_always_one_project_member_with_creator_privileges: {
      en: "There is always exactly one project member with Creator privileges.",
      de: "",
    },
    creator_can_add_remove_and_edit_admins: {
      en: "The Creator can add, remove and edit Administrators.",
      de: "",
    },
    if_you_make_person_admin_you_will_lose_privileges: {
      en: `If you make ${profile?.name} the Creator you will lose your Creator permissions.`,
      de: ``,
    },
    do_you_really_want_to_do_this: {
      en: "Do you really want to do this?",
      de: "",
    },
    is_a_suborganization_of: {
      en: "is a suborganization of",
      de: "",
    },
    edit_profile: {
      en: "Edit Profile",
      de: "",
    },
    persons_profile: {
      en: `${profile?.name}'s Profile`,
      de: ``,
    },
    to_see_this_users_full_information: {
      en: "to see this user's full information",
      de: "",
    },
    your_projects: {
      en: "Your projects",
      de: "",
    },
    this_users_projects: {
      en: "This user's projects",
      de: "",
    },
    /*context: You are...*/
    not_involved_in_any_projects_yet: {
      en: "not involved in any projects yet!",
      de: "",
    },
    your_organizations: {
      en: "Your organizations",
      de: "",
    },
    this_users_organizations: {
      en: "This user's organizations",
      de: "",
    },
    /*context: You are...*/
    not_involved_in_any_organizations_yet: {
      en: "not involved in any organizations yet!",
      de: "",
    },
    sign_up_message: {
      en: "You are now a Climate Connect member. On this page you can customize your profile.",
      de: "",
    },
    account_created: {
      en: "Account created",
      de: "",
    },
    congratulations_you_have_created_your_account: {
      en: "Congratulations, you have created your account!",
      de: "",
    },
    congratulations_just_one_more_step_to_complete_your_signup: {
      en: "Congratulations! Just one more step to complete your signup!",
      de: "",
    },
    we_have_sent_you_an_email_with_a_link: {
      en: "We have sent you an E-Mail with a link!",
      de: "",
    },
    please_click_on_the_link_to_activate_your_account: {
      en: "Please click on the link to activate your account.",
      de: "",
    },
    make_sure_to_also_check_your_spam: {
      en: "Make sure to also check your spam/junk folder incase you cannot find the E-Mail.",
      de: "",
    },
    if_you_are_experiencing_any_problems_contact_us: {
      en: "If you are experiencing any problems, contact us at contact@climateconnect.earth",
      de: "",
    },
    if_the_email_does_not_arrive_after_5_minutes: {
      en: (
        <>
          If the E-Mail does not arrive after 5 minutes,{" "}
          <Link href="/resend_verification_email">click here</Link> to resend it.
        </>
      ),
      de: <></>,
    },
    you_have_successfully_updated_your_profile: {
      en: "You have successfully updated your profile!",
      de: "",
    },
    new_to_climate_connect: {
      en: "New to Climate Connect?",
      de: "",
    },
    click_here_to_create_an_account: {
      en: "Click here to create an account",
      de: "",
    },
    forgot_your_password: {
      en: "Forgot your password?",
      de: "",
    },
    not_verified_error_message: {
      en: (
        <>
          You have not activated you account yet. Click the link in the email we sent you or{" "}
          <Link href="resend_verification_email" target="_blank">
            click here
          </Link>{" "}
          to send the verification link again.
        </>
      ),
      de: <></>,
    },
    passwords_dont_match: {
      en: "Passwords don't match.",
      de: "",
    },
    first_name: {
      en: "First Name",
      de: "",
    },
    last_name: {
      en: "Last Name",
      de: "",
    },
    i_would_like_to_receive_emails_about_updates_news_and_interesting_projects: {
      en: "I would like to receive emails about updates, news and interesting projects",
      de: "",
    },
    agree_to_tos_and_privacy_policy: {
      en: (
        <>
          I agree to the{" "}
          <a href="terms" target="_blank">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="privacy" target="_blank">
            Privacy policy
          </a>
          .
        </>
      ),
      de: <></>,
    },
    signup_step_2_headline: {
      en: "Step 2: A little bit about yourself",
      de: "",
    },
    repeat_password: {
      en: "Repeat Password",
      de: "",
    },
  };
}
