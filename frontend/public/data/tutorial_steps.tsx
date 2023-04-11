import { Button, CircularProgress } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Router from "next/router";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import UserContext from "../../src/components/context/UserContext";
import { getLocalePrefix } from "../lib/apiOperations";
import { startPrivateChat } from "../lib/messagingOperations";
import getTexts from "../texts/texts";

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: theme.spacing(2),
  },
  signUpButton: {
    background: theme.palette.primary.extraLight,
    minWidth: 100,
    "&:hover": {
      background: "#fff",
    },
  },
  link: {
    color: "white",
    textDecoration: "underline",
  },
  thomasImage: {
    borderRadius: 20,
    marginRight: theme.spacing(0.5),
    height: 30,
  },
}));

export default function get_steps({
  projectCardRef,
  filterButtonRef,
  organizationsTabRef,
  hubsSubHeaderRef,
  hubQuickInfoRef,
  hubProjectsButtonRef,
  projectDescriptionRef,
  collaborationSectionRef,
  contactProjectCreatorButtonRef,
  projectTabsRef,
  hubName,
  onClickForward,
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const [loading, setLoading] = React.useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "tutorial", locale: locale, hubName: hubName, classes: classes });

  const handleConnectBtn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const chat = await startPrivateChat({ url_slug: "thomasbove4" }, token, locale);
    if (chat && chat.chat_uuid) Router.push("/chat/" + chat.chat_uuid + "/");
    else setLoading(false);
  };

  // pointsAt:  Reference of an element
  // tabOfRef:  Needed if the referenced element is on a tab
  //            It contains the tab's location hash and is used to make sure the tab is opened
  return [
    {
      step: 0,
      headline: texts.welcome_to_climate_connect + "!",
      pages: ["/browse", "/hubs/", "/projects/"],
      text: (
        <span>
          {texts.tutorial_welcome_to_climate_connect_text_first_part}
          <br />
          {texts.tutorial_welcome_to_climate_connect_text_last_part}
        </span>
      ),
    },
    {
      step: 1,
      headline: texts.tutorial_lets_start_with_a_question + "!",
      pages: ["/browse", "/hubs/", "/projects/"],
      text: <span>{texts.tutorial_lets_start_with_a_question_text}</span>,
      setsValue: "isActivist",
      possibleAnswers: {
        [texts.no]: "false",
        [texts.no_but_i_would_like_to]: "soon",
        [texts.yes]: "true",
      },
    },
    {
      step: 2,
      headline: texts.tutorial_welcome_to_the_browse_page + "!",
      pages: ["/browse"],
      texts: {
        isActivist: {
          true: (
            <span>
              {texts.great_that_you_are_already_a_climate_hero} 🌎 <br />
              {texts.here_you_can_browse}
            </span>
          ),
          soon: <span>{texts.tutorial_welcome_to_the_browse_page_text_for_answer_soon}</span>,
          false: <span>{texts.tutorial_welcome_to_the_browse_page_text_for_answer_false}</span>,
        },
      },
    },
    {
      step: 3,
      headline: texts.welcome_to_the_hub_page,
      pages: ["/hubs/"],
      preventUsingTypist: true,
      texts: {
        isActivist: {
          true: (
            <span>
              {texts.great_that_you_are_already_a_climate_hero} 🌎 <br />
              {texts.here_you_can_find_projects_in_hub}
            </span>
          ),
          soon: (
            <span>
              {texts.welcome_to_the_hub_page_text_for_answer_soon_first_part}
              <br />
              {texts.welcome_to_the_hub_page_text_for_answer_soon_second_part}
            </span>
          ),
          false: (
            <span>
              {texts.welcome_to_the_hub_page_text_for_answer_false_first_part}
              <br />
              {texts.welcome_to_the_hub_page_text_for_answer_false_second_part}
            </span>
          ),
        },
      },
    },
    {
      step: 4,
      headline: texts.the_project_cards,
      pages: ["/browse", "/hubs/"],
      pointsAt: projectCardRef,
      tabOfRef: "#projects",
      texts: {
        isActivist: {
          true: <span>{texts.the_project_cards_text_for_answer_true}</span>,
          soon: <span>{texts.the_project_cards_text_for_answer_soon}</span>,
          false: <span>{texts.the_project_cards_text_for_answer_false}</span>,
        },
      },
    },
    {
      step: 5,
      headline: texts.filter_and_find_tutorial_headline,
      pages: ["/browse", "/hubs/"],
      pointsAt: filterButtonRef,
      text: <span>{texts.filter_and_find_tutorial_text}</span>,
      texts: {
        isActivist: {
          true: <span>{texts.filter_and_find_tutorial_text_for_answer_true}</span>,
          soon: <span>{texts.filter_and_find_tutorial_text_for_answer_soon}</span>,
          false: <span>{texts.filter_and_find_tutorial_text_for_answer_false}</span>,
        },
      },
      placement: "top",
    },
    {
      step: 6,
      headline: texts.tabs_tutorial_headline,
      pages: ["/browse", "/hubs/"],
      pointsAt: organizationsTabRef,
      text: <span>{texts.tabs_tutorial_text}</span>,
      placement: "top",
    },
    {
      step: 7,
      headline: texts.hubs_tutorial_headline,
      pages: ["/browse"],
      pointsAt: hubsSubHeaderRef,
      text: <span>{texts.hubs_tutorial_text}</span>,
      placement: "bottom",
    },
    {
      step: 8,
      headline: texts.quick_bits_tutorial_headline,
      pages: ["/hubs/"],
      pointsAt: hubQuickInfoRef,
      text: <span>{texts.quick_bits_tutorial_text}</span>,
      placement: "bottom",
    },
    {
      step: 9,
      headline: texts.want_to_get_involved_in_this_sector_headline,
      pages: ["/hubs/"],
      pointsAt: hubProjectsButtonRef,
      text: <span>{texts.want_to_get_involved_in_this_sector_text}</span>,
      placement: "top",
      triggerNext: "showProjectsButton",
    },
    {
      step: 10,
      headline: texts.click_a_project_headline,
      pages: ["/hubs/"],
      pointsAt: projectCardRef,
      tabOfRef: "#projects",
      text: <span>{texts.click_a_project_text}</span>,
      placement: "top",
    },
    {
      step: 11,
      headline: texts.welcome_to_the_project_page_headline,
      pages: ["/projects/"],
      text: <span>{texts.welcome_to_the_project_page_text}</span>,
      placement: "top",
    },
    {
      step: 12,
      headline: texts.detailled_info_about_project_headline,
      pages: ["/projects/"],
      pointsAt: projectDescriptionRef,
      tabOfRef: "#project",
      text: <span>{texts.detailled_info_about_project_text}</span>,
      placement: "top-start",
    },
    {
      step: 13,
      headline: texts.collaboration_tutorial_headline,
      pages: ["/projects/"],
      pointsAt: collaborationSectionRef,
      tabOfRef: "#project",
      text: <span>{texts.collaboration_tutorial_text}</span>,
      placement: "top-start",
    },
    {
      step: 14,
      headline: "..." + texts.contact_button_tutorial_headline,
      pages: ["/projects/"],
      pointsAt: contactProjectCreatorButtonRef,
      text: <span>{texts.contact_button_tutorial_text}</span>,
      placement: "bottom",
    },
    {
      step: 15,
      headline: texts.meet_and_discuss_tutorial_headline,
      pages: ["/projects/"],
      pointsAt: projectTabsRef,
      text: <span>{texts.meet_and_discuss_tutorial_text}</span>,
      placement: "top-start",
    },
    {
      step: 16,
      headline: texts.are_you_ready_tutorial_headline,
      pages: ["/browse", "/hubs/", "/projects/"],
      loggedIn: false,
      texts: {
        isActivist: {
          true: <span>{texts.are_you_ready_tutorial_text_for_answer_true}</span>,
          soon: <span>{texts.are_you_ready_tutorial_text_for_answer_soon}</span>,
          false: (
            <span>
              {texts.are_you_ready_tutorial_text_for_answer_false_first_part}
              <br />
              {texts.are_you_ready_tutorial_text_for_answer_false_last_part}
            </span>
          ),
        },
      },
      button: (
        <div className={classes.buttonContainer}>
          <Button
            href={getLocalePrefix(locale) + "/signup?from_tutorial=true"}
            className={classes.signUpButton}
            size="large"
          >
            {texts.sign_up}
          </Button>
        </div>
      ),
    },
    {
      step: 17,
      headline: texts.lets_make_an_impact_together_tutorial_headline,
      pages: ["/browse", "/hubs/", "/projects/"],
      loggedIn: true,
      text: <span>{texts.lets_make_an_impact_together_tutorial_text}</span>,
      button: (
        <div className={classes.buttonContainer}>
          <Button className={classes.signUpButton} onClick={handleConnectBtn}>
            {loading ? (
              <CircularProgress size={24} /*TODO(undefined) className={classes.buttonProgress} */ />
            ) : (
              <>
                <img src="../images/thomas_profile_image.jpg" className={classes.thomasImage} />
                {texts.message_thomas}
              </>
            )}
          </Button>
          <Button className={classes.signUpButton} size="large" onClick={onClickForward}>
            {texts.finish}
          </Button>
        </div>
      ),
    },
  ];
}
