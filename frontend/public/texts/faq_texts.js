import { Link } from "@material-ui/core";
import React from "react";

import { getLocalePrefix } from "../lib/apiOperations";

export default function getFaqTexts({ classes, locale }) {
  return [
    {
      got_a_question: {
        en: "Got a question?",
        de: "Hast du eine Frage?",
      },
      faq: {
        en: "FAQ",
        de: "FAQ",
      },
      find_your_answers_here: {
        en: "Find your answers here!",
        de: "Hier findest du deine Antworten!",
      },
      cant_find_the_answer_to_your_question_contact: {
        en: "Can't find the answer to your question? Contact contact@climateconnect.earth.",
        de:
          "Du kannst die Antwort auf deine Frage nicht finden? Schreibe einfach an contact@climateconnect.earth.",
      },
      search_for_keywords: {
        en: "Search for keywords",
        de: "Suche nach Stichwörtern",
      },
      search_results_for: {
        en: "Search results for",
        de: "Suche Ergebnisse für",
      },
      find_all_commonly_asked_questions_on_the_faq_page: {
        en: (
          <>
            Find all commonly asked questions and their answers on the{" "}
            <Link
              className={classes?.faqLink}
              href={getLocalePrefix(locale) + "/faq"}
              target="_blank"
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
            >
              FAQ Seite
            </Link>
            .
          </>
        ),
      },
    },
  ];
}
