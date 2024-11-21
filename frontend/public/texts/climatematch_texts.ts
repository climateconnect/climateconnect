export default function getClimatematchTexts({ location, question }) {
  return {
    climate_match_title: {
      en: "ClimateMatch - Find out how you can best get involved in climate action",
      de:
        "ClimateMatch - Finde heraus, wie du dich am besten für den Klimaschutz engagieren kannst",
      fr:"ClimateMatch - Trouve facilement comment participer localement"  
    },
    welcome_to_climate_match: {
      en: "Welcome to ClimateMatch!",
      de: "Willkommen beim ClimateMatch!",
      fr: "Bienvenue au ClimateMatch"
    },
    loading_the_climatematch: {
      en: "Loading the ClimateMatch...",
      de: "Lade das ClimateMatch...",
      fr: "Chargement du ClimateMatch..."
    },
    calculating_your_results: {
      en: "Calculating your results...",
      de: "Wir berechnen deine Ergebnisse...",
      fr: "Calcul des résultats..."
    },
    start: {
      en: "Start",
      de: "Starten",
      fr: "Commencer"
    },
    you_are_thinking_about_getting_aktiv_for_climate_action_we_make_it_easy: {
      en: `You are thinking about getting active for our climate ${
        location ? `in ${location}` : ""
      }? We make it easy!`,
      de: `Du überlegst, ${
        location ? `in ${location}` : ""
      } für den Klimaschutz aktiv zu werden? Wir machen es dir so einfach wie möglich!`,
      fr: `Tu voudrais t'engager  ${
        location ? `à ${location}` : ""
      }? On rend ça facile!`,
    },
    answer_the_next_four_questions_to_get_suggestions: {
      en:
        "Just answer 4 questions and we show you which organizations, projects and ideas match with your skills and interests",
      de:
        "Beantworte einfach die 4 folgenden Fragen und wir zeigen dir, welche Organisationen, Projekte und Ideen am besten zu dir passen.",
      fr:
        "Réponds simplement à ces 4 questions et on te présentera plusieurs organisations et projets qui te correspondent"
    },
    lets_stop_the_climate_crisis_together_have_fun: {
      en: "Let's take on the climate crisis together. Have fun!",
      de: "Lass uns die Klimakrise gemeinsam anpacken. Viel Spaß!",
      fr: "Au charbon et amuse toi bien !"
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
      fr: `Choisis au moins ${
        question?.minimum_choices_required > 1
          ? question.minimum_choices_required + " option"
          : " une option"
      }.`
    },
    suggestions_for_you: {
      en: "Suggestions For You",
      de: "Vorschläge für dich",
      fr: "Nos recommandations pour toi"
    },
    your_climate_match_results: {
      en: "Your ClimateMatch Results",
      de: "Deine ClimateMatch Ergebnisse",
      fr: "Tes suggestions ClimateMatch"
    },
    idea: {
      en: "Idea",
      de: "Idee",
      fr: "Idée"
    },
    idea_creator: {
      en: "created the idea",
      de: "hat die Idee erstellt",
      fr: "a créé cette idée"
    },
    projects_by: {
      en: "Projects shared by",
      de: "Projekte von",
      fr: "Projets partagés par"
    },
    you_havent_done_the_climatematch: {
      en: "You have to first do the ClimateMatch before seeing your results.",
      de: "Bevor du deine Ergebnisse sehen kannst, musst du erst mal das ClimateMatch machen.",
      fr: "Tu dois d'abord faire le ClimateMatch avant de pouvoir voir les résultats"
    },
    get_active_now_with_climatematch: {
      en: "ClimateMatch - get active now",
      de: "ClimateMatch - werde jetzt aktiv",
      fr: "ClimateMatch - passe à l'action maintenant"
    },
    your_last_result: {
      en: "Last result",
      de: "letztes Ergebnis",
      fr: "Dernier résultat"
    },
    restart: {
      en: "restart",
      de: "Neu starten",
      fr: "Recommencer"
    },
    climatehub: {
      en: "ClimateHub",
      de: "ClimateHub",
      fr: "ClimateHub"
    },
    please_create_an_account_or_log_in_to_contact_a_projects_organizer: {
      en: "Please sign up to get in contact with others.",
      de: "Bitte melde dich an, um Menschen zu kontaktieren.",
      fr: "Inscris toi pour pourvoir échanger avec les autres"
    },
  };
}
