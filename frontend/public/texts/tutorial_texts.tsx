import { Link } from "@mui/material";
import React from "react";
import { getLocalePrefix } from "../lib/apiOperations";

export default function getTutorialTexts({ hubName, classes, locale }) {
  return {
    click_here_to_go_back_to_tutorial: {
      en: "Click here to go back to the tutorial",
      de: "Klicke hier, um zum Tutorial zurückzukehren",
    },
    tutorial: {
      en: "Tutorial",
      de: "Tutorial",
    },
    welcome_to_climate_connect: {
      en: "Welcome to Climate Connect",
      de: "Willkommen bei Climate Connect",
    },
    tutorial_welcome_to_climate_connect_text_first_part: {
      en: "Climate Connect is a free collaboration platform for people taking climate action.",
      de:
        "Climate Connect ist eine kostenlose Kooperationsplattform für Menschen, die sich für Klimaschutz einsetzen.",
    },
    tutorial_welcome_to_climate_connect_text_last_part: {
      en: "Want to discover all the things you can do here?",
      de: "Möchtest du herausfinden, was du hier alles tun kannst?",
    },
    tutorial_lets_start_with_a_question: {
      en: "Let's start with a question",
      de: "Lass uns mit einer Frage starten",
    },
    tutorial_lets_start_with_a_question_text: {
      en: `Are you already involved in climate action, for example as a volunteer or in your
      professional life?`,
      de: `Engagierst du dich bereits ehrenamtlich oder beruflich für den Klimaschutz?`,
    },
    no_but_i_would_like_to: {
      en: "No, but I'd like to",
      de: "Nein, aber ich möchte",
    },
    tutorial_welcome_to_the_browse_page: {
      en: "Welcome to the browse page",
      de: "Willkommen auf der Browse-Seite",
    },
    great_that_you_are_already_a_climate_hero: {
      en: "Great that you're already a climate hero!",
      de: "Toll, dass du dich schon für unser Klima engagierst!",
    },
    here_you_can_browse: {
      en: `Here you can browse through all climate projects created by Climate Connect users. You
      can share your own (later 😉) or find the right people to connect with to multiply
      your impact.`,
      de: `Hier kannst du alle Projekte durchstöbern, die von Climate Connect Nutzern erstellt worden sind. Du kannst hier dein eigenes Projekt teilen oder die richtigen Leute finden, um deinen Einfluss auf das Klima zu vergrößern.`,
    },
    tutorial_welcome_to_the_browse_page_text_for_answer_soon: {
      en: `That's exciting, you have come to the right place to get started! 🌎 We need smart
      people like you to work together to solve this crisis. On this page you can browse
      through all climate projects created by Climate Connect members.`,
      de: `Das ist wunderbar, dann bist du bei uns genau richtig! 🌎 Wir brauchen kluge
      Menschen wie dich, um gemeinsam an der Lösung der Klimakrise zu arbeiten. Auf dieser Seite kannst du
      alle Klimaprojekte finden, die von Climate Connect Mitgliedern erstellt wurden.`,
    },
    tutorial_welcome_to_the_browse_page_text_for_answer_false: {
      en: `No worries, here is the right place to start off! On this page you can browse through
      all climate projects created by Climate Connect members.`,
      de: `Keine Sorge, hier ist der richtige Ort, um anzufangen! Auf dieser Seite findest du
      alle Klimaprojekte, die von Climate Connect Mitgliedern erstellt wurden.`,
    },
    welcome_to_the_hub_page: {
      en: `Welcome to the ${hubName} hub page!`,
      de: `Willkommen auf der Seite des ${hubName} Hub!`,
    },
    here_you_can_find_projects_in_hub: {
      en: (
        <>
          Here you can find climate action projects in the {hubName} hub that were created by
          Climate Connect members. You can find an overview of all projects on the{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: (
        <>
          Hier kannst du alle Projekte von Climate Connect Nutzer*innen im {hubName} Hub finden.
          Einen Überblick über alle Projekte erhälst du auf der{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            Browse
          </Link>{" "}
          Seite.
        </>
      ),
    },
    welcome_to_the_hub_page_text_for_answer_soon_first_part: {
      en: `That's exciting, you have come to the right place to get started! 🌎 We need smart
      people like you to work together to solve this crisis.`,
      de: `Das ist wunderbar, hier ist der richtige Ort, um anzufangen! 🌎 Wir brauchen kluge
      Menschen wie dich, um gemeinsam an der Lösung der Klimakrise zu arbeiten.`,
    },
    welcome_to_the_hub_page_text_for_answer_soon_second_part: {
      en: (
        <>
          Here you can find climate action projects in the {hubName} field that were created by
          Climate Connect members. You can find an overview of all projects on the{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: (
        <>
          Hier kannst du alle Projekte von Climate Connect Nutzern im Bereich {hubName} finden.
          Einen Überblick über alle Projekte erhälst du auf der{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            Browse
          </Link>{" "}
          Seite.
        </>
      ),
    },
    welcome_to_the_hub_page_text_for_answer_false_first_part: {
      en: "No worries, here is the right place to start off!",
      de: "Keine Sorge, hier ist der richtige Ort, um anzufangen!",
    },
    welcome_to_the_hub_page_text_for_answer_false_second_part: {
      en: (
        <>
          On this page you can find climate action projects in the {hubName} field that were created
          by Climate Connect members. You can find an overview of all projects on the{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: (
        <>
          Auf dieser Seite findest du Klimaschutzprojekte im Bereich {hubName}, die von Climate
          Connect Nutzern erstellt wurden. Auf der{" "}
          <Link
            href={getLocalePrefix(locale) + "/browse"}
            target="_blank"
            className={classes?.link}
            underline="hover"
          >
            Browse
          </Link>{" "}
          Seite findest du einen Überblick aller Projekte.
        </>
      ),
    },
    the_project_cards: {
      en: "The project cards!",
      de: "Die Projektkarten!",
    },
    the_project_cards_text_for_answer_true: {
      en: `Find interesting climate projects to collaborate with or get inspired by! Hover over a
      project card to see a short summary of what the project is about.`,
      de: `Finde interessante Projekte, um mitzumachen, zusammenarbeiten oder sich von ihnen inspirieren zu lassen.
	    Bewege den Mauszeiger über eine Vorschaukarte, um eine kurze Zusammenfassung des Projekts zu erhalten.`,
    },
    the_project_cards_text_for_answer_soon: {
      en: `Find interesting climate projects to join or maybe even get inspired to do something
      similar at your location! Hover over a card to see a short summary of what the project
      is about.`,
      de: `Finde interessante Projekte, um mitzumachen, zusammenarbeiten oder dich sogar von ihnen inspirieren zu lassen, um etwas Ähnliches in deiner Umgebung zu starten!
	    Bewege den Mauszeiger über eine Karte, um eine kurze Zusammenfassung des Projekts zu erhalten.`,
    },
    the_project_cards_text_for_answer_false: {
      en: `Find interesting climate projects to join or maybe even get inspired to do something
      similar at your location! Hover over a card to see a short summary of what the project
      is about.`,
      de: `Finde interessante Projekte zum Mitmachen oder lass dich inspirieren, etwas
      Ähnliches in deiner Umgebung anzufangen! Bewege den Mauszeiger über eine Karte, um
      eine kurze Übersicht über das Projekts zu erhalten.`,
    },
    filter_and_find_tutorial_headline: {
      en: "Filter and find what you're looking for",
      de: "Filtere deiner Suche und finde das, wonach du suchst",
    },
    filter_and_find_tutorial_text: {
      en: `Click on the "Filter" button to filter the projects, for example by location or
      category.`,
      de: `Klicke auf die Schaltfläche "Filter", um die Projekte zu filtern, z. B. nach Ort oder
      Kategorie.`,
    },
    filter_and_find_tutorial_text_for_answer_true: {
      en: `Click on the "Filter" button to filter the projects, for example by location or
      category.`,
      de: `Klicke auf die Schaltfläche "Filter", um die Projekte zu filtern, z. B. nach Ort oder
      Kategorie.`,
    },
    filter_and_find_tutorial_text_for_answer_soon: {
      en: `Click on the "Filter" button to filter the projects, for example by location, category or the skills they are looking for.`,
      de: `Klicke auf die Schaltfläche "Filter", um die Projekte zu filtern, z. B. nach Ort,
      Kategorie oder gesuchten Fähigkeiten.`,
    },
    filter_and_find_tutorial_text_for_answer_false: {
      en: `Click on the "Filter" button to filter the projects, for example by location or category.`,
      de: `Klicke auf die Schaltfläche "Filter", um die Projekte zu filtern, z. B. nach Ort oder
      Kategorie.`,
    },
    tabs_tutorial_headline: {
      en: "Tabs",
      de: "Tabs",
    },
    tabs_tutorial_text: {
      en: `Click on another tab to see all active organizations or members of Climate Connect.
      These are the faces behind the projects and the climate actors we strive to empower.`,
      de: `Klicke auf ein anderes Tab, um alle aktiven Organisationen oder Nutzer von Climate Connect zu sehen.
      Dies sind die Gesichter hinter den Projekten und die Klimaschützer:innen, die wir stärken möchten.`,
    },
    hubs_tutorial_headline: {
      en: "Climate action hubs",
      de: "Klimaschutz Hubs",
    },
    hubs_tutorial_text: {
      en: `Find plentiful information and effective and interesting projects in a specific field by clicking on one of the links to our hubs.`,
      de:
        "Finde eine Fülle von Informationen, sowie effektive und interessante Projekte in einem bestimmten Bereich, indem du auf einen der Links zu unseren Hubs klickst.",
    },
    quick_bits_tutorial_headline: {
      en: "Quick bits",
      de: "Kurze Infos",
    },
    quick_bits_tutorial_text: {
      en: `Every hub page provides a summary as well as detailed information about the impact of each sector.
      Additional statistics help you to put each sector into perspective.`,
      de: `Jede Hub-Seite bietet sowohl eine Zusammenfassung als auch detaillierte Informationen über die Auswirkungen der einzelnen Bereiche.
      Zusätzliche Statistiken helfen dir, jeden Bereich besser zu verstehen.`,
    },
    want_to_get_involved_in_this_sector_headline: {
      en: "Want to get involved in the sector?",
      de: "Möchtest du dich in diesem Bereich engagieren?",
    },
    want_to_get_involved_in_this_sector_text: {
      en: `By clicking on "Show projects" you directly get to the projects from this sector that have been shared by Climate Connect users.`,
      de: `Wenn du auf "Projekte anzeigen" klickst, gelangst du direkt zu den Projekten aus diesem Bereich,
      die von Climate Connect Nutzern geteilt wurden.`,
    },
    click_a_project_headline: {
      en: "Click a project",
      de: "Klicke auf ein Projekt",
    },
    click_a_project_text: {
      en: "Click on a project to find out more about it!",
      de: "Klicke auf ein Projekt, um mehr darüber herauszufinden!",
    },
    welcome_to_the_project_page_headline: {
      en: "Welcome to the project page!",
      de: "Willkommen auf der Projektseite!",
    },
    welcome_to_the_project_page_text: {
      en: `In the top section you can find a short summary (<280 characters) and the most important information about the project.
      If the first impression is interesting, you can dive deeper.`,
      de: `Im oberen Bereich findest du eine kurze Zusammenfassung (<280 Zeichen) und die wichtigsten Informationen zum Projekt.
      Wenn es dich interessiert, kannst du mehr darüber erfahren.`,
    },
    detailled_info_about_project_headline: {
      en: "More Detailled information about the project",
      de: "Detailliertere Informationen über das Projekt",
    },
    detailled_info_about_project_text: {
      en: `Here you can find more detailled information about the project, some projects even include a video.
      If you have a question or think something is missing you can get in contact with the creator. (more on that later)`,
      de: `Hier findest du detailliertere Infos über das Projekte. Einige Projekte haben sogar ein Video hinzugefügt.
      Wenn du eine Frage oder Anregung zum Projekt hast, kannst du die/den Ersteller*in direkt kontaktieren (Mehr dazu gleich)`,
    },
    collaboration_tutorial_headline: {
      en: "Collaboration",
      de: "Zusammenarbeit",
    },
    collaboration_tutorial_text: {
      en: `This section shows you if the project needs help in a specific area. If you are interested to get involved click the...`,
      de: `Dieser Abschnitt zeigt dir, ob das Projekt in einem bestimmten Bereich Hilfe benötigt. Wenn du interessiert bist, dich einzubringen, klicke auf den...`,
    },
    contact_button_tutorial_headline: {
      en: "Contact Button",
      de: "Kontakt Button",
    },
    contact_button_tutorial_text: {
      en: `Get in contact with the project creator directly in a private chat. Ask them how to get involved or any other question or suggestion you might have.
      Don't hesitate to use this button frequently, working together is the only way we're going to solve the climate crisis!`,
      de: `Nehme in einem privaten Chat direkt Kontakt mit der/dem Ersteller*in des Projekts auf. Frage sie oder ihn, wie du dich beteiligen kannst, oder jede andere Frage oder Anregung, die du hast.
      Zögere nicht, diesen Button häufig zu benutzen, denn nur gemeinsam können wir die Klimakrise lösen!`,
    },
    meet_and_discuss_tutorial_headline: {
      en: "Meet the team and discuss the project",
      de: "Triff das Team und bespreche das Projekt",
    },
    meet_and_discuss_tutorial_text: {
      en: `As an alternative to a direct message, you can comment and start a discussion. Also: find
      out who is working on the project in the team tab.`,
      de: `Alternativ zu einer direkten Nachricht kannst du einen Kommentar schreiben und eine Diskussion starten. Durch Klicken auf die
      Registerkarte "Team" findest du außerdem heraus, wer an dem Projekt arbeitet.`,
    },
    are_you_ready_tutorial_headline: {
      en: "Are you ready to join team climate?",
      de: "Bist du bereit Teil des Team Klima zu sein?",
    },
    are_you_ready_tutorial_text_for_answer_true: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis. Share you own organization and/or
      projects to get recognition, find new team members and spread your project worldwide.`,
      de: `Melde dich kostenlos bei Climate Connect an und werde Teil unserer internationalen Gemeinschaft von Menschen,
      die gemeinsam an der Lösung der Klimakrise arbeiten. Teile deine eigene Organisation und/oder
      Projekte, um Anerkennung zu erhalten, neue Teammitglieder zu finden und dein Projekt weltweit zu verbreiten.`,
    },
    are_you_ready_tutorial_text_for_answer_soon: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis.
      You'll be able to find the right project to work on with your skillset to make the
      biggest possible difference against climate change!`,
      de: `Melde dich kostenlos bei Climate Connect an und werde Teil unserer internationalen Gemeinschaft von Menschen,
      die gemeinsam an der Lösung der Klimakrise arbeiten. Du wirst das richtige Projekt für dich finden, zu dem du mit deinen Fähigkeiten beitragen kannst und
	    so den größtmöglichen Unterschied im Kampf gegen den Klimawandel zu machen!`,
    },
    are_you_ready_tutorial_text_for_answer_false_first_part: {
      en: "Do you agree that we can only solve the climate crisis through collaboration?",
      de: "Bist du auch der Meinung, dass wir die Klimakise nur gemeinsam lösen können?",
    },
    are_you_ready_tutorial_text_for_answer_false_last_part: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis`,
      de: `Melde dich kostenlos bei Climate Connect an und werde Teil unserer internationalen Community von Menschen,
      die gemeinsam an der Lösung der Klimakrise arbeiten.`,
    },
    lets_make_an_impact_together_tutorial_headline: {
      en: "Let's make an impact together!",
      de: "Lass uns gemeinsam etwas bewirken!",
    },
    lets_make_an_impact_together_tutorial_text: {
      en: `Great to have you on team climate. We would love to help you with any problem related to
      climate action! Thomas, our community manager will gladly connect you to the right people
      in the community!`,
      de: `Super, dich im Team Klima dabei zu haben. Wir helfen dir gerne bei allen Problemen zum Klimaschutz.
	    Thomas, unser Community-Manager, leitet dich gerne an die richtigen Leute in der Community weiter!`,
    },
    message_thomas: {
      en: "Message Thomas",
      de: "Thomas schreiben",
    },
  };
}
