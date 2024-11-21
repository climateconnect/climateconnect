export default function getNotificationTexts({ idea, project }) {
  return {
    message_from: {
      en: "Message from",
      de: "Nachricht von",
      fr: "Message de"
    },
    message_in: {
      en: "Message in",
      de: "Nachricht in",
      fr: "Message en"
    },
    placeholder_notification: {
      en:
        "You're all caught up! Here you will be notified on private messages, interactions with your content and updates from projects you follow.",
      de:
        "Du bist auf dem aktuellsten Stand! Hier wirst du zu privaten Nachrichten, Interaktionen zu deinen Inhalten und Aktualisierungen zu Projekten, denen zu folgst, benachrichtigt.",
      fr: 
        "Tu es à jour! Ici tu verras tes notifications de message, les interactions avec ton contenu et les nouvelles des projets que tu suis."
    },
    comment_on: {
      en: "Comment on",
      de: "Kommentar zu",
      fr: "Commentaire sur"
    },
    reply_to_your_comment_on: {
      en: "Reply to your comment on",
      de: "Antwort auf deinen Kommentar zu",
      fr: "Réponse à ton sur"
    },
    now_follows_your_project: {
      en: "now follows your project",
      de: "folgt jetzt deinem Projekt",
      fr: "maintenant suis ton projet"
    },
    liked_your_project: {
      en: `liked your project "${project?.name}"`,
      de: `hat dein Projekt "${project?.name}" geliked`,
      fr: `a aimé ton projet "${project?.name}"`
    },
    go_to_inbox: {
      en: "Go to Inbox",
      de: "Zum Posteingang",
      fr: "Vers la boîte de réception"
    },
    joined_your_idea: {
      en: `is now participating in your idea ${idea?.name}`,
      de: `macht jetzt bei der Idee "${idea?.name}" mit`,
      fr: `participe maintenant à ton idée ${idea?.name}`
    },
    send_a_Message_to_welcome_them_in_the_group_chat: {
      en: "Send a message in the chat to welcome them!",
      de: "Schreibe eine Willkommensnachricht in den Chat!",
      fr: "Écris un message de bienvenue dans le chat!"
    },
    mentioned_you_in_comment_about_project: {
      en: `has mentioned you in a comment`,
      de: `hat dich in einem Kommentar erwähnt`,
      fr: `vous a mentionné dans un commentaire`
    },
    wants_to_join_your_project: {
      en: `wants to join your project "${project?.name}"`,
      de: `möchte bei deinem Project "${project?.name}" mitmachen`,
      fr: `veut rejoindre ton projet "${project?.name}"`
    },
    project_accepted_you_as_a_member: {
      en: `The project "${project?.name}" has accepted your request to join!`,
      de: `Das Project "${project?.name}" hat dich in's Team aufgenommen!`,
      fr: `Le projet "${project?.name}" t'a intégré à l'équipe !`
    },
    now_follows_your_organization: {
      en: "now follows your organization",
      de: "folgt jetzt deiner Organisation",
      fr: "suis maintenant ton organisation"
    },
    just_shared_project: {
      en: "just shared a project",
      de: "hat gerade ein Projekt geteilt",
      fr: "viens juste de partager un projet"
    },
    go_check_it_out: {
      en: "Go check it out!",
      de: "Schau es dir an!",
      fr: "Vas y jetter un oeil!"
    },
  };
}
