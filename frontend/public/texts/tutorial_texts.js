import { Link } from "@material-ui/core";
import React from "react";

export default function getTutorialTexts({ hubName, classes }) {
  return {
    click_here_to_go_back_to_tutorial: {
      en: "Click here to go back to the tutorial",
      de: "",
    },
    tutorial: {
      en: "Tutorial",
      de: "",
    },
    welcome_to_climate_connect: {
      en: "Welcome to Climate Connect",
      de: "",
    },
    tutorial_welcome_to_climate_connect_text_first_part: {
      en: "Climate Connect is a free collaboration platform for people taking climate action.",
      de: "",
    },
    tutorial_welcome_to_climate_connect_text_last_part: {
      en: "Want to discover all the things you can do here?",
      de: "",
    },
    tutorial_lets_start_with_a_question: {
      en: "Let's start with a question",
      de: "",
    },
    tutorial_lets_start_with_a_question_text: {
      en: `Are you already involved in climate action, for example as a volunteer or in your
      professional life?`,
      de: ``,
    },
    no_but_i_would_like_to: {
      en: "No, but I'd like to",
      de: "",
    },
    tutorial_welcome_to_the_browse_page: {
      en: "Welcome to the browse page",
      de: "",
    },
    great_that_you_are_already_a_climate_hero: {
      en: "Great that you're already a climate hero!",
      de: "",
    },
    here_you_can_browse: {
      en: `Here you can browse through all climate projects created by Climate Connect users. You
      can share your own (later 😉) or find the right people to connect with to multiply
      your impact.`,
      de: ``,
    },
    tutorial_welcome_to_the_browse_page_text_for_answer_soon: {
      en: `That's exciting, you have come to the right place to get started! 🌎 We need smart
      people like you to work together to solve this crisis. On this page you can browse
      through all climate projects created by Climate Connect members.`,
      de: "",
    },
    tutorial_welcome_to_the_browse_page_text_for_answer_false: {
      en: `No worries, here is the right place to start off! On this page you can browse through
      all climate projects created by Climate Connect members.`,
      de: ``,
    },
    welcome_to_the_hub_page: {
      en: `Welcome to the ${hubName} hub page!`,
      de: "",
    },
    here_you_can_find_projects_in_hub: {
      en: (
        <>
          Here you can find climate action projects in the {hubName} field that were created by
          Climate Connect members. You can find an overview of all projects on the{" "}
          <Link href="/browse" target="_blank" className={classes?.link}>
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: <></>,
    },
    welcome_to_the_hub_page_text_for_answer_soon_first_part: {
      en: `That's exciting, you have come to the right place to get started! 🌎 We need smart
      people like you to work together to solve this crisis.`,
      de: ``,
    },
    welcome_to_the_hub_page_text_for_answer_soon_second_part: {
      en: (
        <>
          Here you can find climate action projects in the {hubName} field that were created by
          Climate Connect members. You can find an overview of all projects on the{" "}
          <Link href="/browse" target="_blank" className={classes?.link}>
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: <></>,
    },
    welcome_to_the_hub_page_text_for_answer_false_first_part: {
      en: "No worries, here is the right place to start off!",
      de: "",
    },
    welcome_to_the_hub_page_text_for_answer_false_second_part: {
      en: (
        <>
          On this page you can find climate action projects in the {hubName} field that were created
          by Climate Connect members. You can find an overview of all projects on the{" "}
          <Link href="/browse" target="_blank" className={classes?.link}>
            browse
          </Link>{" "}
          page.
        </>
      ),
      de: <></>,
    },
    the_project_cards: {
      en: "The project cards!",
      de: "",
    },
    the_project_cards_text_for_answer_true: {
      en: `Find interesting climate projects to collaborate with or get inspired by! Hover over a
      card to see a short summary of what the project is about.`,
      de: ``,
    },
    the_project_cards_text_for_answer_soon: {
      en: `Find interesting climate projects to join or maybe even get inspired to do something
      similar at your location! Hover over a card to see a short summary of what the project
      is about.`,
      de: ``,
    },
    the_project_cards_text_for_answer_false: {
      en: `Find interesting climate projects to join or maybe even get inspired to do something
      similar at your location! Hover over a card to see a short summary of what the project
      is about.`,
      de: ``,
    },
    filter_and_find_tutorial_headline: {
      en: "Filter and find what you're looking for",
      de: "",
    },
    filter_and_find_tutorial_text: {
      en: `Click on the "Filter" button to filter the projects, for example by location or
      category. Choose what you want to filter by and click "Apply" to see the results!`,
      de: ``,
    },
    filter_and_find_tutorial_text_for_answer_true: {
      en: `Click on the "Filter" button to filter the projects, for example by location or
      category. Choose what you want to filter by and click "Apply" to see the results!`,
      de: ``,
    },
    filter_and_find_tutorial_text_for_answer_soon: {
      en: `Click on the "Filter" button to filter the projects, for example by location, category or the skills they are looking for. 
      Choose what you want to filter by and click "Apply" to see the results!`,
      de: ``,
    },
    filter_and_find_tutorial_text_for_answer_false: {
      en: `Click on the "Filter" button to filter the projects, for example by location or category. 
      Choose what you want to filter by and click "Apply" to see the results!`,
      de: ``,
    },
    tabs_tutorial_headline: {
      en: "Tabs",
      de: "",
    },
    tabs_tutorial_text: {
      en: `Click on another tab to see all active organizations or members of Climate Connect. 
      These are the faces behind the projects and the climate actors we strive to we strive to empower.`,
      de: ``,
    },
    hubs_tutorial_headline: {
      en: "Climate action hubs",
      de: "",
    },
    hubs_tutorial_text: {
      en: `Find plentiful information and effective and interesting projects in a specific field by clicking on one of the links to our hubs.`,
      de: "",
    },
    quick_bits_tutorial_headline: {
      en: "Quick bits",
      de: "",
    },
    quick_bits_tutorial_text: {
      en: `Every hub page provides a summary as well as detailed information about the impact of each sector. 
      Additional statistics help you to put each sector into perspective.`,
      de: ``,
    },
    want_to_get_involved_in_this_sector_headline: {
      en: "Want to get involved in the sector?",
      de: "",
    },
    want_to_get_involved_in_this_sector_text: {
      en: `By clicking on "Show projects" you directly get to the projects from this sector that have been shared by Climate Connect users.`,
      de: "",
    },
    click_a_project_headline: {
      en: "Click a project",
      de: "",
    },
    click_a_project_text: {
      en: "Click on a project to find out more about it!",
      de: "",
    },
    welcome_to_the_project_page_headline: {
      en: "Welcome to the project page!",
      de: "",
    },
    welcome_to_the_project_page_text: {
      en: `In the top section you can find a short summary ({"<240 characters"}) and the most important information about the project. 
      If the first impression is interesting, you can dive deeper.`,
      de: ``,
    },
    detailled_info_about_project_headline: {
      en: "More Detailled information about the project",
      de: "",
    },
    detailled_info_about_project_text: {
      en: `Here you can find more detailled information about the project, some projects even include a video. 
      If you have a question or think something is missing you can get in contact with the creator. (more on that later)`,
      de: ``,
    },
    collaboration_tutorial_headline: {
      en: "Collaboration",
      de: "",
    },
    collaboration_tutorial_text: {
      en: `This section shows you if the project needs help in a specific area. If you are interested to get involved click the...`,
      de: ``,
    },
    contact_button_tutorial_headline: {
      en: "Contact Button",
      de: "",
    },
    contact_button_tutorial_text: {
      en: `Get in contact with the project creator directly in a private chat. Ask them how to get involved or any other question or suggestion you might have.
      Don't hesitate to use this button frequently, working together is the only way we're going to solve the climate crisis!`,
      de: "",
    },
    meet_and_discuss_tutorial_headline: {
      en: "Meet the team and discuss the project",
      de: "",
    },
    meet_and_discuss_tutorial_text: {
      en: `As an alternative to a direct message, you can comment and start a discussion. Also: find
      out who is working on the project in the team tab.`,
      de: "",
    },
    are_you_ready_tutorial_headline: {
      en: "Are you ready to join team climate?",
      de: "",
    },
    are_you_ready_tutorial_text_for_answer_true: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis. Share you own organization and/or
      projects to get recognition, find new team members and spread your project worldwide.`,
      de: "",
    },
    are_you_ready_tutorial_text_for_answer_soon: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis.
      You'll be able to find the right project to work on with your skillset to make the
      biggest possible difference against climate change!`,
      de: "",
    },
    are_you_ready_tutorial_text_for_answer_false_first_part: {
      en: "Do you agree that we can only solve the climate crisis through collaboration?",
      de: "",
    },
    are_you_ready_tutorial_text_for_answer_false_last_part: {
      en: `Sign up to Climate Connect for free to join our international community of people
      working together to solve the climate crisis`,
      de: "",
    },
    lets_make_an_impact_together_tutorial_headline: {
      en: "Let's make an impact together!",
      de: "",
    },
    lets_make_an_impact_together_tutorial_text: {
      en: `Great to have you on team climate. We would love to help you with any problem related to
      climate action! Thomas, our community manager will gladly connect you to the right people
      in the community!`,
      de: "",
    },
    message_thomas: {
      en: "Message Thomas",
      de: "",
    },
  };
}
