import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LoadingContainer from "../general/LoadingContainer";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5),
    marginTop: theme.spacing(10)
  },
  headline: {
    marginBottom: theme.spacing(3)
  }
}));

export default function ProjectSubmittedPage({ user, isDraft, url_slug, hasError }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {hasError ? (
        <Typography variant="h5" color="error" className={classes.headline}>
          There has been an error when trying to publish your project. Check the console for more
          information.
        </Typography>
      ) : !url_slug ? (
        <LoadingContainer headerHeight={233} footerHeight={120} />
      ) : isDraft ? (
        <>
          <Typography variant="h5" className={classes.headline}>
            Your project has saved as a draft!
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            You can view, edit and publish your project drafts{" "}
            <a href={"/profiles/" + user.url_slug + "/#projects"}>in the my projects section</a> of
            your profile
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" className={classes.headline}>
            Congratulations! Your project has been published!
          </Typography>
          <Typography variant="h5" className={classes.headline}>
            We are really happy that you inspire the global climate action community!
          </Typography>
          <Typography variant="h5">
            You can view your project <a href={"/projects/" + url_slug}>here</a>
          </Typography>
        </>
      )}
    </div>
  );
}
