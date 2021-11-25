import { AppBar, Container, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ContactCreatorButton from "./ContactCreatorButton";
import FollowButton from "./FollowButton";
import LikeButton from "./LikeButton";

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
  isUserFollowing,
  isUserLiking,
  handleToggleFollowProject,
  handleToggleLikeProject,
  toggleShowFollowers,
  followingChangePending,
  likingChangePending,
  texts,
  screenSize,
  numberOfFollowers,
  numberOfLikes,
  bindLike,
  bindFollow,
}) {
  const classes = useStyles({
    visibleFooterHeight: visibleFooterHeight,
    tabContentContainerSpaceToRight: tabContentContainerSpaceToRight,
  });

  if (screenSize.belowSmall)
    return (
      <AppBar className={classes.actionBar} position="fixed" elevation={0}>
        <Toolbar className={classes.containerButtonsActionBar} variant="dense">
          {!hasAdminPermissions && (
            <ContactCreatorButton
              creator={projectAdmin}
              handleClickContact={handleClickContact}
              screenSize={screenSize}
              tiny={screenSize.belowTiny}
              small={screenSize.belowSmall && !screenSize.belowTiny}
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
            screenSize={screenSize}
            numberOfFollowers={numberOfFollowers}
            bindFollow={bindFollow}
          />
          <LikeButton
            texts={texts}
            screenSize={screenSize}
            isUserLiking={isUserLiking}
            handleToggleLikeProject={handleToggleLikeProject}
            likingChangePending={likingChangePending}
            numberOfLikes={numberOfLikes}
            bindLike={bindLike}
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
              creator={projectAdmin}
              handleClickContact={handleClickContact}
              isUserLiking={isUserLiking}
              handleToggleLikeProject={handleToggleLikeProject}
              explanationBackground={"#fff"}
            />
          )}
      </Container>
    );
}
