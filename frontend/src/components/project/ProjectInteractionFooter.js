import React from "react";
export default function ProjectInteractionFooter({
    projectAdmin,
    handleClickContact,
    hasAdminPermissions,
    messageButtonIsVisible,
    contactProjectCreatorButtonRef,
    bottomInteractionFooter,
    containerSpaceToRight,
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
        bottomInteractionFooter: bottomInteractionFooter,
        containerSpaceToRight: containerSpaceToRight,
    });
    
    if (!tinyScreen && !smallScreen)
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
    if (smallScreen)
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
    if(tinyScreen)
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
      
}