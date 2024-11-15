import { Link } from "@mui/material";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getOrganizationTexts({ organization, locale }) {
  return {
    log_in_to_edit_organization: {
      en: "You have to log in to edit an organization.",
      de: "Du musst dich einloggen, um eine Organisation zu bearbeiten.",
      fr: "Tu dois te connecter pour modifier une organisation"
    },
    successfully_edited_organization: {
      en: "You have successfully edited your organization.",
      de: "Du hast deine Organisation erfolgreich bearbeitet.",
      fr: "Tu as modifié ton organisation"
    },
    image_required_error: {
      en: 'Please add an avatar image by clicking the "Add Image" button.',
      de: 'Bitte füge ein Profilbild hinzu, indem du auf den Button "Bild hinzufügen" klickst.',
      fr: 'Ajoute une image avatar en cliquant sur le boutton "Ajouter une iamge"'
    },
    type_required_errror: {
      en:
        'Please choose at least one organization type by clicking the "Add Type" button under the avatar.',
      de:
        'Bitte wähle mindestens einen Organisationstyp aus, indem du auf den Button "Typ hinzufügen" klickst.',
      fr: 
        'Choisis au moins un type pour ton organisation en cliquant sur le bouton "Ajouter un type" en dessous de ton avatar'
    },
    name_required_error: {
      en: "Please type your organization name under the avatar image",
      de: "Bitte gib deinen Organisationsnamen unter dem Profilbild der Organisation an",
      fr: "Entre le nom de ton association en dessous de ton image"
    },
    location_required_error: {
      en: "Please specify your location",
      de: "Bitte gib einen Standort an",
      fr: "Indique le lieu"
    },
    how_to_summarize_organization: {
      en:
        "Give a short summary or what your organization is doing. Below you'll have more space to describe it. (",
      de:
        "Fasse deine Organisation und ihre Aktivitäten kurz zusammen. Unten hast du Platz, sie genauer zu beschreiben. (",
      fr: 
        "Donne un bref résumé de ce que fais ton organisation. En dessous tu auras plus d'espace pour le décrire ;)"
    },
    how_to_describe_organization: {
      en:
        "Describe what your organization is doing, how you work and what impact you have on climate change. Please only use English!",
      de:
        "Beschreibe, was deine Organisation macht, wie ihr arbeitet und welchen Einfluss ihr auf den Klimawandel habt.",
      fr: 
        "Décris ce que fais ton organisation, comment vous travaillez et l'impact que vous avez sur l'environnement. Utilise seulement l'anglais."
    },
    we_are_a_suborganization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "Wir sind eine Sub-Organisation einer größeren Organisation (z.B. eine lokale Gruppe)",
      fr: "On est une sous-organisation d'une plus large organisation (ex: groupe local)"
    },
    parent_organization: {
      en: "Parent organization",
      de: "Übergeordnete Organisation",
      fr: "Organisation parente"
    },
    edit_parent_organization_label: {
      en: "Edit your parent organization",
      de: "Bearbeite deine übergeordnete Organisation",
      fr: "Modifie ton organisation parente"
    },
    edit_parent_organization_helper_text: {
      en: "Type the name of your parent organization",
      de: "Gib den Namen der übergeordneten Organisation ein",
      fr: "Saisis le nom de l'organisation parente"
    },
    no_organization_found: {
      en: "No organizations found. Try changing or removing your filter or search query.",
      de:
        "Keine Organisation gefunden. Versuche, den Filter oder deine Suchanfrage zu ändern oder zu entfernen.",
      fr: 
        "Aucune organisation trouvée. Essaie de modifier ou de supprimer le filtre ou ta requête de recherche."
    },
    to_manage_org_members: {
      en: "to manage the members of this organization",
      de: ", um die Mitglieder dieser Organisation zu verwalten",
      fr: "pour gérer les membres de cette organisation"
    },
    you_are_not_a_member_of_this_organization: {
      en: "You are not a member of this organization.",
      de: "Du bist kein Mitglied dieser Organisation.",
      fr: "Tu n'es pas membre de cette organisation."
    },
    //Kommt drauf an wie "Join" übersetzt ist?
    go_to_org_page_and_click_join_to_join_it: {
      en: (
        <>
          Go to the{" "}
          <Link
            href={getLocalePrefix(locale) + "/organizations/" + organization?.url_slug}
            underline="hover"
          >
            organization page
          </Link>{" "}
          and click join to join it.
        </>
      ),
      de: (
        <>
          Gehe auf die{" "}
          <Link
            href={getLocalePrefix(locale) + "/organizations/" + organization?.url_slug}
            underline="hover"
          >
            Organisationsseite
          </Link>{" "}
          und klicke auf {"Join"} um der Organisation beizutreten.
        </>
      ),
      fr: (
        <>
          Allez à {" "}
          <Link
            href={getLocalePrefix(locale) + "/organizations/" + organization?.url_slug}
            underline="hover"
          >
            la page de l'organisation
          </Link>{" "}
          et clique sur rejoindre pour l'intégrer.
        </>
      )
    },
    no_permission_to_manage_members_of_this_org: {
      en: "No Permission to Manage Members of this Organization",
      de: "Keine Berechtigung, um Mitglieder dieser Organisation zu verwalten",
      fr: "Pas de permission pour gérer les membres de l'organisation"
    },
    need_to_be_admin_to_manage_org_members: {
      en: "You need to be an administrator of the organization to manage organization members.",
      de: "Du musst Admin dieser Organisation sein, um Mitglieder verwalten zu können.",
      fr: "Tu dois être un administrateur de cette organisation pour gérer les membres de l'organisation"
    },
    manage_organizations_members: {
      en: "Manage organization's Members",
      de: "Verwalte die Mitglieder dieser Organisation",
      fr: "Gérer les membres de l'organisation"
    },
    you_have_to_log_in_to_manage_organization_members: {
      en: "You have to log in to manage an organization's members.",
      de: "Du musst dich anmelden, um Mitglieder dieser Organisation verwalten zu können.",
      fr: "Tu dois te connecter pour gérer les membres de l'organisation"
    },
    successfully_updated_org_members: {
      en: "You have successfully updated your organization members",
      de: "Du hast die Mitglieder deiner Organisation erfolgreich aktualisiert",
      fr: "La gestion des membres est réussie"
    },
    there_must_be_exactly_one_creator_of_organization: {
      en: "There must be exactly one Super Admin of an organization.",
      de: "Es muss genau eine(n) Super Admin einer Organisation geben.",
      fr: "Il doit y avoir au moins un Super Admin par organisation"
    },
    manage_members_of_organization_name: {
      en: `Manage members of ${organization?.name}`,
      de: `Verwalte die Mitglieder von ${organization?.name}`,
      fr: `Gérer les membres de ${organization?.name}`
    },
    search_for_your_organizations_members: {
      en: "Search for your organization's members",
      de: "Suche nach Mitglieder deiner Organisation",
      fr: "Rechercher les membres de votre organisation"
    },
    type_name_of_next_team_member: {
      en: "Type the name of the team member you want to add next.",
      de: "Gib den Namen deines Team Mitglieds an, den du als nächstes hinzufügen möchtest",
      fr: "Taper le nom du membre d'équipe que tu veux ajouter."
    },
    role_in_organization: {
      en: "Role in organization",
      de: "Funktion innerhalb der Organisation",
      fr: "Rôle dans l'organisation"
    },
    edit_organization: {
      en: "Edit organization",
      de: "Organisation bearbeiten",
      fr: "Modifier l'organisation"
    },
    to_see_this_organizations_full_information: {
      en: "to see this organization's full information",
      de: ", um die vollständigen Informationen zu dieser Organisation zu sehen",
      fr: "pour voir l'ensemble des inforamtions de l'organisation"
    },
    this_organizations_projects: {
      en: `Projects by ${organization?.name}`,
      de: `Projekte von ${organization?.name}`,
      fr: `Projets de ${organization?.name}`
    },
    members_of_organization: {
      en: `Members of ${organization?.name}`,
      de: `Mitglieder von ${organization?.name}`,
      fr: `Membres de ${organization?.name}`
    },
    this_organization_has_not_listed_any_projects_yet: {
      en: "This organization has not listed any projects yet!",
      de: "Diese Organisation hat noch keine Projekte geteilt!",
      fr: "Cette organisation n'a pas encore partagé de projets"
    },
    none_of_the_members_of_this_organization_has_signed_up_yet: {
      en: "None of the members of this organization has signed up yet!",
      de: "Keins der Mitglieder dieser Organisation hat sich bisher registriert!",
      fr: "Aucun des membres de cette organisation ne s'est encore enregistré"
    },
    organizations_logo: {
      en: `${organization?.name}'s logo`,
      de: `${organization?.name}'s Logo`,
      fr: `logo de ${organization?.name}`
    },
    you_have_not_selected_a_parent_organization_either_untick: {
      en:
        "You have not selected a parent organization. Either untick the sub-organization field or choose/create your parent organization.",
      de:
        "Du hast keine übergeordnete Organisation ausgewählt. Deaktiviere entweder das Feld für die Sub-Organisation oder erstelle eine dazugehörige übergeordnete Organisation.",
      fr: 
        "Tu n'as pas sélectionné d'organisation parente. Décoches la case de la sous-organisation ou créé une organisation supérieure correspondante. "
    },
    an_organization_with_this_name_already_exists: {
      en: "An organization with this name already exists.",
      de: "Eine Organisation mit dem gleichen Namen existiert bereits.",
      fr: "Une organisation à ce nom existe déjà"
    },
    //Context: An organization with this name already exists. Click here to see it.
    to_see_it: {
      en: "to see it.",
      de: ", um mehr zu erfahren.",
      fr: "pour en savoir plus"
    },
    you_have_successfully_created_an_organization_you_can_add_members: {
      en: "You have successfully created an organization! Now you can add the rest of your team.",
      de:
        "Du hast erfolgreich eine Organisation erstellt! Jetzt kannst du den Rest deines Teams hinzufügen.",
      fr: 
        "La création de l'organisation est compléte! Tu peux maintenant ajouter le reste de ton équipe."
    },
    to_create_an_organization: {
      en: "to create an organization",
      de: ", um eine Organisation zu erstellen",
      fr: "pour créer une organisation"
    },
    create_an_organization: {
      en: "Create an Organization",
      de: "Organisation erstellen",
      fr: "Créer une organisation"
    },
    organization_name: {
      en: "Organization name",
      de: "Organisationsname",
      fr: "Nom de l'organisation"
    },
    we_are_a_sub_organization_of_a_larger_organization: {
      en: "We are a sub-organization of a larger organization (e.g. local group)",
      de: "Wir sind eine Sub-Organisation einer größeren Organisation (z.B. eine lokale Gruppe)",
      fr: "On est une sous organisation d'une plus grande (ex: groupe local)"
    },
    parent_organization_name: {
      en: "Parent organization name",
      de: "Name der übergeordneten Organisation",
      fr: "Nom de l'organisation parent"
    },
    search_for_your_parent_organization: {
      en: "Search for your parent organization",
      de: "Suche nach deiner übergeordneten Organisation",
      fr: "Rechercher ton organisation parent"
    },
    type_the_name_of_your_parent_organization: {
      en: "Type the name of your parent organization.",
      de: "Gib den Namen der übergeordneten Organisation an",
      fr: "Entre le nom de ton organisation parente"
    },
    i_verify_that_i_am_an_authorized_representative_of_this_organization: {
      en: `I verify that I am an authorized representative of this organization 
      and have the right to act on its behalf in the creation and management of this page.`,
      de: `Ich bestätige, dass ich ein(e) autorisierte*r Vertreter*in dieser Organisation 
      bin und das Recht habe, in deren Namen bei der Erstellung und Verwaltung dieser Seite zu handeln.`,
      fr: `Je confirme que je suis autorisé a représenter cette organisation et que j'ai les droits d'agir
      en son nom pour la création et la gestion de cette page.`
    },
    almost_done_here_you_can_customize_your_organization_page_and_add_details: {
      en: "Almost done! Here you can customize your organization page and add details",
      de: "Fast geschafft! Hier kannst du deine Organisationsseite anpassen und Details hinzufügen",
      fr: "Tu y es presque! Ici, tu peux personnaliser ta page d'organisation et ajouter des détails"
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
      de: `Über uns`,
      fr: `A propos`
    },
    large_medium_organization_size: {
      en: "501-1,000",
      de: "501-1.000",
      fr: "501-1.000"
    },
    large_organization_size: {
      en: "1,001-5,000",
      de: "1.001-5.000",
      fr: "1.001-5.000"
    },
    very_large_organization_size: {
      en: "5,001-50,000",
      de: "5.001-50.000",
      fr: "5.001-50.000"
    },
    huge_organization_size: {
      en: "Over 50,000",
      de: "Über 50.000",
      fr: "Plus de 50,000"
    },
    organization_size: {
      en: "Members",
      de: "Mitglieder",
      fr: "Membres"
    },
    people: {
      en: "people",
      de: "Menschen",
      fr: "personnes"
    },
    climate_protection_organization: {
      en: "Interesting climate organization: ",
      de: "Interessante Klimaschutzorganisation: ",
      fr: "Organisation environnementale intéressante"
    },
    tell_others_about_this_organization: {
      en: "Tell others about this organization!",
      de: "Erzähle anderen von dieser Organisation!",
      fr: "Parle aux autres de cette organisation !"
    },
    share_organization_email_body: {
      en: `Hey,
      I found this awesome climate protection organization: "${organization?.name}". 
      You should check it out here: `,
      de: `Hey,
      Ich habe gerade diese spannende Klimaschutzorganisation gefunden: "${organization?.name}". 
      Schau sie dir doch mal an: `,
      fr: `Hey,
      J'ai trouvé cette super organisation environnementale "${organization?.name}". 
      Jettes y un oeil: `
    },
    skip_for_now: {
      en: "Skip for now",
      de: "Erstmal überspringen",
      fr: "Passer pour maintenant"
    },

    please_log_in_to_follow_an_organization: {
      en: "Please log in to follow an organization.",
      de: "Bitte logge dich ein, um einer Organisation zu folgen.",
      fr: "Connecte toi pour suivre une organisation"
    },
    do_you_really_want_to_unfollow: {
      en: "Do you really want to unfollow?",
      de: "Möchtest du dieser Organisation wirklich nicht mehr folgen? ",
      fr: "Tu ne veux vraiment plus suivre cette organisation ?"
    },
    are_you_sure_that_you_want_to_unfollow_this_organization: {
      en: (
        <>
          Are you sure that you want to unfollow this organization?
          <br />
          You {"won't"} receive updates about it anymore
        </>
      ),
      de: (
        <>
          Bist du sicher, dass du dieser Organisation nicht mehr folgen willst?
          <br />
          Du wirst keine Updates mehr erhalten
        </>
      ),
      fr: (
        <>
          Tu ne veux vraiment plus suivre cette organisation ?
          <br />
          Tu ne recevras plus de mises à jour
        </>
      )
    },
    followers: {
      en: "Followers",
      de: "Follower",
      fr: "Followers"
    },
    follower: {
      en: "Follower",
      de: "Follower",
      fr: "Follower"
    },
    follow: {
      en: "Follow",
      de: "Folgen",
      fr: "Suivre"
    },
    following: {
      en: "Following",
      de: "Du folgst",
      fr: "Tu suis"
    },
    to_see_this_organizations_followers: {
      en: " to see this organization's followers",
      de: ", um die Follower der Organisation zu sehen",
      fr: "pour voir les Followers de cette organisation"
    },
    //Kontext: Followers of Organization
    followers_of: {
      en: "Followers of",
      de: "Follower von",
      fr: "Follower de"
    },
    following_since: {
      en: "Following since",
      de: "Folgt seit",
      fr: "Follower depuis"
    },
    this_organzation_does_not_have_any_followers_yet: {
      en: "This organization does not have any followers yet.",
      de: "Diese Organisation hat noch keine Follower.",
      fr: "Cette organisation n'a pas encore de follower"
    },
    follow_for_updates: {
      en: "Follow to receive updates!",
      de: "Folgen, um Updates zu erhalten!",
      fr: "Suis pour recevoir des nouvelles"
    },
    get_involved: {
      en: "How to get involved",
      de: "Wie man sich einbringen kann",
      fr: "Comment s'engager"
    },
    get_involved_helptext: {
      en: "e.g. Open online meeting every Wednesday at 6pm. New people always welcome! (",
      de:
        'z.B. "Offenes Treffen jeden Mittwoch um 18 Uhr im Café Margareta. Interessierte sind immer willkommen!" (',
      fr: 
        "ex. Réunion ouverte chaque Mercredi à 18h. Nouveaux arrivants toujours les bievenus! ("
    },
    add_up_to_two_types: {
      en: "Organization Type (Up to 2)",
      de: "Organisationsart (Bis zu 2)",
      fr: "Type d'organisation (jusqu'à 2)"
    },
    organization_is_active_in_these_sectors: {
      en: `${organization?.name} is active in these sectors`,
      de: `${organization?.name} ist in diesen Bereichen aktiv`,
      fr: `${organization?.name} est active dans ces secteurs`
    },
    someone_has_already_created_organization: {
      en: "Someone has already created the organization ",
      de: "Jemand erstellte bereits die Organisation ",
      fr: "Quelqu'un a déjà créé cette organisation"
    },
    please_join_org_or_use_diff_name_if_problems_contact: {
      en:
        ". Please join the organization or use a different name. If you're having problems please contact ",
      de:
        ". Bitte trete der Organisation bei oder verwende einen anderen Namen. Falls du Probleme hast, wende dich bitte an ",
      fr: ". Rejoins cette organisation ou utilise un nom différent. Si tu as des problémes n'hésite pas à nous contacter"
    },
  };
}
