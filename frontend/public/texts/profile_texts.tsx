import { Link } from "@mui/material";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getProfileTexts({ profile, locale }) {
  return {
    no_members_found: {
      en: "No members found. Try changing or removing your filter or search query.",
      de: "Keine Mitglieder gefunden. Versuche, die Filterung oder deine Suchanfrage anzupassen.",
      fr: "Aucun membre trouvé. Essaie d'adapter le filtrage ou ta recherche."
    },
    availability_user_profile_missing_message: {
      en: "This user hasn't specified their availibility yet.",
      de:
        "Diese(r) Benutzer*in hat noch nicht angegeben, wie viele Stunden pro Woche er/sie erreichbar ist.",
      fr: "Ce membre n'a pas encore indiqué ses disponibilités"
    },
    add_skill: {
      en: "Add skill",
      de: "Fähigkeit hinzufügen",
      fr: "Ajouter une compétence"
    },
    skills_user_profile_missing_message: {
      en: "This user hasn't added any skills yet.",
      de: "Diese(r) Benutzer*in hat seine/ihre Fähigkeiten noch nicht angegeben.",
      fr: "Ce membre n'a pas encore ajouté de compétences"
    },
    bio: {
      en: "About You (Bio)",
      de: "Über dich (Bio)",
      fr: "A propos de toi (Bio)"
    },
    enter_profile_bio_helptext: {
      en:
        "What got you interested in climate action? What do you do? What are you looking for and/or offering? (",
      de:
        "Was hat dein Interesse an Klimaschutz geweckt? Was machst du beruflich? Suchst du nach etwas bestimmten? (",
      fr: 
        "Qu'est ce qui t'intéresse dans l'action environnementale? Que fais tu ? Et que cherches tu ou souhaite offrir?"
    },
    bio_user_profile_missing_message: {
      en: "This user hasn't added a bio yet.",
      de: "Diese(r) Benutzer*in hat noch keine Bio hinzugefügt.",
      fr: "Ce membre n'a pas encore ajouté de résumé"
    },
    location_user_profile_missing_message: {
      en: "This user hasn't specified their location yet.",
      de: "Diese(r) Benutzer*in hat seinen Standort noch nicht angegeben.",
      fr: "Ce membre n'a pas encore indiqué son lieu"
    },
    choose_what_permissions_the_user_should_have: {
      en: "Choose what permissions the user should have.",
      de: "Wähle aus, welche Berechtigungen der/die Benutzer*in haben soll",
      fr: "Choisis les autorisations que le membre doit avoir"
    },
    role_in_project: {
      en: "Role in project",
      de: "Rolle im Projekt",
      fr: "Rôle dans le projet"
    },
    role_in_organization: {
      en: "Role in organization",
      de: "Rolle in der Organisation",
      fr: "Rôle dans l'organisation"
    },
    pick_or_describe_role_in_organization: {
      en: "Pick or describe what the user's role in the organization is.",
      de: "Wähle oder beschreibe, welche Rolle der/die Benutzer*in in der Organisation hat.",
      fr: "Sélectionne ou décris le rôle du membre dans l'organisation"
    },
    pick_or_describe_role_in_project: {
      en: "Pick or describe what the user's role in the project is.",
      de: "Wähle oder beschreibe, welche Rolle der/die Benutzer*in im Projekt hat.",
      fr: "Sélectionne ou décris le rôle du membre dans le projet"
    },
    pick_or_type_users_role: {
      en: "Pick or type user's role",
      de: "Rolle beschreiben",
      fr: "Sélectionne ou décris le rôle du membre"
    },
    hours_contributed_per_week: {
      en: "Hours contributed per week",
      de: "Beigetragene Wochenstunden",
      fr: "Contribution en heure par semaine"
    },
    pick_how_many_hours_user_contributes_to_org: {
      en: "Pick how many hours per week the user contributes to this organization on average.",
      de:
        "Wähle aus, wie viele Stunden pro Woche der/die Benutzer*in im Durchschnitt zu dieser Organisation beiträgt.",
      fr: 
        "Choisis combien d'heures par semaine le membre contribue en moyenne pour ton organisation"
    },
    pick_how_many_hours_user_contributes_to_project: {
      en: "Pick how many hours per week the user contributes to this project on average.",
      de:
        "Wähle aus, wie viele Stunden pro Woche der/die Benutzer*in im Durchschnitt zu diesem Projekt beiträgt.",
      fr: "Choisis combien d'heures par semaine le membre contribue en moyenne sur ton projet"
    },
    do_you_really_want_to_lose_creators_permissions: {
      en: "Do you really want to lose Super Admin permissions?",
      de: "Willst du wirklich deine Super-Admin-Rechte verlieren?",
      fr: "Veux tu vraiment perdre les droits de Super Admin?"
    },
    there_is_always_one_org_member_with_creator_privileges: {
      en: "There is always exactly one organization member with Super Admin privileges.",
      de: "Es gibt immer genau ein Organisationsmitglied mit Super-Admin-Rechten.",
      fr: "Il doit toujours n'y avoir qu'un Super Admin par organisation"
    },
    there_is_always_one_project_member_with_creator_privileges: {
      en: "There is always exactly one project member with Super Admin privileges.",
      de: "Es gibt immer genau ein Projektmitglied mit Super-Admin-Rechten.",
      fr: "Il n'y a toujours qu'un seul Super Admin par projet."
    },
    creator_can_add_remove_and_edit_admins: {
      en: "The Super Admin can add, remove and edit Administrators.",
      de: "Der Super Admin kann Admins hinzufügen, entfernen und bearbeiten.",
      fr: "Le Super Admin peut ajouter, retirer et modifier les administrateurs de la page."
    },
    if_you_make_person_admin_you_will_lose_privileges: {
      en: `If you make ${profile?.name} the Super Admin you will lose your Super Admin permissions.`,
      de: `Wenn du ${profile?.name} zum/zur Super Admin machst, verlierst du deine Super-Admin-Rechte`,
      fr: `En rendant ${profile?.name} le.a Super Admin de la page tu perdras ce statut.`
    },
    do_you_really_want_to_do_this: {
      en: "Do you really want to do this?",
      de: "Willst du das wirklich tun?",
      fr: "Confirmer ?"
    },
    is_a_suborganization_of: {
      en: "is a suborganization of",
      de: "ist eine Unterorganisation von",
      fr: "est une sous organisation de"
    },
    persons_profile: {
      en: `${profile?.name}'s Profile`,
      de: `${profile?.name}'s Profil`,
      fr: `profile de ${profile?.name}`
    },
    to_see_this_users_full_information: {
      en: "to see this user's full information",
      de: ", um die vollständigen Informationen dieses/dieser Benutzer*in zu sehen",
      fr: "pour voir toutes les informations du membre"
    },
    your_projects: {
      en: "Your climate projects",
      de: "Deine Klimaschutzprojekte",
      fr: "Tes projets environnementaux"
    },
    this_users_projects: {
      en: `${profile?.first_name}'s Climate Projects`,
      de: `Klimaschutzprojekte von ${profile?.first_name}`,
      fr: `projets environnementaux de ${profile?.first_name}`
    },
    your_ideas: {
      en: "Your climate ideas",
      de: "Deine Klimaschutzideen",
      fr: "Tes idées pour l'environnement"
    },
    this_users_ideas: {
      en: `Climate Ideas ${profile?.first_name} is involved in`,
      de: `Klimaschutz Ideen, bei denen ${profile?.first_name} mitmacht`,
      fr: `Les idées d'action dont ${profile?.first_name} fait partie.`
    },
    /*context: You are...*/
    not_involved_in_any_projects_yet: {
      en: "not involved in any climate projects yet!",
      de: "noch nicht an Klima-Projekten beteiligt!",
      fr: "n'est pas encore impliqué.e dans un projet!"
    },
    not_involved_in_any_ideas_yet: {
      en: "not involved in any climate ideas yet!",
      de: "ist bisher bei keiner Klimaschutzidee dabei!",
      fr: "n'a pas encore rejoint d'idée de projet!"
    },
    your_organizations: {
      en: "Your organizations",
      de: "Deine Organisationen",
      fr: "Tes organisations"
    },
    this_users_organizations: {
      en: `${profile?.first_name}'s Organizations`,
      de: `Organisationen von ${profile?.first_name}`,
      fr: `les organisations de ${profile?.first_name}`,
    },
    /*context: You are...*/
    not_involved_in_any_organizations_yet: {
      en: "not involved in any organizations yet!",
      de: "noch in keiner Organisation engagiert!",
      fr: "n'a pas encore rejoint d'organisation!"
    },
    sign_up_message: {
      en: "You are now a Climate Connect member. On this page you can customize your profile.",
      de:
        "Du bist jetzt ein Climate Connect Mitglied. Auf dieser Seite kannst du dein Profil anpassen.",
      fr: "Tu fais maintenant partie de la communauté Climate Connect. Sur cette page tu peux modifier ton profil."
    },
    account_created: {
      en: "Account created",
      de: "Konto erstellt",
      fr: "Compté créé."
    },
    congratulations: {
      en: "Congratulations!",
      de: "Glückwunsch!",
      fr: "Félicitations!"
    },
    congratulations_you_have_created_your_account: {
      en: "Congratulations, you have created your account!",
      de: "Glückwunsch, du hast dein Konto erfolgreich erstellt!",
      fr: "Félicitations, tu as créé ton compte!"
    },
    just_one_more_step_to_complete_your_signup: {
      en: "One final step to join Climate Connect!",
      de: "Nur noch ein Schritt, um deine Anmeldung abzuschließen!",
      fr: "Plus qu'une dernière étape pour rejoindre la communauté de Climate Connect"
    },
    please_click_on_the_link_we_emailed_you_to_activate_your_account: {
      en: "Please click on the link we just emailed you to activate your account.",
      de: "Bitte klicke auf den Link, um dein Konto zu aktivieren.",
      fr: "Cliques juste sur le lien qu'on t'a envoyé par email pour activer ton compte."
    },
    make_sure_to_also_check_your_spam: {
      en: "Make sure to also check your spam/junk folder in case you can't find the link.",
      de: "Bitte überprüfe auch deinen Spam-/Junk-Ordner, falls du die E-Mail nicht finden kannst.",
      fr: "N'oublie pas de regarder tes dossiers spams/indésirables si tu ne trouves pas l'email."
    },
    if_you_are_experiencing_any_problems_contact_us: {
      en: "If you are experiencing any problems, email us at contact@climateconnect.earth",
      de:
        "Wenn du Probleme haben solltest, kontaktiere uns einfach unter contact@climateconnect.earth",
      fr: "En cas de problème n'hésite pas à nous écrir à: contact@climateconnect.earth"
    },
    if_the_email_does_not_arrive_after_5_minutes: {
      en: (
        <>
          If the email does not arrive after 5 minutes,{" "}
          <Link href={getLocalePrefix(locale) + "/resend_verification_email"} underline="hover">
            click here
          </Link>{" "}
          to resend it.
        </>
      ),
      de: (
        <>
          Wenn die E-Mail nach 5 Minuten noch nicht angekommen ist,{" "}
          <Link href={getLocalePrefix(locale) + "/resend_verification_email"} underline="hover">
            klicke hier
          </Link>
          , um sie erneut versenden zu lassen.
        </>
      ),
      fr: (
        <>
          Si l'email n'est pas arrivé aprés 5 minutes,{" "}
          <Link href={getLocalePrefix(locale) + "/resend_verification_email"} underline="hover">
            clique ici
          </Link>
          , pour en recevoir un nouveau.
        </>
      )
    },
    you_have_successfully_updated_your_profile: {
      en: "You have successfully updated your profile!",
      de: "Du hast dein Profil erfolgreich aktualisiert!",
      fr: "Ton profil a été mis à jour!"
    },
    new_to_climate_connect: {
      en: "New to Climate Connect?",
      de: "Neu bei Climate Connect?",
      fr: "Nouveau sur Climate Connect?"
    },
    click_here_to_create_an_account: {
      en: "Click here to create an account",
      de: "Klicke hier, um ein Konto zu erstellen",
      fr: "Clique ici pour te créer un compte"
    },
    forgot_your_password: {
      en: "Forgot your password?",
      de: "Passwort vergessen?",
      fr: "Mots de passe oublié?"
    },
    not_verified_error_message: {
      en: (
        <>
          You have not activated you account yet. Click the link in the email we sent you or{" "}
          <Link
            href={getLocalePrefix(locale) + "/resend_verification_email"}
            target="_blank"
            underline="hover"
          >
            click here
          </Link>{" "}
          to send the verification link again.
        </>
      ),
      de: (
        <>
          Du hast dein Konto noch nicht aktiviert. Klicke auf den Link in der E-Mail, die wir dir
          geschickt haben, oder{" "}
          <Link
            href={getLocalePrefix(locale) + "/resend_verification_email"}
            target="_blank"
            underline="hover"
          >
            klicke hier
          </Link>{" "}
          , um edie Bestätigungsemail mit dem Verifizierungslink erneut zu erhalten.
        </>
      ),
      fr: (
        <>
          Tu n'as pas encore activé ton compte. Clique sur le lien dans l'e-mail qu'on t'a envoyé, ou{" "}
          <Link
            href={getLocalePrefix(locale) + "/resend_verification_email"}
            target="_blank"
            underline="hover"
          >
            clique ici
          </Link>{" "}
          , pour renvoyer le lien de vérification.
        </>
      )
    },
    passwords_dont_match: {
      en: "Passwords don't match.",
      de: "Die Passwörter stimmen nicht überein.",
      fr: "Les mots de passes ne correspondent pas"
    },
    first_name: {
      en: "First Name",
      de: "Vorname",
      fr: "Prénom"
    },
    last_name: {
      en: "Last Name",
      de: "Nachname",
      fr: "Nom"
    },
    i_would_like_to_receive_emails_about_updates_news_and_interesting_projects: {
      en: "I would like to receive emails about updates, news and interesting projects",
      de: "Ich möchte E-Mails über Updates, Neuigkeiten und interessante Projekte erhalten",
      fr: "Je souhaite recevoir des e-mails sur les mises à jour, les nouveautés et les projets intéressants"
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
      de: (
        <>
          Ich erkläre mich mit den{" "}
          <a href={getLocalePrefix(locale) + "/terms"} target="_blank" rel="noreferrer">
            Nutzungsbedingungen
          </a>{" "}
          und den{" "}
          <a href={getLocalePrefix(locale) + "/privacy"} target="_blank" rel="noreferrer">
            Datenschutzbestimmungen
          </a>{" "}
          einverstanden.
        </>
      ),
      fr: (
        <>
          J'accepte les {" "}
          <a href={getLocalePrefix(locale) + "/terms"} target="_blank" rel="noreferrer">
            Conditions générales d'utilisations
          </a>{" "}
          et{" "}
          <a href={getLocalePrefix(locale) + "/privacy"} target="_blank" rel="noreferrer">
          Politique de confidentialité
          </a>
          .
        </>
      )
    },
    signup_step_2_headline: {
      en: "Step 2: A little bit about yourself",
      de: "Schritt 2: Ein paar Infos über dich",
      fr: "Etape 2: Quelques infos sur toi"
    },
    repeat_password: {
      en: "Repeat Password",
      de: "Passwort wiederholen",
      fr: "Répéter le mots de passe"
    },
    profile: {
      en: "Profile",
      de: "Profil",
      fr: "Profil"
    },
    translate_profile_intro: {
      en: "",
      de: (
        <>
          Da der Klimawandel eine globale Krise ist, ist es uns wichtig, dass alle Profile auch auf
          Englisch verfügbar sind.
          <br />
          Wenn du auf {"Automatisch Übersetzen"} klickst, kannst du den Text immer noch bearbeiten.
          Natürlich kannst du auch alles selbst übersetzen. Wenn du auf {"Veröffentlichen"} klickst,
          werden alle leeren Felder automatisch übersetzt.
        </>
      ),
      fr: (
        <>
          Comme le changement climatique est une crise mondiale, il est important pour nous que tous les profils
          soient disponibles en anglais.
          <br />
          Si tu ne t'y sens pas {"Traduction Automatique"}, ton résumé sera directement traduit mais tu peux toujours adapter le texte après coup si jamais. 
          Bien sûr, tu peux aussi tout traduire toi-même. Si tu cliques sur {"Publier"} tous les champs vides seront automatiquement traduits.
        </>
      )
    },
    user_name_is: {
      en: `${profile?.first_name} is`,
      de: `${profile?.first_name} ist`,
      fr: `${profile?.first_name} est`
    },
  };
}
