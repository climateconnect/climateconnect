import React from "react";
import { Container, IconButton } from "@material-ui/core";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import { makeStyles } from "@material-ui/core/styles";
import OrganizersContainer from "./OrganizersContainer";
import BottomNavigation from "../general/BottomNavigation";
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
  onSubmit,
  saveAsDraft,
  goToPreviousStep,
  availabilityOptions,
  rolesOptions
}) {
  const classes = useStyles();
  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  //Prevent double entries
  const handleAddMember = member => {
    handleSetProjectData({
      team_members: [
        ...projectData.team_members,
        { ...member, role: rolesOptions.find(r => r.name === "Member"), role_in_project: "" }
      ]
    });
  };

  const handleRemoveMember = member => {
    handleSetProjectData({
      team_members: projectData.team_members
        .slice(0, projectData.team_members.indexOf(member))
        .concat(
          projectData.team_members.slice(
            projectData.team_members.indexOf(member) + 1,
            projectData.team_members.length
          )
        )
    });
  };

  //prevent double entries
  const handleAddOrganization = organization => {
    handleSetProjectData({
      collaborating_organizations: [...projectData.collaborating_organizations, organization]
    });
  };

  const handleRemoveOrganization = organization => {
    handleSetProjectData({
      collaborating_organizations: projectData.collaborating_organizations
        .slice(0, projectData.collaborating_organizations.indexOf(organization))
        .concat(
          projectData.collaborating_organizations.slice(
            projectData.collaborating_organizations.indexOf(organization) + 1,
            projectData.collaborating_organizations.length
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
      <form onSubmit={onSubmit}>
        <div className={classes.searchBarContainer}>
          <AutoCompleteSearchBar
            label="Search for your team members"
            className={`${classes.searchBar} ${classes.block}`}
            baseUrl={process.env.API_URL + "/api/members/?search="}
            clearOnSelect
            freeSolo
            filterOut={[...projectData.team_members]}
            onSelect={handleAddMember}
            renderOption={renderSearchOption}
            getOptionLabel={option => option.first_name + " " + option.last_name}
            helperText="Type the name of the team member you want to add next."
          />
        </div>
        <AddProjectMembersContainer
          projectData={projectData}
          blockClassName={classes.block}
          handleRemoveMember={handleRemoveMember}
          availabilityOptions={availabilityOptions}
          rolesOptions={rolesOptions}
          handleSetProjectData={handleSetProjectData}
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
          nextStepButtonType="publish"
          saveAsDraft={saveAsDraft}
        />
      </form>
    </Container>
  );
}
