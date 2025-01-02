import { alpha, createTheme } from "@mui/material/styles";
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

declare module "@mui/material/styles" {
  interface TypeBackground {
    default_contrastText?: string;
  }
}

// Create core theme so we can access spacing etc. when customizing components
export const coreTheme = createTheme({
  palette: {
    primary: {
      main: "#CCFF00",
      light: "#66BCB5",
      extraLight: "#D7F7F5",
      contrastText: "#000033",
      lightHover: "#7dd1ca",
    },
    secondary: {
      main: "#3134C7",
      light: "#7883FF",
      extraLight: "#EBEBEB",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      default_contrastText: "#3134C7",
    },
    yellow: {
      main: "#FFDE0A",
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
    // MuiLink: {
    //   styleOverrides: {
    //     root: {
    //       textDecoration: "none",
    //       "&:hover": {
    //         textDecoration: "underline",
    //         textDecorationColor: coreTheme.palette.background.default_contrastText,
    //       },
    //     },
    //   },
    // },
    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       textTransform: "none",
    //       color: coreTheme.palette.primary.contrastText,
    //     },
    //   },
    // },
  },
});

export default theme;
