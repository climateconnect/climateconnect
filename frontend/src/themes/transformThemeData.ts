import defaultTheme from "./hubTheme";

export const transformThemeData = (data) => {
  const { palette, ...restOfDefaultTheme } = defaultTheme;
  const customTheme = {
    ...restOfDefaultTheme,
    palette: {
      ...palette,
      primary: {
        main: data?.primary?.main,
        light: data?.primary?.light,
        extraLight: data?.primary?.extraLight,
        contrastText: data?.primary?.contrastText,
      },
      secondary: {
        main: data?.secondary?.main,
        light: data?.secondary?.light,
        extraLight: data?.secondary?.extraLight,
        contrastText: data?.secondary?.contrastText,
      },
      background: {
        default: data?.background_default?.main,
        paper: palette.background.paper,
        default_contrastText: data?.background_default?.contrastText,
      },
    },
    
  };
  
  return customTheme;
};
