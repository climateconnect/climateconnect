import { Menu } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

const NotificationsBox = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    minWidth: 300,
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

export default NotificationsBox;
