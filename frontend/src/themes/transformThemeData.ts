import defaultTheme from "./theme";

export const transformThemeData = (data) => {
  const { palette, ...restOfDefaultTheme } = defaultTheme;
  const customTheme = {
    ...restOfDefaultTheme,
    palette: {
      ...palette,
      primary: {
        main: data?.primary?.main || defaultTheme.palette.primary.main,
        light: data?.primary?.light || defaultTheme.palette.primary.light,
        lightHover: data?.primary?.lightHover || defaultTheme.palette.primary.light,
        extraLight: data?.primary?.extraLight || defaultTheme.palette.primary.light,
      },
      secondary: {
        main: data?.secondary?.main || defaultTheme.palette.secondary.main,
        light: data?.secondary?.light || defaultTheme.palette.secondary.light,
        lightHover: data?.secondary?.lightHover || defaultTheme.palette.secondary.light,
        extraLight: data?.secondary?.extraLight || defaultTheme.palette.secondary.light,
      },
      text: {
        primary: data?.text?.main || defaultTheme.palette.text.primary,
        secondary: data?.text?.light || defaultTheme.palette.text.secondary,
      },
    },
  };

  return customTheme;
};
