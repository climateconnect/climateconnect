import React from "react";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import { Typography, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const useStyles = makeStyles(theme => {
  return {
    header: {
      marginBottom: theme.spacing(2),
      fontSize: 20
    },
    info: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: theme.spacing(2)
    },
    infoIcon: {
      marginBottom: -6
    }
  };
});

export default function OrganizersContainer({
  projectData,
  blockClassName,
  searchBarClassName,
  searchBarContainerClassName,
  handleAddOrganization
}) {
  const classes = useStyles();

  const renderSearchOption = option => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.name}
      </React.Fragment>
    );
  };

  console.log(projectData);

  return (
    <div>
      <div className={blockClassName}>
        <div className={searchBarContainerClassName}>
          <AutoCompleteSearchBar
            label="Search for collaborating organizations"
            className={`${searchBarClassName} ${blockClassName}`}
            baseUrl="http://localhost:8000/api/organizations/?"
            clearOnSelect
            onSelect={handleAddOrganization}
            renderOption={renderSearchOption}
            getOptionLabel={option => option.name}
            helperText="Type the name of the collaborating organization yoz want to add next."
          />
        </div>
        <div className={blockClassName}>
          <Typography className={classes.info}>
            <InfoOutlinedIcon className={classes.infoIcon} /> Use the search bar to add
            collaborating organizations.
          </Typography>
          <Typography component="h2" variant="subtitle2" className={classes.header}>
            Responsible Organization
          </Typography>
          <MiniOrganizationPreview
            organization={projectData.parent_organization}
            type="parentOrganization"
          />
        </div>
        {projectData.collaboratingOrganizations.length > 0 && (
          <div>
            <Typography component="h2" variant="subtitle2" className={classes.header}>
              Collaborating Organizations
            </Typography>
            {projectData.collaboratingOrganizations.map((o, index) => (
              <MiniOrganizationPreview key={index} organization={o} type="parentOrganization" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
