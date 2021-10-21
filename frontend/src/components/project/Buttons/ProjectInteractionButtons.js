import { AppBar, Container, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ContactCreatorButton from "./ContactCreatorButton";
import FollowButton from "./FollowButton";

const useStyles = makeStyles(() => ({
  largeScreenButton: (props) => ({
    position: "fixed",
    bottom: props.visibleFooterHeight + 2,
    right: props.tabContentContainerSpaceToRight,
    boxShadow: "3px -3px 6px #00000029",
  }),
  actionBar: (props) => ({
    backgroundColor: "#ECECEC",
    top: "auto",
    bottom: props.visibleFooterHeight,
    boxShadow: "-3px -3px 6px #00000029",
  }),
  containerButtonsActionBar: {
    display: "flex",
    justifyContent: "space-around",
  },
}));

export default function ProjectInteractionButtons({
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
      <AppBar className={classes.actionBar} position="fixed" elevation={0}>
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
        </Toolbar>
      </AppBar>
    );
  if (smallScreen && tinyScreen)
    return (
      <AppBar className={classes.actionBar} position="fixed" elevation={0}>
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
        </Toolbar>
      </AppBar>
    );
  else
    return (
      <Container>
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
