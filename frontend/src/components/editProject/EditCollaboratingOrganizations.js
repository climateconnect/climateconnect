import { List } from "@material-ui/core";
import React from "react";

import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import AutoCompleteSearchBar from "../search/AutoCompleteSearchBar";

export default function EditCollaboratingOrganizations({
  texts,
  baseUrl,
  searchBarClass,
  handleAddCollaboratingOrg,
  organizationPreviewsContainerClass,
  organizationPreviewClass,
  selectedCollaboratingOrgs,
  handleDeleteCollaboratingOrg,
}) {
  const renderSearchOption = (option) => {
    return <React.Fragment>{option.name}</React.Fragment>;
  };

  return (
    <>
      {/* Currently allows any org to be added, maybe needs some verification on selected orgs part*/}
      <AutoCompleteSearchBar
        label={texts.select_collaborating_organizations}
        className={searchBarClass}
        baseUrl={baseUrl}
        freeSolo
        clearOnSelect
        onSelect={handleAddCollaboratingOrg}
        renderOption={renderSearchOption}
        getOptionLabel={(option) => option.name}
        helperText={texts.search_collaborating_organization_name}
      />

      {selectedCollaboratingOrgs && (
        <List className={organizationPreviewsContainerClass}>
          {selectedCollaboratingOrgs.map((sco, index) => (
            <MiniOrganizationPreview
              key={index}
              size={"small"}
              organization={sco.collaborating_organization}
              nolink
              className={organizationPreviewClass}
              showBorder
              onDelete={() => handleDeleteCollaboratingOrg(sco.collaborating_organization)}
            />
          ))}
        </List>
      )}
    </>
  );
}
