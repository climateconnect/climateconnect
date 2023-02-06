export default function getPitchElements(texts) {
  return [
    {
      img: "/images/online_world_story.svg",
      headline: texts.spread_your_solution_globally,
      text: texts.spread_your_solution_globally_text,
      link: "/signup",
      linkText: texts.how_to_start,
    },
    {
      img: "/images/creativity_story.svg",
      headline: texts.get_inspired,
      text: texts.get_inspired_text,
      link: "/signup",
      linkText: texts.how_to_start,
    },
    {
      img: "/images/team_story.svg",
      headline: texts.worldwide_collaboration,
      text: texts.worldwide_collaboration_text,
      link: "/signup",
      linkText: texts.how_to_start,
    },
  ];
}
