import { Menu } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import React from "react";

const StyledMenu: any = withStyles({
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
    {...(props as any)}
  />
));

export default StyledMenu;
