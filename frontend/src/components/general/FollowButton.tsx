import { Button, CircularProgress, Link, Tooltip, Typography, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { MouseEventHandler } from "react";
import ButtonIcon from "./ButtonIcon";

const useStyles = makeStyles((theme) => ({
  followButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
  followersLink: {
    cursor: "pointer",
    textAlign: "center",
  },
  followerNumber: {
    fontWeight: 700,
    color: theme.palette.secondary.main,
  },
  followersText: {
    fontWeight: 500,
    fontSize: 18,
    color: theme.palette.secondary.light,
  },
  followingButton: (props) => ({
    marginLeft: props.hasAdminPermissions ? theme.spacing(2) : theme.spacing(0.25),
    marginRight: props.hasAdminPermissions ? theme.spacing(2) : theme.spacing(0.25),
    whiteSpace: "nowrap",
    height: 40,
    maxWidth: props.belowSmallScreen ? 180 : 140,
    "&:disabled": {
      color: "white",
      background: theme.palette.secondary.main,
    },
  }),
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
    visibility: props.followingChangePending ? "hidden" : "visible",
  }),
  hidden: {
    visibility: "hidden",
  },
}));

type Args = {
  isUserFollowing: boolean;
  handleToggleFollow: MouseEventHandler<HTMLButtonElement>;
  hasAdminPermissions: boolean;
  toggleShowFollowers: Function;
  followingChangePending: boolean;
  texts: any;
  screenSize?: any;
  numberOfFollowers: number;
  bindFollow?: Function;
  isLoggedIn: boolean;
  showStartIcon?: boolean;
  showLinkUnderButton?: boolean;
  showNumberInText?: boolean;
  toolTipText?: string;
  toolTipPlacement?: any;
};

export default function FollowButton({
  isUserFollowing,
  handleToggleFollow,
  hasAdminPermissions = false,
  toggleShowFollowers,
  followingChangePending,
  texts,
  screenSize,
  numberOfFollowers,
  bindFollow,
  isLoggedIn,
  showStartIcon,
  showLinkUnderButton,
  showNumberInText,
  toolTipText,
  toolTipPlacement,
}: Args) {
  const classes = useStyles({
    hasAdminPermissions: hasAdminPermissions,
    followingChangePending: followingChangePending,
    belowSmallScreen: screenSize?.belowSmall,
  });
  const theme = useTheme();
  return (
    <span className={classes.followButtonContainer}>
      {/* conditionally display the tooltip if text is defined only, since this is also used for project follow button */}
      <Tooltip arrow placement={toolTipPlacement} title={toolTipText == null ? "" : toolTipText}>
        <Button
          {...bindFollow}
          onClick={handleToggleFollow}
          variant="contained"
          startIcon={
            showStartIcon ? (
              <ButtonIcon icon="follow" size={27} color={isUserFollowing ? "earth" : theme.palette.primary.contrastText} />
            ) : (
              <></>
            )
          }
          color={isUserFollowing && isLoggedIn ? "secondary" : "primary"}
          disabled={followingChangePending}
          className={classes.followingButton}
        >
          <div className={classes.buttonLabel}>
            <CircularProgress
              size={20}
              className={`${classes.fabProgress} ${!followingChangePending && classes.hidden}`}
            />
            <div className={classes.buttonText}>
              {isUserFollowing && isLoggedIn ? texts.following : texts.follow}
              {showNumberInText && !followingChangePending && numberOfFollowers > 0
                ? " • " + numberOfFollowers
                : ""}
            </div>
          </div>
        </Button>
      </Tooltip>
      {showLinkUnderButton && numberOfFollowers > 0 && (
        <LinkWithText
          numberOfFollowers={numberOfFollowers}
          texts={texts}
          toggleShowFollowers={toggleShowFollowers}
        />
      )}
    </span>
  );
}

function LinkWithText({ numberOfFollowers, texts, toggleShowFollowers }) {
  const classes = useStyles();
  return (
    <Link
      color="secondary"
      underline="none"
      className={classes.followersLink}
      onClick={toggleShowFollowers}
    >
      <Typography className={classes.followersText}>
        <span className={classes.followerNumber}>{numberOfFollowers} </span>
        {numberOfFollowers > 1 ? texts.followers : texts.follower}
      </Typography>
    </Link>
  );
}
