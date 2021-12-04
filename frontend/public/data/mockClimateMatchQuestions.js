export default function getMockClimateMatchQuestions({ locale, allHubs, topLevelSkills }) {
  return [
    {
      step: 1,
      question:
        locale === "de" ? "Wähle deine Herzensthemen" : "Which fields are you most interested in?",
      answers: allHubs,
      type: "select_from_table_values",
      image: "/images/climatematch-question-1.jpg",
      numberOfChoices: 3,
    },
    {
      step: 2,
      question:
        locale === "de"
          ? "Möchstest du dich langfristig engagieren oder lieber bei einem einmaligen Projekt?"
          : "Do you want to get active longer-term or rather in a one-off project?",
      answers: [
        locale === "de"
          ? "Ich möchte mich langfristig engagieren."
          : "I want to get active long-term.",
        locale === "de"
          ? "Ich möchste erst mal mit einem einmaligen Projekt starten."
          : "I want to start by getting active in a one-off project.",
        locale === "de" ? "Mir ist beides recht." : "Both are fine with me.",
      ],
      type: "select_from_custom_answers",
      image: "/images/climatematch-question-2.jpg",
    },
    {
      step: 3,
      question:
        locale === "de"
          ? "Könntest du dir auch vorstellen, gemeinsam mit anderen etwas neues zu starten?"
          : "Could you also imagine to start something new together with others?",
      answers: [
        locale === "de" ? "Ja, sogar sehr gerne." : "Yes, I'd love to.",
        locale === "de"
          ? "Das könnte ich mir vorstellen, muss aber nicht sein."
          : "Maybe if it's a good fit",
        locale === "de" ? "Nein, aktuell nicht." : "No, not at the moment.",
      ],
      type: "select_from_custom_answers",
      image: "/images/climatematch-question-3.jpg",
    },
    {
      step: 4,
      question:
        locale === "de"
          ? "In welchen Bereichen kennst du dich aus?"
          : "In which areas do you have some knowledge?",
      answers: topLevelSkills,
      type: "select_from_table_values",
      image: "/images/climatematch-question-4.jpg",
      numberOfChoices: 3,
    },
  ];
}
