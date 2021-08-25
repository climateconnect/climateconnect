export default function getClimatematchTexts({location}) {
  return {
    climate_match_title: {
      en: "ClimateMatch - Find out how you can best get involved in climate action",
      de: "ClimateMatch - Finde heraus, wie du dich am besten für den Klimaschutz engagieren kannst"
    },
    welcome_to_climate_match: {
      en: "Welcome to ClimateMatch!",
      de: "Willkommen beim ClimateMatch!"
    },
    loading_the_climatematch: {
      en: "Loading the ClimateMatch...",
      de: "Loading the ClimateMatch..."
    },
    start: {
      en: "Start",
      de: "Starten"
    },
    you_are_thinking_about_getting_aktiv_for_climate_action_we_make_it_easy: {
      en: `You are thinking about getting active for our climate ${location ? `in ${location}` : ""}? We make it easy!`,
      de: `Du überlegst, ${location ? `in ${location}` : ""} für den Klimaschutz aktiv zu werden? Wir machen es dir so einfach wie möglich!`
    },
    answer_the_next_four_questions_to_get_suggestions: {
      en: "Just answer 4 questions and we show you which organizations, projects and ideas match with your skills and interests",
      de: "Beantworte einfach die 4 folgenden Fragen und wir zeigen dir, welche Organisationen, Projekte und Ideen am besten zu dir passen."
    },
    lets_stop_the_climate_crisis_together_have_fun: {
      en: "Let's take on the climate crisis together. Have fun!",
      de: "Lass uns die Klimakrise gemeinsam anpacken. Viel Spaß!"
    }
  }
}