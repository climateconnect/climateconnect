import React from "react";
import { Container } from "@material-ui/core";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import { makeStyles } from "@material-ui/core/styles";
import OrganizersContainer from "./OrganizersContainer";

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
    }
  };
});

export default function AddTeam({ projectData, setProjectData, submit, goToPreviousStep }) {
  const classes = useStyles();
  return (
    <Container maxWidth="lg">
      <OrganizersContainer organizations={projectData.parentOrganizations} />
      <div className={classes.searchBarContainer}>
        <AutoCompleteSearchBar label="Search for your team members" className={classes.searchBar} />
      </div>
    </Container>
  );
}
