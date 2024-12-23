import defaultTheme from "./hubTheme";

// transform theme data received from the API into a structured theme object
export const transformThemeData = (data) => {
  const { palette, ...restOfDefaultTheme } = defaultTheme;
  const customTheme = {
    ...restOfDefaultTheme,
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
    },
  };

  return customTheme;
};
