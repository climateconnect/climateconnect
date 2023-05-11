import { MenuItem } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
const StyledMenuItem = withStyles((theme) => ({
  root: {
    color: "primary",
    textAlign: "center",
    fontWeight: 600,
  },
  selected: {
    color: "white",
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
}))(MenuItem);

export default StyledMenuItem;
