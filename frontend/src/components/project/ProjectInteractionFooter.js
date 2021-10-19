import { AppBar, Container, IconButton, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteIcon from "@material-ui/icons/Favorite";
import React from "react";
import ContactCreatorButton from "./ContactCreatorButton";
import FollowButton from "./FollowButton";

const useStyles = makeStyles((theme) => ({
  largeScreenButton: (props) => ({
    position: "fixed",
    bottom: props.visibleFooterHeight + 2,
    right: props.tabContentContainerSpaceToRight,
    boxShadow: "3px -3px 6px #00000029",
  }),
  bottomActionBar: (props) => ({
    backgroundColor: "#ECECEC",
    top: "auto",
    bottom: props.visibleFooterHeight,
    boxShadow: "-3px -3px 6px #00000029",
  }),
  containerButtonsActionBar: {
    display: "flex",
    justifyContent: "space-around",
  },
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
}));

export default function ProjectInteractionFooter({
  projectAdmin,
  handleClickContact,
  hasAdminPermissions,
  messageButtonIsVisible,
  contactProjectCreatorButtonRef,
  visibleFooterHeight,
  tabContentContainerSpaceToRight,
  project,
  smallScreen,
  isUserFollowing,
  handleToggleFollowProject,
  toggleShowFollowers,
  followingChangePending,
  texts,
  tinyScreen,
}) {
  const classes = useStyles({
    visibleFooterHeight: visibleFooterHeight,
    tabContentContainerSpaceToRight: tabContentContainerSpaceToRight,
  });

  if (smallScreen && !tinyScreen)
    return (
      <AppBar className={classes.bottomActionBar} position="fixed" elevation={0}>
        <Toolbar className={classes.containerButtonsActionBar} variant="dense">
          {!hasAdminPermissions && (
            <ContactCreatorButton
              projectAdmin={projectAdmin}
              handleClickContact={handleClickContact}
              smallScreen={smallScreen}
            />
          )}
          <FollowButton
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            project={project}
            hasAdminPermissions={hasAdminPermissions}
            toggleShowFollowers={toggleShowFollowers}
            followingChangePending={followingChangePending}
            texts={texts}
            smallScreen={smallScreen}
          />
          <IconButton size="small">
            <FavoriteIcon fontSize="large" color="primary" />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  if (smallScreen && tinyScreen)
    return (
      <AppBar className={classes.bottomActionBar} position="fixed" elevation={0}>
        <Toolbar className={classes.containerButtonsActionBar} variant="dense">
          {!hasAdminPermissions && (
            <ContactCreatorButton
              projectAdmin={projectAdmin}
              handleClickContact={handleClickContact}
              tinyScreen={tinyScreen}
            />
          )}
          <FollowButton
            isUserFollowing={isUserFollowing}
            handleToggleFollowProject={handleToggleFollowProject}
            project={project}
            hasAdminPermissions={hasAdminPermissions}
            toggleShowFollowers={toggleShowFollowers}
            followingChangePending={followingChangePending}
            texts={texts}
            tinyScreen={tinyScreen}
          />
          <IconButton size="small">
            <FavoriteIcon fontSize="large" color="primary" />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  else
    return (
      <Container className={classes.largeScreenButtonContainer}>
        {!hasAdminPermissions &&
          !messageButtonIsVisible &&
          contactProjectCreatorButtonRef?.current && (
            <ContactCreatorButton
              className={classes.largeScreenButton}
              projectAdmin={projectAdmin}
              handleClickContact={handleClickContact}
            />
          )}
      </Container>
    );
}
