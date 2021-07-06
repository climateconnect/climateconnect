export default function getDashboardTexts({ user }) {
  return {
    climate_protection_in: {
      en: "Climate action in ",
      de: "Klimaschutz in ",
    },
    welcome_message_logged_in: {
      en: `Great to see you, ${user?.first_name}! Share your climate ideas and projects with the community from Erlangen!`,
      de: `Schön, dass du da bist, ${user?.first_name}! Teile dein Klimaschutzprojekt mit der Erlanger Community!`,
    },
    welcome_message_logged_out: {
      en: "",
      de:
        "Schön, dass du da bist! Hier siehst du, was in Erlangen das Klima getan wird und kannst mitmachen!",
    },
    create_idea: {
      en: "Create Idea",
      de: "Idee erstellen",
    },
    my_ideas: {
      en: "My Ideas",
      de: "Meine Ideen",
    },
    share_project: {
      en: "Share a project",
      de: "Ein Projekt teilen",
    },
    create_organization: {
      en: "Create an organization",
      de: "Eine Organisation erstellen",
    },
    profile: {
      en: "Profile",
      de: "Profil",
    },
  };
}
