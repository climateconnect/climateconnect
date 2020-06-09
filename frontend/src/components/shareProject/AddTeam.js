import React from "react";
import { Container, IconButton } from "@material-ui/core";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import { makeStyles } from "@material-ui/core/styles";
import OrganizersContainer from "./OrganizersContainer";
import BottomNavigation from "./BottomNavigation";
import AddProjectMembersContainer from "./AddProjectMembersContainer";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

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
      width: 800,
      display: "flex"
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
  handleSetProjectData,
  submit,
  saveAsDraft,
  goToPreviousStep
}) {
  const classes = useStyles();

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const onClickPublish = () => {};

  //Prevent double entries
  const handleAddMember = member => {
    handleSetProjectData({
      members: [
        ...projectData.members,
        { ...member, permissions: { key: "member", name: "Member" }, role: "" }
      ]
    });
  };

  const handleRemoveMember = member => {
    handleSetProjectData({
      members: projectData.members
        .slice(0, projectData.members.indexOf(member))
        .concat(
          projectData.members.slice(
            projectData.members.indexOf(member) + 1,
            projectData.members.length
          )
        )
    });
  };

  //prevent double entries
  const handleAddOrganization = organization => {
    handleSetProjectData({
      collaboratingOrganizations: [...projectData.collaboratingOrganizations, organization]
    });
  };

  const handleRemoveOrganization = organization => {
    handleSetProjectData({
      collaboratingOrganizations: projectData.collaboratingOrganizations
        .slice(0, projectData.collaboratingOrganizations.indexOf(organization))
        .concat(
          projectData.collaboratingOrganizations.slice(
            projectData.collaboratingOrganizations.indexOf(organization) + 1,
            projectData.collaboratingOrganizations.length
          )
        )
    });
  };

  const renderSearchOption = option => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.first_name + " " + option.last_name}
      </React.Fragment>
    );
  };

  return (
    <Container maxWidth="lg" className={classes.marginTop}>
      <form onSubmit={submit}>
        <div className={classes.searchBarContainer}>
          <AutoCompleteSearchBar
            label="Search for your team members"
            className={`${classes.searchBar} ${classes.block}`}
            baseUrl={process.env.API_URL + "/api/members/?"}
            clearOnSelect
            filterOut={[...projectData.members]}
            onSelect={handleAddMember}
            renderOption={renderSearchOption}
            getOptionLabel={option => option.first_name + " " + option.last_name}
            helperText="Type the name of the team member you want to add next."
          />
        </div>
        <AddProjectMembersContainer
          projectMembers={projectData.members}
          blockClassName={classes.block}
          handleRemoveMember={handleRemoveMember}
        />
        <OrganizersContainer
          projectData={projectData}
          blockClassName={classes.block}
          searchBarClassName={classes.searchBar}
          searchBarContainerClassName={classes.searchBarContainer}
          handleAddOrganization={handleAddOrganization}
          handleRemoveOrganization={handleRemoveOrganization}
        />
        <BottomNavigation
          className={classes.block}
          onClickPreviousStep={onClickPreviousStep}
          onClickPublish={onClickPublish}
          nextStepButtonType="submit"
          saveAsDraft={saveAsDraft}
        />
      </form>
    </Container>
  );
}
