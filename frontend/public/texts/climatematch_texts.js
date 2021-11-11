export default function getClimatematchTexts({ location, question }) {
  return {
    climate_match_title: {
      en: "ClimateMatch - Find out how you can best get involved in climate action",
      de:
        "ClimateMatch - Finde heraus, wie du dich am besten für den Klimaschutz engagieren kannst",
    },
    welcome_to_climate_match: {
      en: "Welcome to ClimateMatch!",
      de: "Willkommen beim ClimateMatch!",
    },
    loading_the_climatematch: {
      en: "Loading the ClimateMatch...",
      de: "Loading the ClimateMatch...",
    },
    start: {
      en: "Start",
      de: "Starten",
    },
    you_are_thinking_about_getting_aktiv_for_climate_action_we_make_it_easy: {
      en: `You are thinking about getting active for our climate ${
        location ? `in ${location}` : ""
      }? We make it easy!`,
      de: `Du überlegst, ${
        location ? `in ${location}` : ""
      } für den Klimaschutz aktiv zu werden? Wir machen es dir so einfach wie möglich!`,
    },
    answer_the_next_four_questions_to_get_suggestions: {
      en:
        "Just answer 4 questions and we show you which organizations, projects and ideas match with your skills and interests",
      de:
        "Beantworte einfach die 4 folgenden Fragen und wir zeigen dir, welche Organisationen, Projekte und Ideen am besten zu dir passen.",
    },
    lets_stop_the_climate_crisis_together_have_fun: {
      en: "Let's take on the climate crisis together. Have fun!",
      de: "Lass uns die Klimakrise gemeinsam anpacken. Viel Spaß!",
    },
    please_choose_at_least_one_answer_to_progress: {
      en: `Please choose at least ${
        question?.minimum_choices_required > 1
          ? question.minimum_choices_required + " options"
          : " one option"
      }.`,
      de: `Bitte wähle mindestens ${
        question?.minimum_choices_required > 1
          ? question.minimum_choices_required + " Optionen"
          : " eine Option"
      } aus.`,
    },
    suggestions_for_you: {
      en: "Suggestions For You",
      de: "Vorschläge für dich",
    },
    your_climate_match_results: {
      en: "Your ClimateMatch Results",
      de: "Deine ClimateMatch Ergebnisse",
    },
  };
}
