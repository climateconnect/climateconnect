import React from "react";
import { Container } from "@material-ui/core";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import { makeStyles } from "@material-ui/core/styles";
import OrganizersContainer from "./OrganizersContainer";
import BottomNavigation from "./BottomNavigation";
import AddProjectMembersContainer from "./AddProjectMembersContainer";

const useStyles = makeStyles(theme => {
  return {
    searchBarContainer: {
      marginTop: theme.spacing(4),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 100
    },
    searchBar: {
      margin: "0 auto",
      width: 800
    },
    block: {
      marginBottom: theme.spacing(4)
    },
    marginTop: {
      marginTop: theme.spacing(4)
    }
  };
});

export default function AddTeam({
  projectData,
  setProjectData,
  submit,
  goToPreviousStep,
  userOrganizations
}) {
  const classes = useStyles();

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const onClickPublish = () => {};

  const saveAsDraft = () => {};

  const getOrgObject = org => {
    console.log(userOrganizations);
    return userOrganizations.find(o => o.url_slug === org.key);
  };

  return (
    <Container maxWidth="lg" className={classes.marginTop}>
      <div className={classes.searchBarContainer}>
        <AutoCompleteSearchBar
          label="Search for your team members"
          className={`${classes.searchBar} ${classes.block}`}
        />
      </div>
      <AddProjectMembersContainer
        projectMembers={projectData.members}
        blockClassName={classes.block}
      />
      <OrganizersContainer
        parentOrganization={getOrgObject(projectData.parentOrganization)}
        blockClassName={classes.block}
      />
      <BottomNavigation
        className={classes.block}
        onClickPreviousStep={onClickPreviousStep}
        onClickPublish={onClickPublish}
        nextStepButtonType="publish"
        saveAsDraft={saveAsDraft}
      />
    </Container>
  );
}
