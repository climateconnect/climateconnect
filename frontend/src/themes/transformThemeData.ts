import defaultTheme from "./hubTheme";

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
    },
  };
  return customTheme;
};
