import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingContainer from "../general/LoadingContainer";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5),
    marginTop: theme.spacing(10),
  },
  headline: {
    marginBottom: theme.spacing(3),
  },
}));

export default function ProjectSubmittedPage({ user, isDraft, url_slug, hasError, hubName }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({
    page: "project",
    locale: locale,
    user: user,
    url_slug: url_slug,
    hubName: hubName,
  });
  return (
    <div className={classes.root}>
      {hasError ? (
        <Typography variant="h5" color="error" className={classes.headline}>
          {texts.there_has_been_an_error_when_trying_to_publish_your_project}
        </Typography>
      ) : !url_slug ? (
        <LoadingContainer headerHeight={233} footerHeight={120} />
      ) : isDraft ? (
        <>
          <Typography variant="h5" className={classes.headline}>
            {texts.your_project_has_saved_as_a_draft}
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            {texts.you_can_view_edit_and_publish_your_project_drafts_in_the}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" className={classes.headline}>
            {texts.congratulations_your_project_has_been_published}
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            {texts.we_are_really_happy_that_you_inspire_the_global_climate_action_community}
          </Typography>
          <Typography variant="h5">{texts.you_can_view_your_project_here}</Typography>
        </>
      )}
    </div>
  );
}
