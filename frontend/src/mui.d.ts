import { PaletteColorOptions } from "@mui/material/styles";
import { TextFieldProps } from "@mui/material/TextField";
import { SwitchProps } from "@mui/material/Switch";

// allow contrast for Switch
declare module "@mui/material/Switch" {
  interface SwitchPropsColorOverrides {
    contrast: true;
  }
}

// allow contrast for Checkbox
declare module "@mui/material/Checkbox" {
  interface CheckboxPropsColorOverrides {
    contrast: true;
  }
}

// allow contrast for TextField
declare module "@mui/material/TextField" {
  interface TextFieldPropsColorOverrides {
    contrast: true;
  }
}

// allow contrast as a color wothin the palette
declare module "@mui/material/styles" {
  interface Palette {
    contrast: Palette["primary"];
  }

  interface PaletteOptions {
    contrast?: PaletteOptions["primary"];
  }
}
