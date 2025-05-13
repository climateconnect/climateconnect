import { createTheme, alpha, darken, lighten } from "@mui/material";
import defaultTheme from "./hubTheme";

declare module "@mui/material/styles" {
  interface Palette {
    header: {
      background: string;
    };
  }
  interface PaletteOptions {
    header?: {
      background: string;
    };
  }
}

// transform theme data received from the API into a structured theme object
export const transformThemeData = (data, baseTheme: any = undefined) => {
  const { palette, ...restOfDefaultTheme } = baseTheme || defaultTheme;
  const customTheme = {
    ...restOfDefaultTheme,
    components: {
      ...restOfDefaultTheme.components,
      MuiLink: {
        ...restOfDefaultTheme?.components?.MuiLink,
        styleOverrides: {
          root: {
            color: data?.background_default?.contrastText,
            textDecorationColor: data?.background_default?.contrastText,
          },
        },
      },
      MuiButton: {
        ...restOfDefaultTheme?.components?.MuiButton,
        variants: [
          ...(restOfDefaultTheme?.components?.MuiButton?.variants ?? []),
          {
            props: { variant: "contained", color: "primary" },
            style: {
              "&:hover": {
                backgroundColor: darken(data?.primary?.main, 0.2),
              },
            },
          },
        ],
      },
      MuiOutlinedInput: {
        ...restOfDefaultTheme?.components?.MuiInputBase,
        styleOverrides: {
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: data?.secondary?.main, // Outline color when focused
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: data?.secondary?.main, // Label color when focused
            },
          },
        },
      },
    },
    palette: {
      ...palette,
      primary: {
        ...palette.primary,
        main: data?.primary?.main,
        light: data?.primary?.light,
        extraLight: data?.primary?.extraLight,
        contrastText: data?.primary?.contrastText,
      },
      secondary: {
        ...palette.secondary,
        main: data?.secondary?.main,
        light: data?.secondary?.light,
        extraLight: data?.secondary?.extraLight,
        contrastText: data?.secondary?.contrastText,
      },
      background: {
        ...palette.background,
        default: data?.background_default?.main,
        default_contrastText: data?.background_default?.contrastText,
      },
      contrast: {
        main: data?.background_default?.contrastText || "black",
        contrastText: data?.background_default?.main || "white",

        // TODO: dark and light are missing and might be calculated based on the main
        // using create Theme
      },
      header: {
        background: data?.header_background?.main,
        light: data?.header_background?.light,
        extraLight: data?.header_background?.extraLight,
        contrastText: data?.header_background?.contrastText,
      },
    },
  };
  return createTheme(customTheme);
};
