export default function getNotificationTexts({ idea, project }) {
  return {
    message_from: {
      en: "Message from",
      de: "Nachricht von",
    },
    message_in: {
      en: "Message in",
      de: "Nachricht in",
    },
    placeholder_notification: {
      en:
        "You're all caught up! Here you will be notified on private messages, interactions with your content and updates from projects you follow.",
      de:
        "Du bist auf dem aktuellsten Stand! Hier wirst du zu privaten Nachrichten, Interaktionen zu deinen Inhalten und Aktualisierungen zu Projekten, denen zu folgst, benachrichtigt.",
    },
    comment_on: {
      en: "Comment on",
      de: "Kommentar zu",
    },
    reply_to_your_comment_on: {
      en: "Reply to your comment on",
      de: "Antwort auf deinen Kommentar zu",
    },
    now_follows_your_project: {
      en: "now follows your project",
      de: "folgt jetzt deinem Projekt",
    },
    liked_your_project: {
      en: `liked your project "${project?.name}"`,
      de: `hat dein Projekt "${project?.name}" geliked`,
    },
    go_to_inbox: {
      en: "Go to Inbox",
      de: "Zum Posteingang",
    },
    joined_your_idea: {
      en: `is now participating in your idea ${idea?.name}`,
      de: `macht jetzt bei der Idee "${idea?.name}" mit`,
    },
    send_a_Message_to_welcome_them_in_the_group_chat: {
      en: "Send a message in the chat to welcome them!",
      de: "Schreibe eine Willkommensnachricht in den Chat!",
    },
    mentioned_you_in_comment_about_project: {
      en: `has mentioned you in a comment`,
      de: `hat dich in einem Kommentar erwähnt`,
    },
    wants_to_join_your_project: {
      en: `wants to join your project "${project?.name}"`,
      de: `möchte bei deinem Project "${project?.name}" mitmachen`,
    },
    project_accepted_you_as_a_member: {
      en: `The project "${project?.name}" has accepted your request to join!`,
      de: `Das Project "${project?.name}" hat dich in's Team aufgenommen!`,
    },
    now_follows_your_organization: {
      en: "now follows your organization",
      de: "folgt jetzt deiner Organisation",
    },
    just_shared_project: {
      en: "just shared a project",
      de: "hat gerade ein Projekt geteilt",
    },
    go_check_it_out: {
      en: "Go check it out!",
      de: "Schau es dir an!",
    },
  };
}
