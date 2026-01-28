// allow contrast for Switch
declare module "@mui/material/Switch" {
  // eslint-disable-next-line no-unused-vars
  interface SwitchPropsColorOverrides {
    contrast: true;
  }
}

// allow contrast for Checkbox
declare module "@mui/material/Checkbox" {
  // eslint-disable-next-line no-unused-vars
  interface CheckboxPropsColorOverrides {
    contrast: true;
  }
}

// allow contrast for TextField
declare module "@mui/material/TextField" {
  // eslint-disable-next-line no-unused-vars
  interface TextFieldPropsColorOverrides {
    contrast: true;
  }
}
