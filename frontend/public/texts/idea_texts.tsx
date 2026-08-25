import React from "react";
import DateDisplay from "../../src/components/general/DateDisplay";

const ONE_WEEK_IN_MINISECONDS = 1000 * 60 * 60 * 24 * 7;

export default function getIdeaTexts({ idea, creator }) {
  const olderThanOneWeek =
    new Date().getTime() - new Date(idea?.created_at).getTime() > ONE_WEEK_IN_MINISECONDS;

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
      de: "Der Ort, an dem du deine Idee umsetzen möchtest oder einfach der Ort, an dem du lebst",
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
      en: "Organisation's idea",
      de: "Idee einer Organisation",
    },
    choose_your_organization: {
      en: "Choose your organisation",
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
      de: "Deine Idee wird erstellt...",
    },
    sending_your_idea_to_our_server: {
      en: "Sending your idea to our server",
      de: "Deine Idee wird an unseren Server geschickt...",
    },
    saving_your_idea_in_our_database: {
      en: "Saving your idea in our database",
      de: "Deine Idee wird in unserer Datenbank gespeichert...",
    },
    preparing_your_idea_to_be_published: {
      en: "Preparing your idea to be published",
      de: "Die Veröffentlichung deiner Idee wird vorbereitet",
    },
    publishing_your_idea: {
      en: "Publishing your idea",
      de: "Deine Idee wird veröffentlicht",
    },
    the_ideas_creator: {
      en: "The idea's creator",
      de: "ErstellerIn der Idee",
    },
    x_people_rated_this_idea: {
      en: `${idea?.rating?.number_of_ratings} ${
        idea?.rating?.number_of_ratings.length > 1 ? "users have " : "user has "
      }
      rated this idea with an average score of ${idea?.rating?.rating_score}/100`,
      de: `${idea?.rating?.number_of_ratings} ${
        idea?.rating?.number_of_ratings.length > 1 ? "Personen haben " : "Person hat "
      }
      diese Idee mit einer durchschnittlichen Bewertung von ${idea?.rating?.rating_score} bewertet`,
    },
    nobody_has_rated_this_idea_yet: {
      en: "Nobody has rated this idea yet",
      de: "Diese Idee hat noch niemand bewertet",
    },
    join_in: {
      en: "Participate",
      de: "Mitmachen",
    },
    interactions: {
      en: "Interactions",
      de: "Interaktionen",
    },
    do_you_want_to_join: {
      en: "Join the group chat to discuss the idea?",
      de: "Dem Gruppenchat beitreten, um über die Umsetzung der Idee zu sprechen?",
    },
    do_you_want_to_join_text: {
      en:
        'If you participate you will be added to a group chat will all the other people clicked the "Participate" button. Do you want to participate?',
      de:
        'Wenn du mitmachst, wirst du zu einem Gruppenchat mit allen anderen, die "Mitmachen" geklickt haben, hinzugefügt. Möchtest du mitmachen?',
    },
    go_to_group_chat: {
      en: "Go to Group chat",
      de: "Gruppenchat öffnen",
    },
    open_chat: {
      en: "Open Chat",
      de: "Chat öffnen",
    },
    edit_idea: {
      en: "Edit idea",
      de: "Idee bearbeiten",
    },
    edit: {
      en: "Edit",
      de: "Bearbeiten",
    },
    edit_your_idee: {
      en: "Edit Your Idea",
      de: "Bearbeite deine Idee",
    },
    shared_this_idea_x_days_ago: {
      en: (
        <>
          created this idea {olderThanOneWeek && "on "}
          <DateDisplay date={new Date(idea?.created_at)} short />.
        </>
      ),
      de: (
        <>
          hat diese Idee {olderThanOneWeek && "am "}
          <DateDisplay date={new Date(idea?.created_at)} short /> erstellt.
        </>
      ),
    },
    please_sign_up_or_log_in_to_join_an_idea: {
      en: "Please sign up or log in to join an idea!",
      de: "Bitte melde dich an, um bei einer Idee mitumachen!",
    },
    please_sign_in_to_rate_an_idea: {
      en: "Please sign up or log in to rate an idea!",
      de: "Bitte melde dich an, um eine Idee zu bewerten!",
    },
    sign_up_or_log_in_to_share_an_idea: {
      en: "Please sign up or log in to share an idea!",
      de: "Bitte melde dich an, um eine Idee zu teilen!",
    },
    you_have_successfully_joined_the_idea_click_open_groupchat: {
      en: 'You have joined! Click on "Open Group Chat" to chat with the others.',
      de: 'Du machst jetzt mit! Klicke auf "Gruppenchat öffnen", um mit den anderen zu reden.',
    },
    idea_has_been_created: {
      en: "Congratulations, your idea has been created!",
      de: "Herzlichen Glückwunsch, deine Idee wurde erstellt!",
    },
    tell_others_about_this_idea: {
      en: "Tell others about this idea!",
      de: "Erzähle anderen von dieser Idee!",
    },
    climate_protection_idea_from: {
      en: "Climate protection idea from ",
      de: "Idee zum Klimaschutz von ",
    },
    share_idea_email_body: {
      en: `Hey,
      I found this awesome idea for climate protection: "${idea?.name}"${
        creator && ` created by ${creator}`
      }. 
      You should check it out here: `,
      de: `Hey,
      Ich habe gerade diese spannende Idee zum Klimaschutz gefunden: "${idea?.name}"${
        creator && ` erstellt von ${creator}`
      }. 
      Schau sie dir doch mal an: `,
    },
    loading_ideas: {
      en: "Loading comments...",
      de: "Kommentare werden geladen...",
    },
  };
}
