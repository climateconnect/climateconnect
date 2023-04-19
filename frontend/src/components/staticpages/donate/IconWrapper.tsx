import React from "react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 40,
  },
  icon: {
    width: "100%",
  },
  leftWrapper: (props) => ({
    padding: props.noPadding ? 0 : theme.spacing(4),
    paddingTop: props.noPadding ? 0 : theme.spacing(1),
    paddingBottom: 0,
  }),
}));

export default function IconWrapper({ src, noPadding }) {
  const classes = useStyles({ noPadding: noPadding });
  return (
    <div className={classes.leftWrapper}>
      <div className={classes.iconContainer}>
        <img className={classes.icon} src={src} />
      </div>
    </div>
  );
}
