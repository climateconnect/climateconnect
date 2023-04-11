import { AppBar, Container, Toolbar } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import ContactCreatorButton from "./ContactCreatorButton";
import FollowButton from "../../general/FollowButton";
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
    zIndex: "1",
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
  user,
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
              withIcons={!screenSize.belowTiny}
            />
          )}
          <FollowButton
            isUserFollowing={isUserFollowing}
            handleToggleFollow={handleToggleFollowProject}
            project={project}
            hasAdminPermissions={hasAdminPermissions}
            toggleShowFollowers={toggleShowFollowers}
            followingChangePending={followingChangePending}
            texts={texts}
            screenSize={screenSize}
            numberOfFollowers={numberOfFollowers}
            bindFollow={bindFollow}
            showStartIcon={screenSize.belowSmall && !screenSize.belowTiny}
            showNumberInText={screenSize.belowSmall}
            isLoggedIn={user}
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

  return (
    <Container>
      {!hasAdminPermissions &&
        !messageButtonIsVisible &&
        contactProjectCreatorButtonRef?.current && (
          <ContactCreatorButton
            className={classes.largeScreenButton}
            creator={projectAdmin}
            handleClickContact={handleClickContact}
            explanationBackground={"#fff"}
            customCardWidth={220}
            withInfoCard={true}
            withIcons={true}
            collapsable={true}
          />
        )}
    </Container>
  );
}
