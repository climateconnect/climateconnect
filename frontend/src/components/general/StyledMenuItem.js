import { MenuItem } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
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
