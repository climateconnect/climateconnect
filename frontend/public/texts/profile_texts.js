import { Link } from "@material-ui/core";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getProfileTexts({ profile, locale }) {
  return {
    no_members_found: {
      en: "No members found. Try changing or removing your filter or search query.",
      de: "Keine Mitglieder gefunden. Versuche, die Filterung oder deine Suchanfrage anzupassen.",
    },
    availability_user_profile_missing_message: {
      en: "This user hasn't specified their availibility yet.",
      de: "Diese(r) Benutzer*in hat noch nicht angegeben, wie viele Stunden pro Woche er/sie erreichbar ist.",
    },
    add_skill: {
      en: "Add skill",
      de: "Fähigkeit hinzufügen",
    },
    skills_user_profile_missing_message: {
      en: "This user hasn't added any skills yet.",
      de: "Diese(r) Benutzer*in hat seine/ihre Fähigkeiten noch nicht angegeben.",
    },
    bio: {
      en: "Bio",
      de: "Bio",
    },
    bio_user_profile_missing_message: {
      en: "This user hasn't added a bio yet.",
      de: "Diese(r) Benutzer*in hat noch keine Bio hinzugefügt.",
    },
    location_user_profile_missing_message: {
      en: "This user hasn't specified their location yet.",
      de: "Diese(r) Benutzer*in hat seinen Standort noch nicht angegeben.",
    },
    choose_what_permissions_the_user_should_have: {
      en: "Choose what permissions the user should have.",
      de: "Wähle aus, welche Berechtigungen der/die Benutzer*in haben soll",
    },
    role_in_project: {
      en: "Role in project",
      de: "Rolle im Projekt",
    },
    role_in_organization: {
      en: "Role in organization",
      de: "Rolle in der Organisation",
    },
    pick_or_describe_role_in_organization: {
      en: "Pick or describe what the user's role in the organization is.",
      de: "Wähle oder beschreibe, welche Rolle der/die Benutzer*in in der Organisation hat.",
    },
    pick_or_describe_role_in_project: {
      en: "Pick or describe what the user's role in the project is.",
      de: "Wähle oder beschreibe, welche Rolle der/die Benutzer*in im Projekt hat.",
    },
    pick_or_type_users_role: {
      en: "Pick or type user's role",
      de: "Rolle des/der Benutzer*in auswählen oder eingeben",
    },
    hours_contributed_per_week: {
      en: "Hour contributed per week",
      de: "Arbeitszeit pro Woche",
    },
    pick_how_many_hours_user_contributes_to_org: {
      en: "Pick how many hours per week the user contributes to this organization on average.",
      de: "Wähle aus, wie viele Stunden pro Woche der/die Benutzer*in im Durchschnitt zu dieser Organisation beiträgt.",
    },
    pick_how_many_hours_user_contributes_to_project: {
      en: "Pick how many hours per week the user contributes to this project on average.",
      de: "Wähle aus, wie viele Stunden pro Woche der/die Benutzer*in im Durchschnitt zu diesem Projekt beiträgt.",
    },
    do_you_really_want_to_lose_creators_permissions: {
      en: "Do you really want to lose Creator permissions?",
      de: "Willst du wirklich deine Erstellerrechte verlieren?",
    },
    there_is_always_one_org_member_with_creator_privileges: {
      en: "There is always exactly one organization member with Creator privileges.",
      de: "Es gibt immer genau ein Organisationsmitglied mit Erstellerrechten.",
    },
    there_is_always_one_project_member_with_creator_privileges: {
      en: "There is always exactly one project member with Creator privileges.",
      de: "Es gibt immer genau ein Projektmitglied mit Erstellerrechten.",
    },
    creator_can_add_remove_and_edit_admins: {
      en: "The Creator can add, remove and edit Administrators.",
      de: "Der Ersteller kann Admins hinzufügen, entfernen und bearbeiten.",
    },
    if_you_make_person_admin_you_will_lose_privileges: {
      en: `If you make ${profile?.name} the Creator you will lose your Creator permissions.`,
      de: `Wenn du ${profile?.name} zum/zur Ersteller*in machst, verlierst du deine Erstellerrechte`,
    },
    do_you_really_want_to_do_this: {
      en: "Do you really want to do this?",
      de: "Willst du das wirklich tun?",
    },
    is_a_suborganization_of: {
      en: "is a suborganization of",
      de: "ist eine Unterorganisation von",
    },
    edit_profile: {
      en: "Edit Profile",
      de: "Profil bearbeiten",
    },
    persons_profile: {
      en: `${profile?.name}'s Profile`,
      de: `${profile?.name}'s Profil`,
    },
    to_see_this_users_full_information: {
      en: "to see this user's full information",
      de: ", um die vollständigen Informationen dieses/dieser Benutzer*in zu sehen",
    },
    your_projects: {
      en: "Your projects",
      de: "Deine Projekte",
    },
    this_users_projects: {
      en: "This user's projects",
      de: "Die Projekte dieses Mitglieds",
    },
    /*context: You are...*/
    not_involved_in_any_projects_yet: {
      en: "not involved in any projects yet!",
      de: "Noch nicht in Projekte involviert!",
    },
    your_organizations: {
      en: "Your organizations",
      de: "Deine Organisationen",
    },
    this_users_organizations: {
      en: "This user's organizations",
      de: "Die Organisationen dieses Benutzers",
    },
    /*context: You are...*/
    not_involved_in_any_organizations_yet: {
      en: "not involved in any organizations yet!",
      de: "Noch in keiner Organisation engagiert!",
    },
    sign_up_message: {
      en: "You are now a Climate Connect member. On this page you can customize your profile.",
      de: "Du bist jetzt ein Climate Connect Mitglied. Auf dieser Seite kannst du dein Profil anpassen.",
    },
    account_created: {
      en: "Account created",
      de: "Konto erstellt",
    },
    congratulations_you_have_created_your_account: {
      en: "Congratulations, you have created your account!",
      de: "Glückwunsch, du hast dein Konto erfolgreich erstellt!",
    },
    congratulations_just_one_more_step_to_complete_your_signup: {
      en: "Congratulations! Just one more step to complete your signup!",
      de: "Glückwunsch! Nur noch ein Schritt, um deine Anmeldung abzuschließen!",
    },
    we_have_sent_you_an_email_with_a_link: {
      en: "We have sent you an E-Mail with a link!",
      de: "Wir haben dir eine E-Mail mit einem Bestätigungslink geschickt!",
    },
    please_click_on_the_link_to_activate_your_account: {
      en: "Please click on the link to activate your account.",
      de: "Bitte klicke auf den Link, um dein Konto zu aktivieren.",
    },
    make_sure_to_also_check_your_spam: {
      en: "Make sure to also check your spam/junk folder incase you cannot find the E-Mail.",
      de: "Bitte überprüfe auch deinen Spam-/Junk-Ordner, falls du die E-Mail nicht finden kannst.",
    },
    if_you_are_experiencing_any_problems_contact_us: {
      en: "If you are experiencing any problems, contact us at contact@climateconnect.earth",
      de: "Wenn du Probleme haben solltest, kontaktiere uns einfach unter contact@climateconnect.earth",
    },
    if_the_email_does_not_arrive_after_5_minutes: {
      en: (
        <>
          If the E-Mail does not arrive after 5 minutes,{" "}
          <Link href={getLocalePrefix(locale) + "/resend_verification_email"}>click here</Link> to resend it.
        </>
      ),
      de: <>
        Wenn die E-Mail nach 5 Minuten noch nicht angekommen ist,{" "}
        <Link href={getLocalePrefix(locale) + "/resend_verification_email"}>klicke hier</Link>, um sie erneut versenden zu lassen.
      </>,
    },
    you_have_successfully_updated_your_profile: {
      en: "You have successfully updated your profile!",
      de: "Du habst dein Profil erfolgreich aktualisiert!",
    },
    new_to_climate_connect: {
      en: "New to Climate Connect?",
      de: "Neu bei Climate Connect?",
    },
    click_here_to_create_an_account: {
      en: "Click here to create an account",
      de: "Klicke hier, um ein Konto zu erstellen",
    },
    forgot_your_password: {
      en: "Forgot your password?",
      de: "Passwort vergessen?",
    },
    not_verified_error_message: {
      en: (
        <>
          You have not activated you account yet. Click the link in the email we sent you or{" "}
          <Link href={getLocalePrefix(locale) + "/resend_verification_email"} target="_blank">
            click here
          </Link>{" "}
          to send the verification link again.
        </>
      ),
      de: <>
        Du hast dein Konto noch nicht aktiviert. Klicke auf den Link in der E-Mail, die wir dir geschickt haben, oder{" "}
        <Link href={getLocalePrefix(locale) + "/resend_verification_email"} target="_blank">
          klicke hier
        </Link>{" "}
        , um edie Bestätigungsemail mit dem Verifizierungslink erneut zu erhalten.
      </>,
    },
    passwords_dont_match: {
      en: "Passwords don't match.",
      de: "Die Passwörter stimmen nicht überein.",
    },
    first_name: {
      en: "First Name",
      de: "Vorname",
    },
    last_name: {
      en: "Last Name",
      de: "Nachname",
    },
    i_would_like_to_receive_emails_about_updates_news_and_interesting_projects: {
      en: "I would like to receive emails about updates, news and interesting projects",
      de: "Ich möchte E-Mails über Updates, Neuigkeiten und interessante Projekte erhalten",
    },
    agree_to_tos_and_privacy_policy: {
      en: (
        <>
          I agree to the{" "}
          <a href={getLocalePrefix(locale) + "/terms"} target="_blank" rel="noreferrer">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href={getLocalePrefix(locale) + "/privacy"} target="_blank" rel="noreferrer">
            Privacy policy
          </a>
          .
        </>
      ),
      de: <>
        Ich erkläre mich mit den{" "}
        <a href={getLocalePrefix(locale) + "/terms"} target="_blank" rel="noreferrer">
          Nutzungsbedingungen
        </a>{" "}
        und den{" "}
        <a href={getLocalePrefix(locale) + "/privacy"} target="_blank" rel="noreferrer">
          Datenschutzbestimmungen
        </a>
        einverstanden.
    </>,
    },
    signup_step_2_headline: {
      "en": "Step 2: A little bit about yourself",
      "de": "Schritt 2: Ein paar Infos über dich"
    },
    repeat_password: {
      en: "Repeat Password",
      de: "Passwort wiederholen",
    },
  };
}