import { makeStyles, Tooltip, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useContext } from "react";

import Dashboard from "../../../src/components/dashboard/Dashboard";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPosition: "bottom center",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      minHeight: 100,
      backgroundSize: "cover",
    },
    position: "relative",
  }),
  img: (props) => ({
    width: props.fullWidth ? "80%" : "50%",
    visibility: "hidden",
  }),
  attribution: {
    float: "right",
    fontSize: 12,
    marginRight: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    fontWeight: "bold",
    fontSize: 30,
    cursor: "pointer",
  },
  // TODO(piper/chris): likely a more elegant way to position
  // the blurb on top of the container here
  dashboardContainer: {
    marginTop: "-100px",
    paddingBottom: theme.spacing(4),
  },
}));

export default function HubHeaderImage({ image, source, fullWidth, onClose }) {
  const classes = useStyles({ image: image, fullWidth: fullWidth });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <>
      <div className={classes.root}>
        {onClose && (
          <Tooltip title={texts.click_here_to_minimize_info}>
            <CloseIcon color="primary" className={classes.closeButton} onClick={onClose} />
          </Tooltip>
        )}
        <img src={image} className={classes.img} />
        <div className={`${classes.dashboardContainer}`}>
          <Dashboard />
        </div>
      </div>
      {source && (
        <Typography className={classes.attribution}>
          {texts.image}: {source}
        </Typography>
      )}
    </>
  );
}
