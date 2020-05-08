import { createMuiTheme } from "@material-ui/core/styles";

//Create core theme so we can access spacing etc. when customizing components
const coreTheme = createMuiTheme({
  palette: {
    primary: { main: "#387077" },
    secondary: { main: "#484848" }
  },
  typography: {
    fontFamily: "Open Sans",
    h1: {
      fontSize: "3rem",
      align: "center"
    },
    subtitle1: {
      fontSize: "0.9rem"
    },
    button: {
      fontWeight: 600
    }
  }
});

const themeWithOverrides = createMuiTheme(coreTheme, {
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 3,
        paddingLeft: coreTheme.spacing(4),
        paddingRight: coreTheme.spacing(4),
        paddingTop: coreTheme.spacing(1),
        paddingBottom: coreTheme.spacing(1)
      }
    },
    MuiTab: {
      root: {
        minWidth: 0,
        [coreTheme.breakpoints.up("xs")]: {
          minWidth: 0
        }
      }
    }
  },
  props: {
    MuiButton: {
      disableElevation: true
    }
  }
});

export default themeWithOverrides;
