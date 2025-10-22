import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import FashionDescription from "./FashionDescription";
import FoodDescription from "./FoodDescription";

const useStyles = makeStyles((theme) => ({
  moreInfoSoon: {
    fontWeight: 600,
    maxWidth: 800,
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
}));

export const HubDescription = ({ hub, texts }) => {
  const classes = useStyles();
  if (hub === "food") return <FoodDescription />;
  if (hub === "fashion") return <FashionDescription />;
  return (
    <Typography className={classes.moreInfoSoon}>
      {texts.more_info_about_hub_coming_soon}
    </Typography>
  );
};
