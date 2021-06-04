export default function getIdeaTexts({idea}) {
  return {
    share_your_idea_and_find_the_right_collaborators: {
      en: "Share your idea and find the right collaborators!",
      de: "Teile deine Idee und finde die richtigen Mitwirkenden!",
    },
    share_idea: {
      en: "SHARE IDEA",
      de: "IDEE TEILEN",
    },
    no_ideas_found: {
      en: "No ideas found.",
      de: "Keine Ideen gefunden.",
    },
    share_your_idea: {
      en: "Share Your Idea",
      de: "Teile Deine Idee",
    },
    create_an_idea_first_step_text: {
      en: "Share your climate idea to find collaborators or simply to inspire others.",
      de:
        "Teile deine Klimaschutzidee, um Mitstreiter*innen zu finden oder einfach andere zu inspirieren.",
    },
    please_choose_meaningful_idea_title: {
      en:
        "Important: Please use a meaningful title for your idea so that everybody instantly understand what it is about.",
      de:
        "Wichtig: Bitte gib deiner Idee einen aussagekräftigen Titel, damit jeder sofrt versteht, was gemeint ist.",
    },
    title: {
      en: "Title",
      de: "Titel",
    },
    image_optional: {
      en: "Image (optional)",
      de: "Bild (optional)",
    },
    choose_a_category: {
      en: "Choose a category",
      de: "Eine Kategorie auswählen",
    },
    give_your_idea_a_meaningful_title: {
      en: "Give your idea a meaningful title",
      de: "Gib deiner Idee einen aussagekräftigen Titel",
    },
    describe_idea_placeholder: {
      en: "Describe your idea short and precisely",
      de: "Beschreibe deine Idee möglichst genau, aber nicht zu ausfühlich",
    },
    create_idea_location_helper_text: {
      en: "The location where you want to implement this idea or just the location where you live",
      de: "Der Ort, an dem du deine Idee umsetzen möchtest oder einfach der Ort wo du lebst",
    },
    choose_a_location: {
      en: "Choose a location",
      de: "Suche einen Ort",
    },
    personal_idea: {
      en: "Personal Idea",
      de: "Persönliche Idee",
    },
    organizations_idea: {
      en: "Organization's idea",
      de: "Idee einer Organisation",
    },
    choose_your_organization: {
      en: "Choose your organization",
      de: "Wähle deine Organisation",
    },
    create_idea_add_metadata_motivation_text: {
      en:
        "Wow, great Idea! You're almost done and we're excited to see where your idea develops after sharing it!",
      de:
        "Wow, coole Idee! Du bist fast fertig und wir sind super gespannt, wie sich deine Idee entwickelt nachdem du sie geteilt hast!",
    },
    go_forward: {
      en: "Next Step",
      de: "Weiter",
    },
    your_idea_is_being_created: {
      en: "Your Idea is being created...",
      de: "Deine Idee wird erstellt..."
    },
    sending_your_idea_to_our_server: {
      en: "Sending your idea to our server",
      de: "Deine Idee wird an unseren Server geschickt..."
    },
    saving_your_idea_in_our_database: {
      en: "Saving your idea in our database",
      de: "Deine Idee wird in unserer Datenbank gespeichert..."
    },
    preparing_your_idea_to_be_published: {
      en: "Preparing your idea to be published",
      de: "Die Veröffentlichung deiner Idee wird vorbereitet"
    },
    publishing_your_idea: {
      en: "Publishing your idea",
      de: "Deine Idee wird veröffentlicht"
    },
    the_ideas_creator: {
      en: "The idea's creator",
      de: "ErstellerIn der Idee"
    },
    x_people_rated_this_idea: {
      en: `${idea?.rating?.number_of_ratings} ${idea?.rating?.number_of_ratings.length > 1 ? "users have " : "user has "}
      rated this idea with an average score of ${idea?.rating?.rating_score}/100`,
      de: `${idea?.rating?.number_of_ratings} ${idea?.rating?.number_of_ratings.length > 1 ? "Personen haben " : "Person hat "}
      diese Idee mit einer durchschnittlichen Bewertung von ${idea?.rating?.rating_score} bewertet`
    },
    nobody_has_rated_this_idea_yet: {
      en: "Nobody has rated this idea yet",
      de: "Diese Idee hat noch niemand bewertet"
    },
    join: {
      en: "Join",
      de: "Mitmachen"
    }
  };
}
