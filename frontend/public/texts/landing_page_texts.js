import React from "react";

export default function getLandingPageTexts({ classes, isNarrowScreen }) {
  return {
    be_part_of_the_community: {
      en: (
        <>
          <span className={classes?.yellow}>Be part</span> of the community
        </>
      ),
      de: <></>,
    },
    be_part_of_the_community_text: {
      en: `Sign up to Climate Connect - {"it's"} for free! By signing up you can work together and
      share knowledge and experiences with people taking climate action globally and in your home
      town.`,
      de: ``,
    },
    whether_youre_working_on_climate_action_fulltime: {
      en:
        "Whether you're working on climate action fulltime, on a volunteer basis or are just looking for what to do against climate change, we're all part of #teamclimate.",
      de: "",
    },
    landing_page_photo_alt: {
      en: "Photo of earth from space at night with some connecting waypoints",
      de: "",
    },
    from_around_the_world: {
      en: "from around the world",
      de: "",
    },
    //html tag is break point for mobile. Should be roughly in the middle of the sentence
    landing_page_text: {
      en: (
        <>
          Join the global climate action network to connect all
          {!isNarrowScreen ? <br /> : " "}
          climate actors on our planet - the only one we have
        </>
      ),
    },
    explore: {
      en: "Explore",
      de: "",
    },
    explore_climate_projects: {
      en: "Explore climate projects",
      de: "",
    },
    find_a_climate_action_organization_and_get_involved: {
      en: "Find a climate action organization and get involved",
      de: "",
    },
    find_a_climate_action_organization_and_get_involved_text: {
      en: `Find nonprofits, associations, companies, institutes, NGOs, local governments and other
      types of organizations taking climate action!`,
      de: ``,
    },
    find_a_climate_action_organization_and_get_involved_additional_text: {
      en: `You can directly contact the organization's representative to exchange knowledge,
      find volunteering opportunities or job opportunites.`,
      de: ``,
    },
    explore_all_organizations: {
      en: "Explore all organizations",
      de: "",
    },
    who_we_are: {
      en: "Who we are",
      de: "",
    },
    find_out_more_about_our_team: {
      en: "Find out about our team",
      de: "",
    },
    and_why_we_are_doing_what_we_are_doing: {
      en: "and why we are doing what we are doing",
      de: "",
    },
    open_hand_offering_a_seedling_with_a_heart_instead_of_leaves: {
      en: "Open hand offering a seedling with a heart instead of leaves",
      de: "",
    },
    our_mission: {
      en: "Our Mission",
      de: "",
    },
    learn_about_our_goals_and_values: {
      en: "Learn about our goals and values",
      de: "",
    },
    and_what_we_want_to_achieve_with_creating_a_climate_community: {
      en: "and what we want to achieve with creating a climate community",
      de: "",
    },
    five_people_positioned_around_a_globe_connected_through_lines: {
      en: "5 people positioned around a globe connected through lines",
      de: "",
    },
    man_floating_in_the_air_with_a_lightbulb_a_book_a_pen_a_notebook_a_baloon_and_saturn_floating_around_him: {
      en:
        "Man floating in the air with a lightbulb, a book, a pen, a notebook, a baloon and Saturn floating around him",
      de: "",
    },
    four_people_at_a_table_working_together_and_giving_each_other_a_high_five: {
      en: "Four people at a table working together and giving each other a high five",
      de: "",
    },
    start_now_banner_text: {
      en: (
        <>
          <span className={classes?.yellow}>Work together</span>, feel inspired and make a real
          impact <span className={classes?.yellow}>on climate change!</span>
        </>
      ),
      de: <></>,
    },
  };
}
