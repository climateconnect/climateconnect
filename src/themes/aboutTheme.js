import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#387077" },
    secondary: { main: "#484848" }
  },
  typography: {
    h1: {
      "@media (max-width:1200px)": {
        fontSize: "3rem"
      }
    },
    h3: {
      "@media (max-width:900px)": {
        fontSize: "2rem"
      }
    },
    h4: {
      "@media (max-width:900px)": {
        fontSize: "1.5rem"
      }
    }
  }
});

export default theme;
