import { Link } from "@material-ui/core";
import React from "react";

export default function getFaqTexts({ classes }) {
  return [
    {
      got_a_question: {
        en: "Got a question?",
        de: "",
      },
      faq: {
        en: "FAQ",
        de: "",
      },
      find_your_answers_here: {
        en: "Find your answers here!",
        de: "",
      },
      cant_find_the_answer_to_your_question_contact: {
        en: "Can't find the answer to your question? Contact support@climateconnect.earth.",
        de: "",
      },
      search_for_keywords: {
        en: "Search for keywords",
        de: "",
      },
      search_results_for: {
        en: "Search results for",
        de: "",
      },
      find_all_commonly_asked_questions_on_the_faq_page: {
        en: (
          <>
            Find all commonly asked questions and their answers on the{" "}
            <Link className={classes?.faqLink} href="/faq" target="_blank">
              FAQ page
            </Link>
            .
          </>
        ),
        de: <></>,
      },
    },
  ];
}
