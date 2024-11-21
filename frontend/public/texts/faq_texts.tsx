import { Link } from "@mui/material";
import React from "react";

import { getLocalePrefix } from "../lib/apiOperations";

export default function getFaqTexts({ classes, locale }) {
  return {
    got_a_question: {
      en: "Got a question?",
      de: "Hast du eine Frage?",
      fr: "Une question ?"
    },
    faq: {
      en: "FAQ",
      de: "FAQ",
      fr: "FAQ"
    },
    find_your_answers_here: {
      en: "Find your answers here!",
      de: "Hier findest du deine Antworten!",
      fr: "Trouve tes réponses ici"
    },
    cant_find_the_answer_to_your_question_contact: {
      en: (
        <>
          {"Can't find the answer to your question? Contact "}
          <Link
            className={classes?.topText}
            href="mailto:contact@climateconnect.earth"
            target="_blank"
            underline="hover"
          >
            contact@climateconnect.earth
          </Link>
        </>
      ),
      de: (
        <>
          Du kannst die Antwort auf deine Frage nicht finden? Schreibe einfach an{" "}
          <Link
            className={classes?.topText}
            href="mailto:contact@climateconnect.earth"
            target="_blank"
            underline="hover"
          >
            contact@climateconnect.earth
          </Link>
        </>
      ),
      fr: (
        <>
          {"Tu ne trouves pas ta réponse? Contacte nous à "}
          <Link
            className={classes?.topText}
            href="mailto:contact@climateconnect.earth"
            target="_blank"
            underline="hover"
          >
            contact@climateconnect.earth
          </Link>
        </>
      )
    },
    search_for_keywords: {
      en: "Search for keywords",
      de: "Suche nach Stichwörtern",
      fr: "Recheche par mots clés"
    },
    search_results_for: {
      en: "Search results for",
      de: "Suche Ergebnisse für",
      fr: "Rechercher des résultats pour"
    },
    find_all_commonly_asked_questions_on_the_faq_page: {
      en: (
        <>
          Find all commonly asked questions and their answers on the{" "}
          <Link
            className={classes?.faqLink}
            href={getLocalePrefix(locale) + "/faq"}
            target="_blank"
            underline="hover"
          >
            FAQ page
          </Link>
          .
        </>
      ),
      de: (
        <>
          Finde alle regelmäßig gestellten Fragen und ihre Antworten auf der{" "}
          <Link
            className={classes?.faqLink}
            href={getLocalePrefix(locale) + "/faq"}
            target="_blank"
            underline="hover"
          >
            FAQ Seite
          </Link>
          .
        </>
      ),
      fr: (
        <>
          Trouve  toutes les questions communes et leurs réponses sur la{" "}
          <Link
            className={classes?.faqLink}
            href={getLocalePrefix(locale) + "/faq"}
            target="_blank"
            underline="hover"
          >
            page FAQ.
          </Link>
          .
        </>
      )
    },
  };
}
