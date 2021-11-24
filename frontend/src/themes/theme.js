import { createMuiTheme } from "@material-ui/core/styles";

// Create core theme so we can access spacing etc. when customizing components
const coreTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#207178",
      light: "#66BCB5",
      lightHover: "#7dd1ca",
      extraLight: "#D7F7F5",
    },
    secondary: {
      main: "#484848",
      light: "#484848c2",
      extraLight: "#EBEBEB",
    },
    yellow: {
      main: "#FFDE0A",
    },
    background: {
      default: "#FFF",
    },
    action: {
      selected: "#387077",
    },
  },
  typography: {
    fontFamily: "Open Sans",
    h1: {
      fontSize: "3rem",
      align: "center",
    },
    subtitle1: {
      fontSize: "0.9rem",
    },
    subtitle2: {
      fontSize: "0.9rem",
      fontWeight: "bold",
    },
    button: {
      fontWeight: 600,
    },
    climateMatch: {
      fontFamily: "flood-std, sans-serif",
      fontWeight: 300,
    },
  },
});

/**
 * Extend on top of the core foundational theme (currently spacing
 * and color) with other design tokens, and component-specific overrides.
 *
 * For example, we can start defining consistency for borders, and other
 * styling primitives here, to minimize the duplication of raw styles
 * across other files.
 */
const theme = createMuiTheme(coreTheme, {
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 3,
        paddingLeft: coreTheme.spacing(4),
        paddingRight: coreTheme.spacing(4),
        paddingTop: coreTheme.spacing(1),
        paddingBottom: coreTheme.spacing(1),
      },
    },
    MuiTab: {
      root: {
        minWidth: 0,
        [coreTheme.breakpoints.up("xs")]: {
          minWidth: 0,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: 14,
      },
    },
    MuiChip: {
      root: {
        // Have the same border-radius as the other UI controls, like
        // the select dropdowns, buttons, etc.
        borderRadius: 4,
      },
    },
  },
  // Note the "thick" semantic naming for this borders
  // design token.
  borders: {
    thick: `3px solid ${coreTheme.palette.primary.main}`,
    // TODO: we should add this light gray color to be consistent with our color system / theme
    thin: `1px solid #e0e0e0`,
  },
  props: {
    MuiButton: {
      disableElevation: true,
    },
  },
});

export default theme;
