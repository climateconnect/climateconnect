import { Link, makeStyles, Typography } from "@material-ui/core";
import Router from "next/router";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ContactCreatorButton from "../project/Buttons/ContactCreatorButton";
import ClimateMatchResultImage from "./ClimateMatchResultImage";
import ClimateMatchSuggestionInfo from "./ClimateMatchSuggestionInfo";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    background: props.addBackground && theme.palette.secondary.extraLight,
    width: "100%",
    padding: theme.spacing(2),
    "&:hover": {
      background: "#f5f5f5",
    },
  }),
  rankNumber: {
    color: theme.palette.primary.main,
    fontFamily: "flood-std, sans-serif",
    fontSize: 30,
    border: `3px solid ${theme.palette.yellow.main}`,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "100%",
  },
  ressourceType: {
    marginLeft: theme.spacing(1),
    fontWeight: 600,
  },
  contentContainerLeftSide: {
    display: "flex",
  },
  contentContainer: {
    marginLeft: 48,
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    marginRight: theme.spacing(3),
  },
  rankAndTypeContainer: {
    display: "flex",
    alignItems: "center",
  },
  suggestionInfoBlock: {
    marginLeft: theme.spacing(2),
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit",
  },
  contactCreatorButton: {
    marginLeft: theme.spacing(2),
  },
}));

export default function ClimateMatchResult({ suggestion, pos }) {
  const classes = useStyles({ addBackground: pos % 2 === 1 });
  const { locale, user } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("token");
  const texts = getTexts({ page: "climatematch", locale: locale });
  const creator = parseCreator(suggestion);
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
    <Link
      className={classes.noUnderline}
      href={getSuggestionHref(locale, suggestion)}
      target="_blank"
    >
      <div className={classes.root} id={suggestion.url_slug}>
        <div className={classes.resultContainer}>
          <div className={classes.rankAndTypeContainer}>
            <div className={classes.rankNumber}>{pos + 1}</div>
            <Typography className={classes.ressourceType}>
              {texts[suggestion.ressource_type]}:
            </Typography>
          </div>
          <div className={classes.contentContainer}>
            <div className={classes.contentContainerLeftSide}>
              <ClimateMatchResultImage suggestion={suggestion} />
              <ClimateMatchSuggestionInfo
                suggestion={suggestion}
                className={classes.suggestionInfoBlock}
              />
            </div>
            <div>
              <ContactCreatorButton
                large
                projectAdmin={creator}
                handleClickContact={handleClickContact}
                className={classes.contactCreatorButton}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

const getSuggestionHref = (locale, suggestion) => {
  const ressourceNamePlural = `${suggestion.ressource_type}s`;
  return `${getLocalePrefix(locale)}/${ressourceNamePlural}/${suggestion.url_slug}`;
};

const parseCreator = (suggestion) => {
  if (suggestion.ressource_type === "project") {
    const pc = suggestion.project_creator;
    return {
      name: `${pc.user.first_name} ${pc.user.last_name}`,
      thumbnail_image: pc.user.thumbnail_image,
      role: pc.role_in_project,
      first_name: pc.user.first_name,
      ...pc.user,
    };
  }
};
