import { ButtonBase, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import React from "react";
import Posts from "../communication/Posts";

const useStyles = makeStyles((theme) => ({
  buttonBase: {
    width: "100%",
    textAlign: "start",
    marginBottom: theme.spacing(4),
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  discussionPreview: {
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
    borderTop: `1px solid ${theme.palette.grey[500]}`,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
    width: "100%",
  },
  topSectionDiscussionPreview: {
    display: "flex",
    justifyContent: "space-between",
  },
  headingDiscussionPreview: {
    fontWeight: "bold",
  },
}));

export default function DiscussionPreview({
  latestParentComment,
  discussionTabLabel,
  handleTabChange,
  typesByTabValue,
  projectTabsRef,
}) {
  const classes = useStyles();

  function switchToDiscussionTab(event) {
    handleTabChange(event, typesByTabValue.indexOf("comments"));
    projectTabsRef.current.scrollIntoView();
  }

  return (
    <ButtonBase className={classes.buttonBase}>
      <div className={classes.discussionPreview} onClick={switchToDiscussionTab}>
        <div className={classes.topSectionDiscussionPreview}>
          <Typography display="inline" color="primary" className={classes.headingDiscussionPreview}>
            {discussionTabLabel}
          </Typography>
          <UnfoldMoreIcon color="secondary" />
        </div>
        <Posts
          posts={latestParentComment}
          type="preview"
          user={latestParentComment.author_user}
          truncate={3}
          noLink={true}
        />
      </div>
    </ButtonBase>
  );
}
