export default function getDashboardTexts({ user, location }) {
  return {
    climate_protection_in: {
      en: "Climate action in ",
      de: "Klimaschutz in ",
    },
    welcome_message_logged_in: {
      en: `Great to see you, ${user?.first_name}! Share your climate ideas and projects with the community from ${location?.city}!`,
      de: `Schön, dass du da bist, ${user?.first_name}! Teile dein Klimaschutzprojekt mit der Community aus ${location?.city}!`,
    },
    welcome_message_logged_out: {
      en: `Great that you're here! Here you can see what is being done for the climate in ${location?.city} and how you can get involved!`,
      de: `Schön, dass du da bist! Hier siehst du, was in ${location?.city} für das Klima getan wird und kannst mitmachen!`,
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
