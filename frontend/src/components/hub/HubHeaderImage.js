import { makeStyles, Tooltip, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  imageContainer: (props) => ({
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPosition: "bottom center",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      minHeight: 100,
      backgroundSize: "cover",
    },
    position: "relative",
    [theme.breakpoints.up("md")]: {
      position: props.isLocationHub && !props.loggedOut ? "absolute" : "relative",
      zIndex: -1,
    },
  }),
  dashboardContainer: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoBoxContainer: {
    marginTop: theme.spacing(6),
    marginLeft: theme.spacing(2),
    float: "right",
  },
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
}));

export default function HubHeaderImage({ image, source, fullWidth, onClose, isLocationHub }) {
  const { locale, user } = useContext(UserContext);
  const classes = useStyles({
    image: image,
    fullWidth: fullWidth,
    isLocationHub: isLocationHub,
    loggedOut: !user,
  });
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <>
      <div className={classes.imageContainer}>
        {onClose && (
          <Tooltip title={texts.click_here_to_minimize_info}>
            <CloseIcon color="primary" className={classes.closeButton} onClick={onClose} />
          </Tooltip>
        )}
        <img src={image} className={classes.img} />
      </div>
      {source && (
        <Typography className={classes.attribution}>
          {texts.image}: {source}
        </Typography>
      )}
    </>
  );
}
