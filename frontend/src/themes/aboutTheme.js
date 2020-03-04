import { createMuiTheme } from "@material-ui/core/styles";
import theme from "./theme";

const aboutTheme = createMuiTheme(theme, {
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

export default aboutTheme;
