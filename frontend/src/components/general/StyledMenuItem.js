import { MenuItem, withStyles } from "@material-ui/core";
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

export default StyledMenuItem