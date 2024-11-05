import { Link } from "@mui/material";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getProjectTexts({ project, user, url_slug, locale, creator }) {
  return {
    please_log_in_to_edit_project: {
      en: "Please Log In to Edit a project.",
      de: "Bitte logge dich ein, um ein Projekt zu bearbeiten ",
      fr: "Connectes toi pour éditer un projet"
},
    to_edit_this_project: {
      en: "to edit this project",
      de: ", um dieses Project zu bearbeiten",
      fr: "pour éditer ce projet"
},
    project_not_found: {
      en: "Project not Found",
      de: "Projekt konnte nicht gefunden werden",
      fr: "Projet introuvable"
},
    project_does_not_exist: {
      en: "This project does not exist.",
      de: "Dieses Projekt existiert nicht.",
      fr: "Ce projet n'existe pas"
},
    to_create_a_project: {
      en: "to create a project",
      de: ", um ein Projekt zu erstellen",
      fr: "pour créer un projet"
},
    not_a_member: {
      en: "You are not a member of this project",
      de: "Du bist kein Mitglied dieses Projektes",
      fr: "tu n'es pas membre de ce projet"
},
    "project page": {
      en: "project page",
      de: "Projektseite",
      fr: "page de projet"
},
    and_ask_to_be_part_of_the_team: {
      en: "and ask to be part of the team",
      de: "und frag nach, ob du zum Team hinzugefügt werden kannst.",
      fr: "et demandes à réjoindre l'équipe"
},
    no_permissions_to_edit_project: {
      en: "No Permission to Edit this project",
      de: "Du hast keine Erlaubnis das Projekt zu bearbeiten",
      fr: "Tu n'es pas autorisé à travailler sur le projet"
},
    need_to_be_admin_to_manage_project_team: {
      en: "You need to be an administrator of the project to manage the team.",
      de: "Du musst ein Admin des Projekts sein, um das Team zu verwalten.",
      fr: "Tu dois être un administrateur du projet pour gérer les membres de l'équipe"
},
    edit_project: {
      en: "Edit Project",
      de: "Projekt bearbeiten",
      fr: "Modifier projet"
},
    edit_draft: {
      en: "Edit Draft",
      de: "Entwurf bearbeiten",
      fr: "Modifier brouillon"
},
    no_projects_found: {
      en: "No projects found.",
      de: "Keine Projekte gefunden.",
      fr: "Pas de projet trouvé"
},
    project_image_of_project: {
      en: "Project image",
      de: "Bild des Projektes",
      fr: "Photo du projet"
},
    you_have_to_log_in_to_manage_a_projects_members: {
      en: "You have to log in to manage a project's members.",
      de: "Du musst dich einloggen, um die Projektmitglieder zu verwalten",
      fr: "Tu dois te connecter pour gérer les membres du projet"
},
    please_log_in_to_manage_the_members_of_this_project: {
      en: "Please Log In to Manage the Members of this project",
      de: "Bitte logge dich ein, um die Mitglieder dieses Projekts zu verwalten",
      fr: "Connectes toi pour gérer les membres de ce projet"
},
    to_manage_the_members_of_this_project: {
      en: "to manage the members of this project",
      de: ", um die Mitglieder dieses Projekts zu verwalten",
      fr: "pour gérer les membres de ce projet"
},
    you_are_not_a_member_of_this_project: {
      en: "You are not a member of this project.",
      de: "Du bist kein Mitglied dieses Projekts.",
      fr: "Tu n'es pas membre de ce projet"
},
    you_need_to_be_an_administrator_of_the_project_to_manage_project_members: {
      en: "You need to be an administrator of the project to manage project members.",
      de: "Du musst Admin des Projekts sein, um die Projektmitglieder zu verwalten.",
      fr: "Tu dois être un amdin du projet pour gérer ses membres"
},
    no_permission_to_manage_members_of_this_project: {
      en: "No Permission to Manage Members of this project",
      de: "Keine Berechtigung die Mitglieder des Projekts zu verwalten",
      fr: "Pas d'autorisation de gérer les membres du projet"
},
    manage_projects_members: {
      en: "Manage Project's Members",
      de: "Projektmitglieder verwalten",
      fr: "Gérer les membres du projet"
},
    you_have_successfully_updated_your_team: {
      en: "You have successfully updated your team",
      de: "Du hast dein Team erfolgreich aktualisiert",
      fr: "Tu as mis à jour ton équipe"
},
    there_must_be_exactly_one_creator_of_a_project: {
      en: "There must be exactly one Super Admin of a project.",
      de: "Für ein Projekt muss es genau eine(n) Super Admin geben.",
      fr: "Il ne doit avoir qu'un Super Admin par projet"
},
    manage_members_of_project: {
      en: `Manage members of ${project?.name}`,
      de: `Mitglieder von ${project?.name} verwalten`,
      fr: `Gérer les membres de ${project?.name}`
},
    team: {
      en: "Team",
      de: "Team",
      fr: "Equipe"
},
    discussion: {
      en: "Discussion",
      de: "Diskussion",
      fr: "Conversation"
},
    you_have_successfully_left_the_project: {
      en: "You have successfully left the project.",
      de: "Du hast das Projekt erfolgreich verlassen.",
      fr: "Tu as quitté le projet"
},
    please_log_in_to_follow_a_project: {
      en: "Please log in to follow a project.",
      de: "Bitte logge dich ein, um einem Projekt zu folgen.",
      fr: "Conectes toi pour suivre un projet"
},
    please_log_in_to_like_a_project: {
      en: "Please log in to like a project.",
      de: "Bitte logge dich ein, um ein Projekt zu liken.",
      fr: "Connectes toi pour aimer un projet"
},
    you_cant_leave_a_project_as_the_creator: {
      en: `You can't leave a project as the Super Admin. Please give the Super Admin role to another team member by clicking "Manage Members" in the team tab.`,
      de: `Du kannst das Projekt als Super Admin nicht verlassen. Bitte übertrage diese Rolle auf ein anderes Teammitglied, indem du "Mitglieder verwalten" im Team-Tab klickst`,
      fr: `Tu ne peux quitter le projet en tant que Super Admin. Tu dois avant transférer ce rôle à un autre membre en cliquant sur "Gérer l'équipe"`
},
    do_you_really_want_to_unfollow: {
      en: "Do you really want to unfollow?",
      de: "Möchtest du dem Projekt wirklich nicht mehr folgen? ",
      fr: "Tu ne veux vraiment plus suivre le projet ? "
},
    are_you_sure_that_you_want_to_unfollow_this_project: {
      en: (
        <>
          Are you sure that you want to unfollow this project?
          <br />
          You {"won't"} receive updates about it anymore
        </>
      ),
      de: (
        <>
          Bist du sicher, dass du diesem Projekt nicht folgen willst?
          <br />
          Du wirst keine Updates mehr davon erhalten
        </>
      ),
      fr: (
        <>
          Tu ne veux vraiment plus suivre le projet?
          <br />
          Tu ne recevras plus de mise à jour
        </>
      )
},
    do_you_really_want_to_dislike: {
      en: "Do you really want to remove your like?",
      de: "Möchtest du deinen Like wirklich entfernen? ",
      fr: "Tu veux vraiment suprrimer ton J'aime?"
},

    are_you_sure_that_you_want_to_dislike_this_project: {
      en: "Are you sure that you want to remove your like from this project?",
      de: "Bist du sicher, dass du dieses Projekt nicht mehr liken möchtest?",
      fr: "Tu veux vraiment supprimer ton J'aime de ce projet?"
},
    do_you_really_want_to_leave_this_project: {
      en: "Do you really want to leave this project?",
      de: "Möchtest du dieses Projekt wirklich verlassen?",
      fr: "Tu veux quitter ce projet?"
},
    are_you_sure_that_you_want_to_leave_this_project: {
      en: "Are you sure that you want to leave this project?",
      de: "Bist du dir sicher, dass du dieses Projekt verlassen möchtest",
      fr: "Tu es sûr de vouloir quitter ce projet?"
},
    you_wont_be_part_of_the_team_anymore: {
      en: "You won't be part of the team anymore.",
      de: "Du wirst kein Teil dieses Teams mehr sein.",
      fr: "Tu ne seras alors plus membre de l'équipe."
},
    you_are_the_only_member_of_this_project: {
      en: (
        <>
          Danger: You are the only member of this project. <br />
          If you leave the project it will be deactivated.
        </>
      ),
      de: (
        <>
          Achtung: Du bist das einzige Mitglied in diesem Projekt. <br />
          Wenn du das Projekt verlässt, wird es deaktiviert.
        </>
      ),
      fr: (
        <>
          Attention: Tu es le seul membre de ce projet. <br />
          Si tu le quittes il sera désactivé.
        </>
      )
},
    please_create_an_account_or_log_in_to_contact_a_projects_organizer: {
      en: "Please create an account or log in to contact a project's organizer.",
      de:
        "Bitte erstelle ein Konto oder melde dich an, um die Verantwortlichen des Projektes zu kontaktieren.",
      fr: "Créée un compte ou connectes toi pour contacter le responsable du projet"
},
    contact_creator: {
      en: "Contact creator",
      de: "Verantwortliche Kontaktieren",
      fr: "Contacter le responsable"
},
    contact: {
      en: "Contact",
      de: "Kontaktieren",
      fr: "Contacter"
},
    followers: {
      en: "Followers",
      de: "Followers",
      fr: "Followers"
},
    follower: {
      en: "follower",
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
      fr: "Suivi"
},
    like: {
      en: "Like",
      de: "Liken",
      fr: "J'aime"
},
    liked: {
      en: "Liked",
      de: "Geliked",
      fr: "Aimé"
},
    one_like: {
      en: "Like",
      de: "Like",
      fr: "Aime"
},
    likes: {
      en: "Likes",
      de: "Likes",
      fr: "J'aimes"
},
    leave_project: {
      en: "Leave project",
      de: "Projekt verlassen",
      fr: "Quitter le projet"
},
    in_collaboration_with: {
      en: "in collaboration with",
      de: "in Zusammenarbeit mit",
      fr: "En collaboration avec"
},
    total_duration: {
      en: "Total duration",
      de: "Gesamte Laufzeit",
      fr: "Durée Totale"
},
    project_description: {
      en: "Project description",
      de: "Projektbeschreibung",
      fr: "Description du projet"
},
    this_project_hasnt_added_a_description_yet: {
      en: "This project hasn't added a description yet.",
      de: "Zu diesem Projekt wurde noch keine Beschreibung hinzugefügt.",
      fr: "Ce projet n'a pas ecnore ajouté de description"
},
    this_project_is_not_looking_for_collaborators_right_now: {
      en: "This project is not looking for collaborators right now.",
      de: "Für dieses Projekt wird derzeit keine Unterstützung gesucht.",
      fr: "Ce projet ne recherche pas d'autres membres pour le moment"
},
    progress: {
      en: "Progress",
      de: "Fortschritt",
      fr: "Progrès"
},
    follow_the_project_to_be_notified_when_they_make_an_update_post: {
      en: "Follow the project to be notified when they make an update post.",
      de: "Folge dem Projekt, um benachrichtigt zu werden, wenn es ein Update gibt.",
      fr: "Suivre le projet pour être notifié lors d'une mise à jour "
},
    to_fight_climate_change_we_all_need_to_work_together: {
      en: `To fight climate change, we all need to work together! If you like the project, offer to
      work with the team to make it a success!`,
      de: `Um den Klimawandel zu bekämpfen, müssen wir alle zusammenarbeiten! Wenn dir das Projekt gefällt,
      biete einfach deine Mitarbeit im Team an, um es zu einem Erfolg zu machen!`,
      fr: `Pour lutter contre le changement climatique, nous devons tous travailler ensemble ! Si tu aimes ce projet,
      propose simplement de rejoindre l'équipe pour en faire un succès !`
},
    this_project_is_open_to_collaborators: {
      en: "This project is open to collaborators.",
      de: "Dieses Projekt ist offen für Mitwirkende.",
      fr: "Ce projet est ouvert aux nouveaux membres"
},
    helpful_skills_for_collaborating: {
      en: "Helpful skills for collaborating",
      de: "Hilfreiche Fähigkeiten, um mitzuwirken",
      fr: "Compétences utiles pour participer "
},
    connections_to_these_organizations_could_help_the_project: {
      en: "Connections to these organizations could help the project",
      de: "Connections zu diesen Organisationen könnten dem Projekt helfen",
      fr: "Contacte avec ces organisations pourrait aider"
},
    to_see_this_projects_team_members: {
      en: "to see this project's team  members",
      de: ", um die Teammitglieder dieses Projekts anzusehen",
      fr: "pour voir les membres de ce projet."
},
    to_see_this_projects_followers: {
      en: "to see this project's followers",
      de: ", um die Followers des Projektes zu sehen",
      fr: "pour voir les Followers de ce projet"
},
    to_see_this_projects_likes: {
      en: "to see this project's likes",
      de: ", um die Likes des Projektes zu sehen",
      fr: "pour voir les J'aimes de ce projet"
},
    we_could_not_find_any_members_of_this_project: {
      en: "We could not find any members of this project.",
      de: "Wir konnten keine Mitglieder für dieses Projekt finden.",
      fr: "On a pu trouver aucun membre sur ce projet"
},
    allow_collaboration_on_your_project: {
      en: "Allow collaboration on your project?",
      de: "Möchtest du Zusammenarbeit an deinem Projekt zulassen?",
      fr: "Autoriser les collaborations sur ce projet?"
},
    encourage_collaboration_to_make_your_project_a_success: {
      en: "Encourage collaboration to make your project a success?",
      de: "Möchtest du nach Mitwirkenden suchen, um dein Projekt zu einem Erfolg werden lassen?",
      fr: "Tu veux chercher d'autres membres pour faire de ton projet un succès ?"
},
    would_you_assist_in_the_replication_of_your_project: {
      en: "Would you assist in the replication of your project?",
      de:
        "Würdest du dabei unterstützen, wenn jemand dein Projekt auch umsetzen möchte, z.B. an einem anderen Ort?",
      fr: "Est ce que tu voudrais aider à ce que ton projet soit répliqué autre part?"
},
    add_skills_that_would_be_beneficial_for_collaborators_to_have: {
      en: "Add skills that would be beneficial for collaborators to have",
      de: "Füge Fähigkeiten hinzu, die hilfreich für Unterstützende wären",
      fr: "Ajouter les compétences qu'il serait utile aux futures membres d'avoir "
},
    add_skills_that_are_helpful_to_make_your_project_a_success: {
      en: "Add skills that are helpful to make your project a success",
      de: "Füge Fähigkeiten hinzu, die hilfreich sind, um das Projekt zu einem Erfolg zu machen",
      fr: "Ajouter les compétences qu'il serait utile d'avoir pour avoir encore plus d'impact avec le projet"
},
    add_skills_that_are_helpful_to_replicate_your_project: {
      en: "Add skills that are helpful to replicate your project",
      de: "Füge Fähigkeiten hinzu, die hilfreich sind, um das Projekt woanders umzusetzen",
      fr: "Ajouter les compétences qu'il serait utile d'avoir pour répliquer le projet"
},
    add_connections_that_would_be_beneficial_for_collaborators_to_have: {
      en: "Add connections that would be beneficial for collaborators to have",
      de: "Füge Connections hinzu, die hilfreich für Unterstützende sind",
      fr: "Ajoute les connections qu'il serait bien que les nouveaux membres aient"
},
    add_connections_that_would_be_beneficial_to_make_your_project_a_success: {
      en: "Add connections that would be beneficial to make your project a success",
      de: "Füge Connections hinzu, die hilfreich sind um das Projekt zu einem Erfolg zu machen",
      fr: "Ajoute les contacts qu'il serait bien d'avoir pour faire de ce projet un plus grand succés"
},
    add_connection_that_would_be_beneficial_to_have_to_replicate_your_project: {
      en: "Add connection that would be beneficial to have to replicate your project",
      de: "Füge Connections hinzu, die hilfreich sind, um das Projekt zu replizieren",
      fr: "Ajoute les contacts qu'il serait bien d'avoir pour répliquer ce projet"
},
    to_share_a_project: {
      en: "to share a project",
      de: ", um ein Projekt zu teilen",
      fr: "pour partager un projet"
},
    share_your_climate_solution: {
      en: "Share your Climate Solution",
      de: "Teile dein Klimaprojekt",
      fr: "Partage ton projet pour le climat"
},
    // This is for project join requests
    requesters_of: {
      en: "Requesters of",
      de: "Anforderer von",
      fr: "Demandeur de"
},
    //Kontext: Followers of Projektname
    followers_of: {
      en: "Followers of",
      de: "Follower von",
      fr: "Follower de"
},
    likes_of: {
      en: "Likes of",
      de: "Likes von",
      fr: "Aimé par"
},
    this_project_does_not_have_any_followers_yet: {
      en: "This project does not have any followers yet.",
      de: "Dieses Projekt hat noch keine Follower",
      fr: "Ce projet n'a pas encore de follower"
},
    this_project_does_not_have_any_likes_yet: {
      en: "This project does not have any likes yet.",
      de: "Dieses Projekt hat noch keine Likes",
      fr: "Ce projet n'a pas encore de J'aime"
},
    following_since: {
      en: "Following since",
      de: "Folgt seit",
      fr: "Suit depuis"
},
    liking_since: {
      en: "Liking since",
      de: "Gefällt seit",
      fr: "Aime depuis"
},
    delete_draft: {
      en: "Delete Draft",
      de: "Entwurf löschen",
      fr: "Supprimer le brouillon"
},
    delete_project: {
      en: "Delete Project",
      de: "Projekt löschen",
      fr: "Supprimer le projet"
},
    you_can_not_add_the_same_connection_twice: {
      en: "You can not add the same connection twice.",
      de: "Du kannst die gleiche Connection nicht zweimal hinzufügen.",
      fr: "Tu ne peux ajouter les mêmes contacts deux fois"
},
    personal: {
      en: "Personal",
      de: "Persönlich",
      fr: "Personnel"
},
    personal_project: {
      en: "Personal project",
      de: "Persönliches Projekt",
      fr: "Projet personnel"
},
    organizations_project: {
      en: "Organization's project",
      de: "Projekt einer Organisation",
      fr: "Projet de l'organisation"
},
    created_by: {
      en: "Created by",
      de: "Erstellt von",
      fr: "Créé par"
},
    project_status: {
      en: "Project status",
      de: "Projektstatus",
      fr: "Statut du projet"
},
    describe_your_project_in_detail_please_only_use_language: {
      en: "Describe your project in detail. Please only use English!",
      de: "Beschreibe dein Projekt im Detail.",
      fr: "Décris ton projet en détail"
},
    // \n\n creates two newlines
    describe_your_project_in_more_detail: {
      en: `Describe your project in more detail.\n\n-What are you trying to achieve?\n-How are you trying to achieve it\n-What were the biggest challenges?\n-What insights have you gained during the implementation?`,
      de: `Beschreibe dein Projekt detaillierter.\n\n-Was willst du erreichen?\n-Wie willst du es erreichen?\n-Was waren die größten Herausforderungen?\n-Welche Erkenntnisse hast du bei der Umsetzung gewonnen?`,
      fr: `Décris ton projet en détails.\n\n- Qu'est ce que vous essayez d'achever?\n-Quels sont vos problèmes\n-Qu'avez vous compris et réussi jusque là?`
},
    add_connections: {
      en: "Add Connections",
      de: "Connections hinzufügen",
      fr: "Ajouter des connexions"
},
    connection: {
      en: "Connection",
      de: "Connection",
      fr: "Contact"
},
    helpful_connections: {
      en: "Helpful Connections",
      de: "Hilfreiche Connections",
      fr: "Contacts utiles"
},
    add_a_helpful_connection: {
      en: "Add a helpful connection",
      de: "Füge eine hilfreiche Connection hinzu",
      fr: "Ajouter un contact utile"
},
    do_you_really_want_to_delete_your_project: {
      en: "Do you really want to delete your project?",
      de: "Möchtest du das Projekt wirklich löschen?",
      fr: "Veux-tu vraiment supprimer ton projet?"
},
    if_you_delete_your_project_it_will_be_lost: {
      en: "If you delete your project, it will be lost. Are you sure that you want to delete it?",
      de:
        "Wenn du dein Projekt löscht, geht es verloren. Bist du dir sicher, dass du es löschen möchtest?",
      fr: "Si tu supprimes ton projet, il sera perdu. Es-tu sûr de vouloir continuer?"
},
    briefly_summarise_what_you_are_doing_please_only_use_english: {
      en: "Briefly summarise what you are doing (up to 280 characters)\n\nPlease only use English!",
      de: "Fass kurz zusammen, was ihr tun (bis zu 280 Zeichen)",
      fr: "Explique briévement ce sur quoi vous travaillez (280 caractéres)"
},
    project_categories: {
      en: "Project categories",
      de: "Projektkategorien",
      fr: "Caégories de projet"
},
    project_website: {
      en: "Project website",
      de: "Webseite des Projektes",
      fr: "Site internet"
},
    if_your_project_has_a_website_you_can_enter_it_here: {
      en: "If your project has a website, you can enter it here.",
      de: "Falls dein Projekt eine Webseite hat, kannst du sie hier eintragen",
      fr: "Si ton projet à une page/site internet, tu peux la renseigner ici"
},
    edit_categories: {
      en: "Edit categories",
      de: "Kategorien bearbeiten",
      fr: "Changer les catégories"
},
    add_categories: {
      en: "Add categories",
      de: "Kategorien hinzufügen",
      fr: "Ajouter des catégories"
},
    project_name: {
      en: "Project name",
      de: "Projektname",
      fr: "Nom du projet"
},
    your_project_draft_is_missing_the_following_reqired_property: {
      en: "Your project draft is missing the following reqired property:",
      de: "In deinem Projektentwurf fehlt folgende erforderliche Eigenschaft:",
      fr: "Les champs suivants sont manquants: "
},
    you_have_successfully_edited_your_project: {
      en: "You have successfully edited your project.",
      de: "Du hast dein Projekt erfolgreich bearbeitet.",
      fr: "Tu as créé ton projet"
},
    your_project_has_been_published_great_work: {
      en: "Your project has been published. Great work!",
      de: "Dein Projekt wurde veröffentlicht. Gute Arbeit!",
      fr: "Ton projet à été publié. Bravo!"
},
    save_changes_as_draft: {
      en: "Save Changes as draft",
      de: "Veränderungen als Entwurf speichern",
      fr: "Enregistrer les modifications en tant que brouillon"
},
    save_as_draft: {
      en: "Save as draft",
      de: "Als Entwurf speichern",
      fr: "Enregistrer comme brouillon"
},
    you_have_successfully_deleted_your_project: {
      en: "You have successfully deleted your project.",
      de: "Du hast dein Projekt erfolgreich gelöscht.",
      fr: "Tu as supprimé ton projet"
},
    leave_without_saving_changes: {
      en: "Leave without saving changes?",
      de: "Verlassen, ohne Veränderungen zu speichern?",
      fr: "Quitter sans sauvegarder les modifications"
},
    do_you_really_want_to_leave_without_saving_your_changes: {
      en: "Do you really want to leave without saving your changes?",
      de: "Willst du wirklich gehen, ohne die Veränderungen zu speichern?",
      fr: "Tu veux vraiment quitter sans sauvegarder les modifications?"
},
    next_step: {
      en: "Next Step",
      de: "Nächster Schritt",
      fr: "Prochaine étape"
},
    climate_action_projects_shared_by_climate_connect_users: {
      en: "Climate action projects shared by Climate Connect users",
      de: "Klimaschutzprojekte, die Climate Connect Nutzer*innen geteilt haben",
      fr: "Projets environnementaux partagés par la communauté de Climate Connect"
},
    climate_action_projects_shared_by_climate_connect_users_text: {
      en: `Find the best climate change solutions from around the world. Get involved, share your own
      solutions or spread effective projects and ideas to your location.`,
      de: `Finde die besten Klimaprojekte aus aller Welt. Beteilige dich, teile deine eigenen Lösungen oder setze effektive Projekte auch bei dir vor Ort um.`,
      fr: `Trouve les meilleurs projets environnementaux à travers le monde. Engage toi et partage tes solutions autour de toi`
},
    show_all_projects: {
      en: "Show all projects",
      de: "Alle Projekte anzeigen",
      fr: "Montrer tous les projets"
},
    what_is_the_climate_impact_of_the_idea: {
      en: "What is the climate impact of the idea?",
      de: "Was ist der Klima-Impact deiner Idee?",
      fr: "Quel est l'impact environnemental de cette idée?"
},
    what_would_the_climate_impact_of_the_project_have_been: {
      en: "What would the climate impact of the project have been?",
      de: "Welchen Klima-Impact hätte das Projekt gehabt?",
      fr: "Quel aura été l'impact environnemental de ce projet?"
},
    what_was_or_is_the_climate_impact_of_the_project: {
      en: "What was/is the climate impact of the project?",
      de: "Was war/ist der Klima-Impact deines Projektes?",
      fr: "Qu'a été/est l'impact environnemental de ce projet?"
},
    what_are_you_trying_to_achieve: {
      en: "What are you trying to achieve?",
      de: "Was versuchst du zu erreichen?",
      fr: "Qu'essayes tu de faire?"
},
    what_were_you_trying_to_achieve: {
      en: "What were you trying to achieve?",
      de: "Was wolltest du erreichen?",
      fr: "Que voulais tu accomplir ?"
},
    what_did_you_achieve: {
      en: "What did you achieve?",
      de: "Was hast du erreichst?",
      fr: "Qu'est ce que tu as accompli?"
},
    what_are_you_achieving: {
      en: "What are you achieving?",
      de: "Was erreichst du gerade?",
      fr: "Qu'est ce que tu accomplis?"
},
    how_are_you_going_to_try_to_achieve_it: {
      en: "How are you going to try to achieve it?",
      de: "Wie wirst du versuchen, es zu erreichen?",
      fr: "Comment vas tu essayer d'y arriver?"
},
    how_are_you_trying_to_achieve_it: {
      en: "How are you trying to achieve it?",
      de: "Wie versuchst du es zu erreichen?",
      fr: "Comment vas tu y arriver?"
},
    how_did_you_try_to_achieve_it: {
      en: "How did you try to achieve it?",
      de: "Wie hast du versucht es zu erreichen?",
      fr: "Qu'as tu fait pour y arriver?"
},
    how_did_you_make_your_project_a_success: {
      en: "How did you make your project a success?",
      de: "Wie hast du dein Projekt zum Erfolg gemacht?",
      fr: "Comment as tu fait de ton projet un succés?"
},
    how_are_you_achieving_it: {
      en: "How are you achieving it?",
      de: "Wie erreichst du es?",
      fr: "Comment y arriver?"
},
    what_are_going_to_be_the_biggest_challenges: {
      en: "What are going to be the biggest challenges?",
      de: "Was werden die größten Herausforderungen?",
      fr: "Quels vont être les plus grands obstacles?"
},
    what_are_the_biggest_challenges: {
      en: "What are the biggest challenges?",
      de: "Was sind die größten Herausforderungen?",
      fr: "Quels sont les plus grands obstacles?"
},
    what_were_the_biggest_challenges: {
      en: "What were the biggest challenges?",
      de: "Was waren die größten Herausforderungen?",
      fr: "Quels ont été les plus grands obstacles?"
},
    which_insights_have_you_gained_so_far: {
      en: "Which insights have you gained so far?",
      de: "Welche Erkenntnisse hast du bisher gewonnen?",
      fr: "Qu'as tu compris jusque là?"
},
    which_insights_did_you_gain: {
      en: "Which insights did you gain?",
      de: "Welche Erkenntnisse hast du gewonnen?",
      fr: "Qu'as tu compris?"
},
    which_insights_did_you_gain_during_the_implementation: {
      en: "Which insights did you gain during the implementation?",
      de: "Welche Erkenntnisse hast du während der Umsetzung gewonnen?",
      fr: "Qu'as tu compris lors de la mise en oeuvre?"
},
    could_this_project_be_replicated_somewhere_else: {
      en: "Show all projects",
      de: "Alle Projekte anzeigen",
      fr: "Montrer tous les projets?"
},
    what_would_you_have_needed_to_make_this_project_a_sucess: {
      en: "What would you have needed to make this project a sucess?",
      de: "Was hättest du gebraucht, um das Projekt zu einem Erfolg werden zu lassen?",
      fr: "De quoi aurais tu eu besoin pour réussir ce projet?"
},
    how_can_this_project_be_replicated_by_other_climate_protectors: {
      en: "How can this project be replicated by other climate protectors?",
      de: "Wie kann dieses Projekt von anderen Klimaschützer*innen repliziert werden?",
      fr: "Comment ce projet pourrait être répliqué par d'autres?"
},
    please_touch_on_the_following_points_in_your_project_description: {
      en: "Please touch on the following points in your project description",
      de: "Bitte gehe in deiner Projektbeschreibung auf die folgenden Punkte ein",
      fr: "Les points suivants doivent être remplis"
},
    if_you_want_to_include_a_video_in_your_project_description: {
      en: `If you want to include a video: the first YouTube link will be converted to an embedded
      video on your project page.`,
      de: `Wenn du ein Video einbinden möchtest: Der erste YouTube-Link wird in ein eingebettetes
      Video auf deiner Projektseite umgewandelt.`,
      fr: `Si tu veux intégrer une vidéo: le premier lien YouTube sera transformé en vidéo intégré sur la page de ton projet. `
},
    role_in_project: {
      en: "Role in project",
      de: "Funktion/Aufgabe im Projekt",
      fr: "Rôle dans le projet"
},
    use_the_search_bar_to_add_members_to_your_project: {
      en: "Use the search bar to add members to your project.",
      de: "Benutze die Suchleiste, um Mitglieder zu deinem Projekt hinzuzufügen.",
      fr: "Utilise la barre de recherche pour ajouter des membres à ton projet."
},
    summarize_your_project: {
      en: "Summarize your project",
      de: "Fasse dein Projekt zusammen",
      fr: "Résumes ton projet"
},
    briefly_summarise_what_you_are_doing: {
      en: "Briefly summarize what you are doing (up to 280 characters)",
      de: "Fasse kurz zusammen, was du tust (bis zu 280 Zeichen)",
      fr: "Résumes rapidement ce que vous faites (280 caractéres max)"
},
    briefly_summarise_what_you_are_doing_part_one: {
      en: "Briefly summarise what you are doing (",
      de: "Fasse kurz zusammen, was ihr macht (",
      fr: "Résumes rapidement ce que vous faites("
},
    briefly_summarise_what_you_are_doing_part_two: {
      en: " / 280 characters)",
      de: " / 280 Zeichen)",
      fr: " / 280 caractéres)"
},
    search_for_your_team_members: {
      en: "Search for your team members",
      de: "Suche nach deinen Team-Mitgliedern",
      fr: "Cherche les membres de ton équipe"
},
    type_the_name_of_the_team_member_you_want_to_add_next: {
      en: "Type the name of the team member you want to add next.",
      de: "Gib den Namen des Team-Mitglieds ein, das du als nächstes hinzufügen möchtest.",
      fr: "Tape le nom des membres de ton équipe que tu souhaites ajouter"
},
    short_summary: {
      en: "Short summary",
      de: "Kurzzusammenfassung",
      fr: "Résumé"
},
    please_add_an_image: {
      en: "Please add an image!",
      de: "Bitte füge ein Bild hinzu!",
      fr: "Ajoute une image"
},
    general_information: {
      en: "General Information",
      de: "Allgemeine Information",
      fr: "Informations Générales"
},
    your_project_is: {
      en: "Your project is",
      de: "Dein Projekt ist",
      fr: "Ton projet est"
},
    add_photo_helptext: {
      en:
        "Upload a photo that represents your project. This way other climate protectors can see at a glance what your project is about. It is recommended to use a non-transparent image in 16:9 format.",
      de:
        "Lade ein Foto hoch, das dein Projekt repräsentiert. So können andere Klimaschützer*innen auf einen Blick sehen, worum es bei deinem Projekt geht. Wir empfehlen, ein nicht-transparentes Bild im Format 16:9 zu verwenden.",
      fr: "Télécharge une image qui représente ton projet. Comme ça tout le monde pourra comprendre de quoi il s'agit. On recommande d'utiliser une image non transparente au format 16:9."
},
    short_description_helptext: {
      en:
        "Summarize your project in fewer than 280 characters. Other climate protectors should be able to grasp what your project wants to achieve.",
      de:
        "Fasse dein Projekt in weniger als 280 Zeichen zusammen. Andere Klimaschützer*innen sollen verstehen, was dein Projekt erreichen will.",
      fr: "Résume ton projet en moins de 280 caractéres. Les autres acteurs doivent comprendre l'objectif de ton projet. "
},
    description_helptext: {
      en:
        "Describe your project in more detail. What are you exactly doing? What is the climate impact of your project?",
      de:
        "Beschreibe dein Projekt genauer. Was machst du genau? Was ist die Klimawirkung deines Projekts?",
      fr: "Décris ton projet plus en détails. Qu'est ce que vous cherchez exactement à accomplir? Quel est l'impact de votre projet?"
},
    collaboration_helptext: {
      en:
        "Select if you are would be open to accept help and work with other climate protectors on your project.",
      de:
        "Wähle aus, ob du offen bist, Hilfe anzunehmen und mit anderen Klimaschützer*innen an deinem Projekt zu arbeiten.",
      fr: "Choisis si tu es ouvert(e) à accepter de l'aide et à travailler sur ton projet avec d'autres personnes"
},
    add_skills_helptext: {
      en:
        "If you are looking for someone with specific skills to help you with your project, select these here.",
      de:
        "Wenn du jemanden mit bestimmten Fähigkeiten suchst, der*die dich bei deinem Projekt unterstützt, wähle diese hier aus.",
      fr: "Si tu cherches quelqu'un avec des compétences spécifiques pour t'aider dans ton projet, sélectionne-les ici"
},
    add_connections_helptext: {
      en:
        "Add connections that would be helpful for collaborators to have. Specifically this could be connections to organizations that could help accelerate your project.",
      de:
        "Füge Connections hinzu, die für Mitarbeitende hilfreich sein könnten. Konkret könnten dies Connections zu Organisationen sein, die dein Projekt beschleunigen könnten.",
      fr: "Ajoute des connexions qui pourraient être utiles aux nouveaux arrivants. Concrètement, il pourrait s'agir de contacts avec des organisations qui pourraient accélérer ton projet."
},
    search_for_collaborating_organizations: {
      en: "Search for collaborating organizations",
      de: "Suche nach Organisationen, mit denen du/ihr zusammenarbeitet",
      fr: "Recherche les organisations avec lesquelles vous collaborez"
},
    type_the_name_of_the_collaborating_organization_you_want_to_add_next: {
      en: "Type the name of the collaborating organization you want to add next.",
      de:
        "Gib den Namen der zusammenarbeitenden Organisation ein, die du als nächstes hinzufügen möchtest.",
      fr: "Tape le nom des autres organisations partenaires à ajouter"
},
    use_the_search_bar_to_add_collaborating_organizations: {
      en: "Use the search bar to add collaborating organizations.",
      de: "Verwende die Suchleiste, um zusammenarbeitende Organisationen hinzuzufügen.",
      fr: "Utilise la barre de recherche pour ajouter des organisations partenaires"
},
    responsible_organization: {
      en: "Responsible Organization",
      de: "Verantwortliche Organisation",
      fr: "Organisation responsable"
},
    responsible_person_project: {
      en: "Project Creator",
      de: "Verantwortliche*r",
      fr: "Responsable"
},
    responsible_person_idea: {
      en: "Idea Creator",
      de: "Ideenersteller*in",
      fr: "Créateur.ice de l'idée"
},
    responsible_person_org: {
      en: "Reponsible for organization",
      de: "Verantwortliche*r",
      fr: "Responsable de l'organisation"
},
    responsible_person_generic: {
      en: "Responsible",
      de: "Verantwortliche*r",
      fr: "Responsable"
},
    collaborating_organizations: {
      en: "Collaborating Organizations",
      de: "Zusammenarbeitende Organisation",
      fr: "Organisations partenraires"
},
    there_has_been_an_error_when_trying_to_publish_your_project: {
      en:
        "There has been an error when trying to publish your project. Check the console for more information.",
      de:
        "Beim Versuch dein Projekt zu veröffentlichen, ist ein Fehler aufgetreten. Prüfen die console für weitere Informationen.",
      fr: "Une erreur est apparue lors de la publication du projet. Vérifies la console pour plus d'informations"
},
    your_project_has_saved_as_a_draft: {
      en: "Your project has saved as a draft!",
      de: "Dein Projekt wurde als Entwurf gespeichert!",
      fr: "Ton projet a été sauvegardé en tant que brouillon"
},
    you_can_view_edit_and_publish_your_project_drafts_in_the: {
      en: (
        <>
          You can view, edit and publish your project drafts{" "}
          <a href={getLocalePrefix(locale) + "/profiles/" + user?.url_slug + "/#projects"}>
            in the my projects section
          </a>{" "}
          of your profile
        </>
      ),
      de: (
        <>
          Du kannst deine Projektentwürfe{" "}
          <a href={getLocalePrefix(locale) + "/profiles/" + user?.url_slug + "/#projects"}>
            im Bereich {"Meine Projekte"}
          </a>{" "}
          deines Profils ansehen, bearbeiten und veröffentlichen
        </>
      ),
      fr: (
        <>
          Tu peux voir, modifier et publier tes projets {" "}
          <a href={getLocalePrefix(locale) + "/profiles/" + user?.url_slug + "/#projects"}>
            dans la section mes projets {"Meine Projekte"}
          </a>{" "}
          de ton profil
        </>
      )
},
    congratulations_your_project_has_been_published: {
      en: "Congratulations! Your project has been published!",
      de: "Glückwunsch! Dein Projekt ist veröffentlicht worden!",
      fr: "Bravo! Ton projet a été publié!"
},
    we_are_really_happy_that_you_inspire_the_global_climate_action_community: {
      en: "We are really happy that you inspire the global climate action community!",
      de: "Wir freuen uns sehr, dass du die globale Klimaschutz-Community inspirierst!",
      fr: "C'est super tu va pouvoir inspirer les autres membres de la communauté!"
},
    you_can_view_your_project_here: {
      en: (
        <>
          You can view your project{" "}
          <a href={getLocalePrefix(locale) + "/projects/" + url_slug}>here</a>
        </>
      ),
      de: (
        <>
          Du kannst dein Projekt{" "}
          <a href={getLocalePrefix(locale) + "/projects/" + url_slug}>hier</a> ansehen
        </>
      ),
      fr: (
        <>
          Tu peux voir ton projet{" "}
          <a href={getLocalePrefix(locale) + "/projects/" + url_slug}>ici</a>
        </>
      )
},
    please_choose_at_least_one_category: {
      en: "Please choose at least one category!",
      de: "Bitte wähle mindestens eine Kategorie aus!",
      fr: "Choisis au moins une catégorie."
},
    you_can_only_choose_up_to_3_categories: {
      en: "You can only choose up to 3 categories.",
      de: "Du kannst nur bis zu 3 Kategorien auswählen",
      fr: "Tu ne peux choisir que 3 catégories max"
},
    you_can_combine_categories_text: {
      en: `You can combine categories. For example if you fund treeplanting, select both
      Afforestation/Reforestration and Funding.`,
      de: `Du kannst Kategorien kombinieren. Wenn du zum Beispiel Baumpflanzungen finanzierst, kannst du sowohl
      Aufforstung/Wiederaufforstung, als auch Finanzierung wählen.`,
      fr: `Tu peux combiner les catégories. Par exemple si tu finances la plantation d'arbre, tu peux choisir les catégories Reforestation et Financement`
},
    this_way_you_can_specify_what_you_are_doing_and_in_which_field: {
      en: "This way you can specify what you are doing and in which field.",
      de: "Auf diese Weise kannst du angeben, was du tust und in welchem Bereich.",
      fr: "Comme ça tu peux indiquer ce que tu fais et dans quel domaine. "
},
    if_your_organization_does_not_exist_yet_click_here: {
      en: (
        <>
          If your organization does not exist yet{" "}
          <Link href={getLocalePrefix(locale) + "/createorganization"} underline="always">
            click here
          </Link>{" "}
          to create it.
        </>
      ),
      de: (
        <>
          Wenn das Profil deiner Organisation noch nicht existiert,{" "}
          <Link href={getLocalePrefix(locale) + "/createorganization"} underline="always">
            klicke hier
          </Link>{" "}
          um sie zu erstellen.
        </>
      ),
      fr: (
        <>
          Si ton organisation n'existe pas encore{" "}
          <Link href={getLocalePrefix(locale) + "/createorganization"} underline="always">
            clique ici
          </Link>{" "}
          pour la créer.
          </>
      )  
},
    title_with_explanation_and_example: {
      en: "Title (Use a short, compelling title, e.g. 'Generating energy from ocean waves')",
      de: "Titel (Verwende einen kurzen Titel, z. B. 'Energiegewinnung aus Meereswellen')",
      fr: "Titre (Utilise un titre court et concis, ex 'Créer une coopérative énergétique')"
},
    use_a_title_that_makes_people_curious_to_learn_more_about_your_project: {
      en: "Use a title that makes people curious to learn more about your project",
      de: "Nimm einen Titel, der Menschen neugierig macht, mehr über dein Projekt zu erfahren",
      fr: "Utilise un titre qui donne envie aux gens d'en savoir plus sur ton projet."
},
    are_you_sure_you_want_to_leave_you_will_lose_your_project: {
      en: "Are you sure you want to leave? You will lose your project.",
      de: "Bist du sicher, dass du abbrechen willst? Du wirst dein Projekt verlieren.",
      fr: "Es-tu sûr.e de vouloir partir ? Tu perdras ton projet."
},
    add_team: {
      en: "Add team",
      de: "Team hinzufügen",
      fr: "Ajouter l'équipe"
},
    translate_project_intro: {
      en: (
        <>
          Because climate change is a global crisis it is important to us that projects are
          available in multiple languages. So far we support german, french and english.
          <br />
          If you click on {"automatically translate"} you can still edit the text afterwards. If you
          know the language you can of course also translate everything yourself. When you click on
          publish all empty fields will be translated automatically.
        </>
      ),
      de: (
        <>
          Da der Klimawandel eine globale Krise ist, ist es uns wichtig, dass alle Projekte auch auf
          Englisch und französisch verfügbar sind.
          <br />
          Wenn du auf {"Automatisch Übersetzen"} klickst, kannst du den Text immer noch bearbeiten.
          Natürlich kannst du auch alles selbst übersetzen. Wenn du auf {"Veröffentlichen"} klickst,
          werden alle leeren Felder automatisch übersetzt.
        </>
      ),
      fr: (
        <>
        Le changement climatique étant une crise mondiale, il est important pour nous que les projets soient disponibles 
        dans plusieurs langues. Jusqu'à présent, nous soutenons l'allemand, l'anglais et le français.
        <br />
        Si tu cliques sur {"traduction automatique"}, tu pourras encore modifier le texte par la suite.
        Si tu connais la langue, tu peux bien sûr traduire tout toi-même.
        Lorsque tu cliques sur publier, tous les champs vides seront traduits automatiquement.
        </>
      )
},
    basic_info: {
      en: "Basic Info",
      de: "Übersicht",
      fr: "Aperçu"
},
    project_category: {
      en: "Choose category",
      de: "Kategorie auswählen",
      fr: "Sélectionner une catégorie"
},
    allow_collaboration: {
      en: "Allow collaboration",
      de: "Zusammenarbeit zulassen",
      fr: "Accepter les collaborations"
},
    dont_allow_collaboration: {
      en: "Don't allow collaboration",
      de: "Keine Zusammenarbeit gewünscht",
      fr: "Ne pas accepter les collaborations"
},
    please_log_in_or_sign_up_to_share_a_project: {
      en: "Please log in or sign up to share a project",
      de: "Bitte logge dich ein oder registriere dich, um ein Projekt zu teilen",
      fr: "Connectes toi ou inscris toi pour partager un projet"
},
    internal_server_error: {
      en: "Internal Server Error",
      de: "Interner Serverfehler",
      fr: "Erreur serveur interne"
},
    number_of_likes: {
      en: "Number of likes",
      de: "Anzahl der Likes",
      fr: "Nombre de j'aimes"
},
    number_of_comments: {
      en: "Number of comments",
      de: "Anzahl an Kommentaren",
      fr: "Nombre de commentaires"
},
    error_when_publishing_project: {
      en: (
        <>
          There has been an error when publishing your project.
          <br />
          Please contact contact@climateconnect.earth for support
        </>
      ),
      de: (
        <>
          Beim Veröffentlichen deines Projektes gab es einen Fehler.
          <br /> Bitte wende dich an contact@climateconnect.earth.
        </>
      ),
      fr:  (
        <>
          Une erreur s'est produite lors de la publication de ton projet.
          <br /> Retourne sur le site contact@climateconnect.earth.
        </>
      )
},
    tell_others_about_this_project: {
      en: "Tell others about this project!",
      de: "Erzähle anderen von diesem Projekt!",
      fr: "Parle de ce projet aux autres !"
},
    climate_protection_project_by: {
      en: "Climate project by ",
      de: "Klimaschutzprojekt von ",
      fr: "Projet de",
},
    share_project_email_body: {
      en: `Hey,
      I found this awesome climate project: "${project?.name}"${
        project?.creator &&
        ` created by ${project.creator?.name ? project.creator?.name : creator?.name}`
      }.
      You should check it out here: `,
      de: `Hey,
      Ich habe gerade dieses spannende Klimaschutzprojekt gefunden: "${project?.name}"${
        project?.creator &&
        `, erstellt von ${project.creator?.name ? project.creator?.name : creator?.name}`
      }.
      Schau's dir doch mal an: `,
      fr: `Hey,
      J'ai trouvé ce projet environnemental génial :"${project?.name}"${
        project?.creator &&
        ` créé par ${project.creator?.name ? project.creator?.name : creator?.name}`
      }.
      Tu devrais venir le voir ici: `
},
    contact_creator_to_know_more_about_project: {
      en: `Contact ${creator?.first_name} if you want to chat about this project.`,
      de: `Kontaktiere ${creator?.first_name}, um über das Projekt zu reden.`,
      fr: `Contacte ${creator?.first_name} pour parler du projet`
},
    contact_creator_to_know_more_about_organization: {
      en: `Contact ${creator?.first_name} if you want to chat about this organization.`,
      de: `Kontaktiere ${creator?.first_name}, um über diese Organisation zu reden.`,
      fr: `Contacte ${creator?.first_name} pour tu veux parler de l'organisation.`
},
    contact_creator_to_know_more_about_idea: {
      en: `Contact ${creator?.first_name} if you want to chat about this project.`,
      de: `Kontaktiere ${creator?.first_name}, um über diese Organisation zu reden.`,
      fr: `Contacte ${creator?.first_name} pour disctuter du projet`
},
    no_open_project_join_requests: {
      en: "There are currently no open join requests",
      de: "Keine offenen Anfragen.",
      fr: "Il n'y a actuellement aucune demande d'adhésion en cours ",
},
    project_requesters_dialog_title: {
      en: "Open requests to join project",
      de: "Offene Anfragen zum Mitmachen",
      fr: "Besoin du projet"
},
    you_may_also_like_these_projects: {
      en: "You may also like these projects!",
      de: "Dir könnten diese Projekte auch gefallen!",
      fr: "Tu pourrais aussi aimer ces projets"
},
    view_all_projects: {
      en: "View all projects",
      de: "Alle Projekte anzeigen",
      fr: "Voir tous les projets"
},
    only_project_admins_can_view_join_requests: {
      en: "Only project admins can view join requests.",
      de: "Nur Projektadministratoren können sehen, wer mitmachen möchte.",
      fr: "Seul.es les admins du projet peuvent voir les demandes de participations "
},
    your_request_has_been_sent: {
      en: "We notified the project owner that you would like to join this project.",
      de: "Die Projektverantwortlichen wurden benachrichtigt, dass du gerne mitmachen möchtest.",
      fr: "Nous avons notifité le responsable du projet de ta demande de participation"
},
  };
}
