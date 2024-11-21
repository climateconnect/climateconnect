export default function getDashboardTexts({ user, location }) {
  return {
    climate_protection_in: {
      en: "Climate action in ",
      de: "Klimaschutz in ",
      fr: "Action environnementale à"
    },
    welcome_message_logged_in: {
      en: `Hi ${user?.first_name}! Let's make ${location?.city} climate neutral together!`,
      de: `Hi ${user?.first_name}! Lass uns gemeinsam ${location?.city} klimaneutral machen!`,
      fr: `Hey${user?.first_name}! Rendons ensemble ${location?.city} carbone neutre!`
    },
    welcome_message_logged_out: {
      en: `Great that you're here! Here you can see what is being done for the climate in ${location?.city} and how you can get involved!`,
      de: `Schön, dass du da bist! Hier siehst du, was in ${location?.city} für das Klima getan wird und kannst mitmachen!`,
      fr: `Super de t'avoir ici! Tu peux voir ce qui se fait pour l'environnement à ${location?.city} et comment t'engager !`
    },
    create_idea: {
      en: "Create Idea",
      de: "Idee erstellen",
      fr: "Créer une idée"
    },
    my_ideas: {
      en: "My Ideas",
      de: "Meine Ideen",
      fr: "Mes idées"
    },
    share_project: {
      en: "Share a project",
      de: "Ein Projekt teilen",
      fr: "Partager un projet"
    },
    create_organization: {
      en: "Create an organization",
      de: "Eine Organisation erstellen",
      fr: "Créé une organisation"
    },
    profile: {
      en: "Profile",
      de: "Profil",
      fr: "Profil"
    },
    find_engagement: {
      en: `Find how to best get involved in ${location}`,
      de: `Finde dein passendes Engagement in ${location}`,
      fr: `Trouve comment t'engager à  ${location}`
    },
    share_your_climate_project: {
      en: "Share your project with others",
      de: "Teile dein Projekt mit anderen",
      fr: "Partage ton projet avec les autres"
    },
    find_collaborators_for_your_idea: {
      en: "Find collaborators for your climate idea",
      de: "Finde Mitstreiter:innen für deine Klimaidee",
      fr: "Trouve des complices pour ton projet"
    },
    sign_up_now_to_make_a_difference: {
      en: "Sign up now to make a difference",
      de: "Jetzt anmelden und einen Unterschied machen",
      fr: "Inscris toi maintenant et fais la différence"
    },
  };
}
