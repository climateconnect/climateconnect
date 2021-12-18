import { Menu } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

const StyledMenu = withStyles({
  paper: {
    width: 64,
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

export default StyledMenu;
