import { Drawer } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import IdeaRoot from "./IdeaRoot";

const useStyles = makeStyles(() => ({
  drawer: {
    maxHeight: "90vh",
    borderRadius: "30px 30px 0px 0px",
    paddingTop: 20,
  },
}));

export default function MobileIdeaPage(props) {
  const classes = useStyles();
  return (
    <Drawer
      classes={{ paper: classes.drawer }}
      anchor="bottom"
      open={true}
      onClose={props.onIdeaClose}
    >
      <IdeaRoot {...props} />
    </Drawer>
  );
}
