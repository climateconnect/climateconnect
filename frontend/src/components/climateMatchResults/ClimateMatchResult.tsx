import { Box, Link, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Router from "next/router";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ContactCreatorButton from "../project/Buttons/ContactCreatorButton";
import ClimateMatchResultFirstLine from "./ClimateMatchResultFirstLine";
import ClimateMatchSuggestionInfo from "./ClimateMatchSuggestionInfo";
import ProjectsSlider from "./ProjectsSlider";

const useStyles = makeStyles<Theme, { addBackground?: boolean }>((theme) => ({
  root: (props) => ({
    background: props.addBackground ? theme.palette.secondary.extraLight : undefined,
    width: "100%",
    padding: theme.spacing(2),
    "&:hover": {
      background: "#f5f5f5",
    },
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  }),
  resultContainer: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1300,
  },
  contentContainerLeftSide: {
    display: "flex",
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
    },
  },
  contentContainer: {
    marginLeft: 48,
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    marginRight: theme.spacing(3),
    [theme.breakpoints.down("md")]: {
      marginRight: theme.spacing(0),
      marginLeft: theme.spacing(-1),
    },
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit",
    width: "100%",
    maxWidth: 1300,
  },
  contactCreatorButton: {
    marginLeft: theme.spacing(2),
  },
  projectSliderContainer: {
    position: "relative",
    height: 200,
    width: "100%",
    [theme.breakpoints.down("xl")]: {
      height: 250,
    },
    [theme.breakpoints.down("lg")]: {
      height: 270,
    },
    [theme.breakpoints.down("md")]: {
      height: 360,
    },
  },
  projects_by_text: {
    marginLeft: theme.spacing(10),
    marginBottom: theme.spacing(1),
    fontSize: 18,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      fontWeight: 600,
    },
  },
  contactCreatorButtonContainer: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  orgProjectsContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("lg")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  orgProjectsInnerContainer: {
    width: 1200,
    ["@media(max-width:1500px)"]: {
      width: 1000,
    },
    [theme.breakpoints.down("lg")]: {
      width: 920,
    },
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
}));

export default function ClimateMatchResult({ suggestion, pos }) {
  const classes = useStyles({ addBackground: pos % 2 === 1 });
  const { locale, user } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const texts = getTexts({ page: "climatematch", locale: locale });
  const displayContactButtonBelow = useMediaQuery<Theme>("(max-width:1100px)");
  const creator = parseCreator(suggestion, texts);
  const handleClickContact = async (e) => {
    e.preventDefault();
    if (!user) {
      return redirect("/signup", {
        redirect: window.location.pathname + window.location.search,
        errorMessage: texts.please_create_an_account_or_log_in_to_contact_a_projects_organizer,
      });
    }
    const chat = await startPrivateChat(creator, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  return (
    <div className={classes.root} id={suggestion.url_slug}>
      <Link
        className={classes.noUnderline}
        href={getSuggestionHref(locale, suggestion)}
        target="_blank"
        underline="hover"
      >
        <div className={classes.resultContainer}>
          <ClimateMatchResultFirstLine pos={pos} suggestion={suggestion} />
          <div className={classes.contentContainer}>
            <ClimateMatchSuggestionInfo
              className={classes.contentContainerLeftSide}
              suggestion={suggestion}
              displayContactButton={displayContactButtonBelow}
              creator={creator}
              handleClickContact={handleClickContact}
              background={pos % 2 === 0 ? "#f5f5f5" : "#fff"}
            />
            {!displayContactButtonBelow && (
              <div
                className={classes.contactCreatorButtonContainer}
                onClick={(e) => e.preventDefault()}
              >
                <ContactCreatorButton
                  creator={creator}
                  handleClickContact={handleClickContact}
                  className={classes.contactCreatorButton}
                  contentType={suggestion.ressource_type}
                  customCardWidth={300}
                  withInfoCard={true}
                />
              </div>
            )}
          </div>
        </div>
      </Link>
      {suggestion.ressource_type === "organization" && suggestion?.projects?.length > 0 && (
        <Box className={classes.orgProjectsContainer}>
          <div className={classes.orgProjectsInnerContainer}>
            <Typography className={classes.projects_by_text}>
              {texts.projects_by} {suggestion.name}:
            </Typography>
            <div className={classes.projectSliderContainer}>
              <ProjectsSlider projects={suggestion.projects} />
            </div>
          </div>
        </Box>
      )}
    </div>
  );
}

const getSuggestionHref = (locale, suggestion) => {
  const ressourceNamePlural = `${suggestion.ressource_type}s`;
  if (suggestion.ressource_type === "idea") {
    const hubUrlSlug = `/hubs/${suggestion?.hub_shared_in?.url_slug}`;
    const urlPrefix = getLocalePrefix(locale) + hubUrlSlug;
    return `${urlPrefix}?idea=${suggestion.url_slug}#ideas`;
  }
  return `${getLocalePrefix(locale)}/${ressourceNamePlural}/${suggestion.url_slug}`;
};

const parseCreator = (suggestion, texts) => {
  if (suggestion.ressource_type === "project") {
    const pc = suggestion.project_creator;
    return {
      name: `${pc.user?.first_name} ${pc.user?.last_name}`,
      thumbnail_image: pc.user?.thumbnail_image,
      role: pc.role_in_project,
      first_name: pc.user?.first_name,
      ...pc.user,
    };
  }
  if (suggestion.ressource_type === "idea") {
    const ic = suggestion.user;
    return {
      name: `${ic.first_name} ${ic.last_name}`,
      thumbnail_image: ic.thumbnail_image ? ic.thumbnail_image : ic.image,
      role: texts.idea_creator,
      first_name: ic.first_name,
      ...ic,
    };
  }
  if (suggestion.ressource_type === "idea") {
    const ic = suggestion.user;
    return {
      name: `${ic.first_name} ${ic.last_name}`,
      thumbnail_image: ic.thumbnail_image ? ic.thumbnail_image : ic.image,
      role: texts.idea_creator,
    };
  }
  if (suggestion.ressource_type === "organization") {
    const creator = suggestion.creator;
    return {
      name: `${creator?.first_name} ${creator?.last_name}`,
      ...creator,
    };
  }
};
