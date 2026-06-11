import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingContainer from "../general/LoadingContainer";
import getProjectTypeTexts from "../../../public/data/projectTypeTexts";

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

export default function ProjectSubmittedPage({
  user,
  isDraft,
  url_slug,
  hasError,
  hubName,
  projectTypeId,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({
    page: "project",
    locale: locale,
    user: user,
    url_slug: url_slug,
    hubName: hubName,
  });
  const projectTypeTexts = getProjectTypeTexts(texts);
  const typeId = projectTypeId ?? "project";

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
            {projectTypeTexts.draftProject[typeId]}
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            {projectTypeTexts.editAndPublishDraftProject[typeId]}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" className={classes.headline}>
            {projectTypeTexts.publishProject[typeId]}
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            {texts.we_are_really_happy_that_you_inspire_the_global_climate_action_community}
          </Typography>
          <Typography variant="h5">{projectTypeTexts.viewProject[typeId]}</Typography>
        </>
      )}
    </div>
  );
}
