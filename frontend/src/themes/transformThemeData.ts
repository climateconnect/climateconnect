import { backdropClasses } from "@mui/material";
import defaultTheme from "./hubTheme";
import { alpha, createTheme } from "@mui/material/styles";

// transform theme data received from the API into a structured theme object
export const transformThemeData = (data) => {
  const { palette, ...restOfDefaultTheme } = defaultTheme;
  const coreTheme = {
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
  const customTheme = createTheme(coreTheme, {
    components: {
      MuiButton: {
        variants: [
          {
            props: { variant: "outlined" },
            style: {
              color: coreTheme.palette.primary.contrastText,
            },
          },
          {
            props: { variant: "contained" },
            style: {
              color: coreTheme.palette.primary.contrastText,
              backgroundColor: coreTheme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(coreTheme.palette.primary.main, 0.7),
              },
            },
          },
        ],
      },
    },
  });

  return customTheme;
};
