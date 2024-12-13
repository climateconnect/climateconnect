import defaultTheme from "./hubTheme";
import { createTheme } from "@mui/material/styles";

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
        paper: data?.background_paper?.main,
        default_contrastText: data?.background_default?.contrastText,
        paper_contrastText: data?.background_paper?.contrastText,
      },
    },
  };
  
  return customTheme;
};

// export const transformThemeData = (data) => {
//   const { palette, ...restOfDefaultTheme } = defaultTheme;
//   const customTheme = createTheme(restOfDefaultTheme, {
//     palette: {
//       ...palette,
//       primary: {
//         main: data?.primary?.main,
//         light: data?.primary?.light,
//         extraLight: data?.primary?.extraLight,
//         contrastText: data?.primary?.contrastText,
//       },
//       secondary: {
//         main: data?.secondary?.main,
//         light: data?.secondary?.light,
//         extraLight: data?.secondary?.extraLight,
//         contrastText: data?.secondary?.contrastText,
//       },
//       background: {
//         default: data?.primary?.background_default,
//         paper: data?.primary?.background_paper,
//         default_contrastText: data?.primary?.background_default,
//         paper_contrastText: data?.primary?.background_paper,
//       },
//     },
//   });
//   console.log("customTheme",customTheme);

//   return customTheme;

// }