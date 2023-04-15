import { createTheme } from "@mui/material";
import theme from "./theme";

const hubTheme = createTheme({
  ...theme,
  typography: {
    ...theme.typography,
    fontSize: 17,
    h2: {
      fontSize: 22,
      fontWeight: 600,
      color: theme.palette.primary.main,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      color: theme.palette.primary.main,
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
});

export default hubTheme;
