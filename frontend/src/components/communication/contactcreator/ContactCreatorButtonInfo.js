import { Avatar, Card, CardHeader, Typography } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  slideInCard: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    cursor: "pointer",
    flexDirection: "column"
  },
  slideInRoot: {
    textAlign: "left",
  },
  slideInSubheader: {
    color: "black",
  },
  slideInTitle: {
    fontWeight: "bold",
  },
  avatar: {
    height: 50,
    width: 50,
  },
  customMessage:{
    fontSize: 14,
    fontStyle: "italic"
  }
});

export default function ContactCreatorButtonInfo({
  creatorName,
  creatorImageURL,
  creatorsRoleInProject,
  customMessage
}) {
  const classes = useStyles();

  return (
    <Card className={classes.slideInCard} variant="outlined">
      <CardHeader
        classes={{
          root: classes.slideInRoot,
          subheader: classes.slideInSubheader,
          title: classes.slideInTitle,
        }}
        avatar={<Avatar src={creatorImageURL} className={classes.avatar} />}
        title={creatorName}
        subheader={creatorsRoleInProject ? creatorsRoleInProject : (<Typography className={classes.customMessage}>"{customMessage}"</Typography>)}
      />
    </Card>
  );
}
