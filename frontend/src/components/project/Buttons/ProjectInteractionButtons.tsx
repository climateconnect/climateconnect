import { AppBar, Button, Container, Toolbar } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import ContactCreatorButton from "./ContactCreatorButton";
import FollowButton from "../../general/FollowButton";
import LikeButton from "./LikeButton";
import { Project } from "../../../types";
import {
  shouldShowRegisterButton,
  getRegisterButtonText,
  isRegisterButtonDisabled,
} from "../../../utils/eventRegistrationHelpers";

interface ProjectInteractionButtonsProps {
  projectAdmin: any;
  handleClickContact: () => void;
  hasAdminPermissions: boolean;
  messageButtonIsVisible: boolean;
  contactProjectCreatorButtonRef: React.RefObject<HTMLElement> | null;
  visibleFooterHeight: number;
  tabContentContainerSpaceToRight: number;
  project: Project;
  isUserFollowing: boolean;
  isUserLiking: boolean;
  handleToggleFollowProject: () => void;
  handleToggleLikeProject: () => void;
  toggleShowFollowers: () => void;
  followingChangePending: boolean;
  likingChangePending: boolean;
  texts: any;
  screenSize: {
    belowSmall: boolean;
    belowTiny: boolean;
    [key: string]: boolean;
  };
  numberOfFollowers: number;
  numberOfLikes: number;
  bindLike: any;
  bindFollow: any;
  user: any;
  isEventRegistrationEnabled: boolean;
  handleRegisterClick: () => void;
}

const useStyles = makeStyles((theme) => ({
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
    zIndex: 101,
  }),
  containerButtonsActionBar: {
    display: "flex",
    justifyContent: "space-around",
  },
  registerButton: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    whiteSpace: "nowrap",
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
  isEventRegistrationEnabled,
  handleRegisterClick,
}: ProjectInteractionButtonsProps) {
  const classes = useStyles({
    visibleFooterHeight: visibleFooterHeight,
    tabContentContainerSpaceToRight: tabContentContainerSpaceToRight,
  });

  const showRegisterButton = shouldShowRegisterButton(isEventRegistrationEnabled, project);

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
          {showRegisterButton ? (
            <Button
              variant="contained"
              color={isRegisterButtonDisabled(project) ? "secondary" : "primary"}
              disabled={isRegisterButtonDisabled(project)}
              onClick={handleRegisterClick}
              className={classes.registerButton}
            >
              {getRegisterButtonText(project, texts)}
            </Button>
          ) : (
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
          )}
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
