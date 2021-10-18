import { IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import AutoCompleteSearchBar from "../search/AutoCompleteSearchBar";

const useStyles = makeStyles((theme) => {
  return {
    header: {
      marginBottom: theme.spacing(2),
      fontSize: 20,
    },
    info: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: theme.spacing(2),
    },
    infoIcon: {
      marginBottom: -6,
    },
  };
});

export default function OrganizersContainer({
  projectData,
  blockClassName,
  searchBarClassName,
  searchBarContainerClassName,
  handleAddOrganization,
  handleRemoveOrganization,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: projectData });

  const renderSearchOption = (option) => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.name}
      </React.Fragment>
    );
  };

  const allInvolvedOrgs = projectData.parent_organization
    ? [...projectData.collaborating_organizations, projectData.parent_organization]
    : [...projectData.collaborating_organizations];

  return (
    <div>
      <div className={blockClassName}>
        <div className={searchBarContainerClassName}>
          <AutoCompleteSearchBar
            label={texts.search_for_collaborating_organizations}
            className={`${searchBarClassName} ${blockClassName}`}
            baseUrl={process.env.API_URL + "/api/organizations/?search="}
            clearOnSelect
            freeSolo
            onSelect={handleAddOrganization}
            renderOption={renderSearchOption}
            getOptionLabel={(option) => option.name}
            filterOut={allInvolvedOrgs}
            helperText={texts.type_the_name_of_the_collaborating_organization_you_want_to_add_next}
          />
        </div>
        <div className={blockClassName}>
          {projectData.isPersonalProject ? (
            <Typography component="h2" variant="subtitle2" className={classes.header}>
              {texts.personal_project}
            </Typography>
          ) : (
            <>
              <Typography component="h2" variant="subtitle2" className={classes.header}>
                {texts.responsible_organization}
              </Typography>
              <MiniOrganizationPreview
                organization={projectData.parent_organization}
                type="parentOrganization"
              />
            </>
          )}
        </div>
        {projectData.collaborating_organizations.length > 0 && (
          <div>
            <Typography component="h2" variant="subtitle2" className={classes.header}>
              {texts.collaborating_organizations}
            </Typography>
            {projectData.collaborating_organizations.map((o, index) => (
              <MiniOrganizationPreview
                key={index}
                organization={o}
                type="parentOrganization"
                onDelete={handleRemoveOrganization}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
