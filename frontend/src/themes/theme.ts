import { createTheme, alpha } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

declare module "@mui/material" {
  interface Color {
    main: string;
    dark: string;
    light?: string;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    grey: true;
  }
}

// Create core theme so we can access spacing etc. when customizing components
const coreTheme = createTheme({
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
    grey: {
      light: grey[100],
      main: grey[300],
      dark: grey[400],
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
    /* TOOD: climateMatch: {
      fontFamily: "flood-std, sans-serif",
      fontWeight: 300,
    },*/
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
const theme = createTheme(coreTheme, {
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: "grey" },
          style: {
            color: coreTheme.palette.getContrastText(coreTheme.palette.grey[300]),
          },
        },
        {
          props: { variant: "outlined", color: "grey" },
          style: {
            color: coreTheme.palette.text.primary,
            borderColor:
              coreTheme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.23)"
                : "rgba(255, 255, 255, 0.23)",
            "&.Mui-disabled": {
              border: `1px solid ${coreTheme.palette.action.disabledBackground}`,
            },
            "&:hover": {
              borderColor:
                coreTheme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.23)"
                  : "rgba(255, 255, 255, 0.23)",
              backgroundColor: alpha(
                coreTheme.palette.text.primary,
                coreTheme.palette.action.hoverOpacity
              ),
            },
          },
        },
      ],
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        containedSizeMedium: {
          borderRadius: 3,
          paddingLeft: coreTheme.spacing(4),
          paddingRight: coreTheme.spacing(4),
          paddingTop: coreTheme.spacing(1),
          paddingBottom: coreTheme.spacing(1),
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: 0,
          [coreTheme.breakpoints.up("xs")]: {
            minWidth: 0,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 14,
        },
      },
    },
    MuiChip: {
      variants: [
        {
          props: { variant: "filled", color: "secondary" },
          style: {
            background: "#e0e0e0",
            color: coreTheme.palette.secondary.main,
          },
        },
      ],
      styleOverrides: {
        root: {
          // Have the same border-radius as the other UI controls, like
          // the select dropdowns, buttons, etc.
          borderRadius: 4,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
  },
});

export default theme;
