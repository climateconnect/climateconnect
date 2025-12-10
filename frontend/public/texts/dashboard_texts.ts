export default function getDashboardTexts({ user, location }) {
  return {
    climate_protection_in: {
      en: "Climate action in ",
      de: "Klimaschutz in ",
    },
    welcome_message_logged_in: {
      en: `Hi ${user?.first_name}! Let's make ${location?.city} climate neutral together!`,
      de: `Hi ${user?.first_name}! Lass uns gemeinsam ${location?.city} klimaneutral machen!`,
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
      en: "Create an organisation",
      de: "Eine Organisation erstellen",
    },
    profile: {
      en: "Profile",
      de: "Profil",
    },
    find_engagement: {
      en: `Find how to best get involved in ${location}`,
      de: `Finde dein passendes Engagement in ${location}`,
    },
    share_your_climate_project: {
      en: "Share your project with others",
      de: "Teile dein Projekt mit anderen",
    },
    find_collaborators_for_your_idea: {
      en: "Find collaborators for your climate idea",
      de: "Finde Mitstreiter:innen für deine Klimaidee",
    },
    sign_up_now_to_make_a_difference: {
      en: "Sign up now to make a difference",
      de: "Jetzt anmelden und einen Unterschied machen",
    },
  };
}
