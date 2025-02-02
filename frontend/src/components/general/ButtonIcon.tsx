import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";

type Props = {
  color: string;
  size: number;
};

const useStyles = makeStyles(() => ({
  icon: (props: Props) => ({
    height: props.color === "earth" ? props.size : "auto",
    fontSize: props.color === "earth" ? "inherit" : `${props.size}px !important`,
  }),
  color: (props) => ({
    color: props.color,
  }),
}));

export default function ButtonIcon({ icon, color, size }) {
  const classes = useStyles({ size, color });

  if (icon === "like") {
    return color === "earth" ? (
      <img className={classes.icon} src={"/images/like-planet-earth.svg"} />
    ) : (
      <FavoriteIcon className={`${classes.icon} ${classes.color}`} />
    );
  }
  if (icon === "follow") {
    return color === "earth" ? (
      <img className={classes.icon} src={"/images/follow-planet-earth.svg"} />
    ) : (
      <PersonIcon className={`${classes.icon} ${classes.color}`} />
    );
  }
  return <></>;
}
