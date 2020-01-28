import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#387077", light: "#3a7981" }
  },
  typography: {
    fontFamily:
      "'Open Sans', 'Segoe UI', Avenir, -apple-system, Roboto, system-ui, Ubuntu, Tahoma, Verdana, Helvetica, sans-serif",
    h1: {
      fontSize: "3rem",
      align: "center"
    },
    subtitle1: {
      fontSize: "0.9rem"
    }
  }
});

export default theme;
