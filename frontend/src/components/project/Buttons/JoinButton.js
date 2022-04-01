import { Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import React, { useContext } from "react";

import ButtonIcon from "./ButtonIcon";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  largeScreenButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "3px",
  },

  largeJoinButton: {
    height: 40,
    maxWidth: 120,
  },

  mediumScreenIconButton: {
    height: 40,
  },
  mobileButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    cursor: "pointer",
    height: 40,
  },
  iconButton: {
    padding: theme.spacing(1),
    "&:hover": {
      background: "none",
    },
  },
  fabProgress: {
    color: "white",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
  },
  buttonLabel: {
    position: "relative",
  },
  buttonText: (props) => ({
    visibility: props.likingChangePending ? "hidden" : "visible",
  }),
  hidden: {
    visibility: "hidden",
  },
}));

export default function JoinButton({
  hasAdminPermissions,
  screenSize,
  handleSendProjectJoinRequest,
  requestedToJoin,
}) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale });

  if (screenSize?.belowSmall) {
    return (
      <span className={classes.mobileButtonContainer} onClick={handleSendProjectJoinRequest}>
        <IconButton className={classes.iconButton} disabled={requestedToJoin}>
          <ButtonIcon icon="add" size={40} color={"primary"} />
        </IconButton>
      </span>
    );
  }

  if (screenSize?.belowMedium && !screenSize.belowSmall && !hasAdminPermissions) {
    return (
      <span className={classes.largeScreenButtonContainer}>
        <IconButton
          className={classes.mediumScreenIconButton}
          disabled={requestedToJoin}
          onClick={handleSendProjectJoinRequest}
        >
          <ButtonIcon icon="add" size={40} color={"primary"} />
        </IconButton>
      </span>
    );
  }

  return (
    <span className={classes.largeScreenButtonContainer}>
      <Button
        className={classes.largeJoinButton}
        color={"primary"}
        disabled={requestedToJoin === true}
        onClick={handleSendProjectJoinRequest}
        startIcon={!requestedToJoin && <AddIcon />}
        variant="contained"
      >
        <div className={classes.buttonLabel}>
          <div className={classes.buttonText}>{requestedToJoin ? texts.requested : texts.join}</div>
        </div>
      </Button>
    </span>
  );
}
