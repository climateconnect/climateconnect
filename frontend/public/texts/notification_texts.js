export default function getNotificationTexts({ idea }) {
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
      en: "liked your project",
      de: "gefällt dein Projekt",
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
  };
}
