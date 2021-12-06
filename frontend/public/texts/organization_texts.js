import { Link } from "@material-ui/core";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getOrganizationTexts({ organization, locale }) {
  return {
    log_in_to_edit_organization: {
      en: "You have to log in to edit an organization.",
      de: "Du musst dich einloggen, um eine Organisation zu bearbeiten.",
    },
    successfully_edited_organization: {
      en: "You have successfully edited your organization.",
      de: "Du hast deine Organisation erfolgreich bearbeitet.",
    },
    image_required_error: {
      en: 'Please add an avatar image by clicking the "Add Image" button.',
      de: 'Bitte füge ein Profilbild hinzu, indem du auf den Button "Bild hinzufügen" klickst.',
    },
    type_required_errror: {
      en:
        'Please choose at least one organization type by clicking the "Add Type" button under the avatar.',
      de:
        'Bitte wähle mindestens einen Organisationstyp aus, indem du auf den Button "Typ hinzufügen" klickst.',
    },
    name_required_error: {
      en: "Please type your organization name under the avatar image",
      de: "Bitte gib deinen Organisationsnamen unter dem Profilbild der Organisation an",
    },
    location_required_error: {
      en: "Please specify your location",
      de: "Bitte gib einen Standort an",
    },
    how_to_summarize_organization: {
      en:
        "Give a short summary or what your organization is doing. This text will be displayed on your organization card.",
      de:
        "Beschreibe kurz deine Organisation und ihre Aktivitäten. Dieser Text wird auf der Organisationskarte deiner Organisation angezeigt werden.",
    },
    how_to_describe_organization: {
      en:
        "Describe what your organization is doing, how you work and what impact you have on climate change. Please only use english!",
      de:
        "Beschreibe, was deine Organisation macht, wie ihr arbeitet und welchen Einfluss ihr auf den Klimawandel habt.",
    },
    we_are_a_suborganization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "Wir sind eine Sub-Organisation einer größeren Organisation (z.B. eine lokale Gruppe)",
    },
    parent_organization: {
      en: "Parent organization",
      de: "Übergeordnete Organisation",
    },
    edit_parent_organization_label: {
      en: "Edit your parent organization",
      de: "Bearbeite deine übergeordnete Organisation",
    },
    edit_parent_organization_helper_text: {
      en: "Type the name of your parent organization",
      de: "Gib den Namen der übergeordneten Organisation ein",
    },
    no_organization_found: {
      en: "No organizations found. Try changing or removing your filter or search query.",
      de:
        "Keine Organisation gefunden. Versuche, den Filter oder deine Suchanfrage zu ändern oder zu entfernen.",
    },
    to_manage_org_members: {
      en: "to manage the members of this organization",
      de: ", um die Mitglieder dieser Organisation zu verwalten",
    },
    you_are_not_a_member_of_this_organization: {
      en: "You are not a member of this organization.",
      de: "Du bist kein Mitglied dieser Organisation.",
    },
    //Kommt drauf an wie "Join" übersetzt ist?
    go_to_org_page_and_click_join_to_join_it: {
      en: (
        <>
          Go to the{" "}
          <Link href={getLocalePrefix(locale) + "/organizations/" + organization?.url_slug}>
            organization page
          </Link>{" "}
          and click join to join it.
        </>
      ),
      de: (
        <>
          Gehe auf die{" "}
          <Link href={getLocalePrefix(locale) + "/organizations/" + organization?.url_slug}>
            Organisationsseite
          </Link>{" "}
          und klicke auf {"Join"} um der Organisation beizutreten.
        </>
      ),
    },
    no_permission_to_manage_members_of_this_org: {
      en: "No Permission to Manage Members of this Organization",
      de: "Keine Berechtigung, um Mitglieder dieser Organisation zu verwalten",
    },
    need_to_be_admin_to_manage_org_members: {
      en: "You need to be an administrator of the organization to manage organization members.",
      de: "Du musst Admin dieser Organisation sein, um Mitglieder verwalten zu können.",
    },
    manage_organizations_members: {
      en: "Manage organization's Members",
      de: "Verwalte die Mitglieder dieser Organisation",
    },
    you_have_to_log_in_to_manage_organization_members: {
      en: "You have to log in to manage an organization's members.",
      de: "Du musst dich anmelden, um Mitglieder dieser Organisation verwalten zu können.",
    },
    successfully_updated_org_members: {
      en: "You have successfully updated your organization members",
      de: "Du hast die Mitglieder deiner Organisation erfolgreich aktualisiert",
    },
    there_must_be_exactly_one_creator_of_organization: {
      en: "There must be exactly one Super Admin of an organization.",
      de: "Es muss genau eine(n) Super Admin einer Organisation geben.",
    },
    manage_members_of_organization_name: {
      en: `Manage members of ${organization?.name}`,
      de: `Verwalte die Mitglieder von ${organization?.name}`,
    },
    search_for_your_organizations_members: {
      en: "Search for your organization's members",
      de: "Suche nach Mitglieder deiner Organisation",
    },
    type_name_of_next_team_member: {
      en: "Type the name of the team member you want to add next.",
      de: "Gib den Namen deines Team Mitglieds an, den du als nächstes hinzufügen möchtest",
    },
    role_in_organization: {
      en: "Role in organization",
      de: "Funktion innerhalb der Organisation",
    },
    edit_organization: {
      en: "Edit organization",
      de: "Organisation bearbeiten",
    },
    to_see_this_organizations_full_information: {
      en: "to see this organization's full information",
      de: ", um die vollständigen Informationen zu dieser Organisation zu sehen",
    },
    this_organizations_projects: {
      en: `Projects by ${organization?.name}`,
      de: `Projekte von ${organization?.name}`,
    },
    members_of_organization: {
      en: `Members of ${organization?.name}`,
      de: `Mitglieder von ${organization?.name}`,
    },
    this_organization_has_not_listed_any_projects_yet: {
      en: "This organization has not listed any projects yet!",
      de: "Diese Organisation hat noch keine Projekte geteilt!",
    },
    none_of_the_members_of_this_organization_has_signed_up_yet: {
      en: "None of the members of this organization has signed up yet!",
      de: "Keins der Mitglieder dieser Organisation hat sich bisher registriert!",
    },
    organizations_logo: {
      en: `${organization?.name}'s logo`,
      de: `${organization?.name}'s Logo`,
    },
    you_have_not_selected_a_parent_organization_either_untick: {
      en:
        "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization.",
      de:
        "Du hast keine übergeordnete Organisation ausgewählt. Deaktiviere entweder das Feld für die Sub-Organisation oder erstelle eine dazugehörige übergeordnete Organisation.",
    },
    an_organization_with_this_name_already_exists: {
      en: "An organization with this name already exists.",
      de: "Eine Organisation mit dem gleichen Namen existiert bereits.",
    },
    //Context: An organization with this name already exists. Click here to see it.
    to_see_it: {
      en: "to see it.",
      de: ", um mehr zu erfahren.",
    },
    you_have_successfully_created_an_organization_you_can_add_members: {
      en:
        "You have successfully created an organization! You can add members by scrolling down to the members section.",
      de:
        "Du hast erfolgreich eine Organisation erstellt! Du kannst nun Mitglieder hinzufügen, indem du nach unten zum Mitgliederbereich scrollst.",
    },
    to_create_an_organization: {
      en: "to create an organization",
      de: ", um eine Organisation zu erstellen",
    },
    create_an_organization: {
      en: "Create an Organization",
      de: "Organisation erstellen",
    },
    organization_name: {
      en: "Organization name",
      de: "Organisationsname",
    },
    we_are_a_sub_organization_of_a_larger_organization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "Wir sind eine Sub-Organisation einer größeren Organisation (z.B. eine lokale Gruppe)",
    },
    parent_organization_name: {
      en: "Parent organization name",
      de: "Name der übergeordneten Organisation",
    },
    search_for_your_parent_organization: {
      en: "Search for your parent organization",
      de: "Suche nach deiner übergeordneten Organisation",
    },
    type_the_name_of_your_parent_organization: {
      en: "Type the name of your parent organization.",
      de: "Gib den Namen der übergeordneten Organisation an",
    },
    i_verify_that_i_am_an_authorized_representative_of_this_organization: {
      en: `I verify that I am an authorized representative of this organization 
      and have the right to act on its behalf in the creation and management of this page.`,
      de: `Ich bestätige, dass ich ein(e) autorisierte*r Vertreter*in dieser Organisation 
      bin und das Recht habe, in deren Namen bei der Erstellung und Verwaltung dieser Seite zu handeln.`,
    },
    almost_done_here_you_can_customize_your_organization_page_and_add_details: {
      en: "Almost done! Here you can customize your organization page and add details",
      de: "Fast geschafft! Hier kannst du deine Organisationsseite anpassen und Details hinzufügen",
    },
    translate_organization_intro: {
      en: "",
      de: (
        <>
          Da der Klimawandel eine globale Krise ist, ist es uns wichtig, dass alle
          Organisationsprofile auch auf Englisch verfügbar sind.
          <br />
          Wenn du auf {"Automatisch Übersetzen"} klickst, kannst du den Text immer noch bearbeiten.
          Natürlich kannst du auch alles selbst übersetzen. Wenn du auf {"Veröffentlichen"} klickst,
          werden alle leeren Felder automatisch übersetzt.
        </>
      ),
    },
    about: {
      en: `About`,
      de: `Über ${organization?.name}`,
    },
    large_medium_organization_size: {
      en: "501-1,000",
      de: "501-1.000",
    },
    large_organization_size: {
      en: "1,001-5,000",
      de: "1.001-5.000",
    },
    very_large_organization_size: {
      en: "5,001-50,000",
      de: "5.001-50.000",
    },
    huge_organization_size: {
      en: "Over 50,000",
      de: "Über 50.000",
    },
    organization_size: {
      en: "Organization size",
      de: "Größe der Organisation",
    },
    people: {
      en: "people",
      de: "Menschen",
    },
    climate_protection_organization: {
      en: "Interesting climate organization: ",
      de: "Interessante Klimaschutzorganisation: ",
    },
    tell_others_about_this_organization: {
      en: "Tell others about this organization!",
      de: "Erzähle anderen von dieser Organisation!",
    },
    share_organization_email_body: {
      en: `Hey,
      I found this awesome climate protection organization: "${organization?.name}". 
      You should check it out here: `,
      de: `Hey,
      Ich habe gerade diese spannende Klimaschutzorganisation gefunden: "${organization?.name}". 
      Schau sie dir doch mal an: `,
    },
  };
}
