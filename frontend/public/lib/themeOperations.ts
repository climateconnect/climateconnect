//This function is for components where we need to pass either "primary" or "secondary" for the color prop
export function getBackgroundContrastColor(theme) {
  return theme.palette.background.default_contrastText === theme.palette.secondary.main
    ? "secondary"
    : "primary";
}
