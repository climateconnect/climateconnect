import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#387077" },
    secondary: { main: "#484848" }
  },
  typography: {
    fontFamily:
      '"Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: "3rem",
      align: "center"
    }
  }
});

export default theme;
