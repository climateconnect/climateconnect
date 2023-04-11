import { MenuItem } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
const StyledMenuItem = withStyles(() => ({
  root: {
    color: "primary",
    textAlign: "center",
    fontWeight: 600,
  },
  selected: {
    color: "white",
  },
}))(MenuItem);

export default StyledMenuItem;
