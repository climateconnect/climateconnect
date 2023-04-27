import theme from "../../src/themes/theme";

export function getIdeaBorderColor({ idea, index, isCreateCard }: any) {
  const colors = [
    theme.palette.primary.main,
    theme.palette.primary.light,
    theme.palette.secondary.main,
    theme.palette.yellow.main,
  ];
  return isCreateCard ? theme.palette.primary.main : colors[(index + idea.name.length) % 4];
}
