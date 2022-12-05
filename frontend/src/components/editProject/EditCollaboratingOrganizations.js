import { List } from "@material-ui/core";
import React from "react";

import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import AutoCompleteSearchBar from "../search/AutoCompleteSearchBar";

export default function EditCollaboratingOrganizations({
  baseUrl,
  handleAddCollaboratingOrg,
  handleDeleteCollaboratingOrg,
  organizationPreviewClass,
  organizationPreviewsContainerClass,
  searchBarClass,
  selectedCollaboratingOrgs,
  texts,
}) {
  const renderSearchOption = (option) => {
    return <>{option.name}</>;
  };

  return (
    <>
      {/* TODO: Currently allows any org to be added, maybe needs some verification on selected orgs part*/}
      <AutoCompleteSearchBar
        baseUrl={baseUrl}
        className={searchBarClass}
        clearOnSelect
        freeSolo
        getOptionLabel={(option) => option.name}
        helperText={texts.search_collaborating_organization_name}
        label={texts.select_collaborating_organizations}
        onSelect={handleAddCollaboratingOrg}
        renderOption={renderSearchOption}
      />

      {selectedCollaboratingOrgs && (
        <List className={organizationPreviewsContainerClass}>
          {selectedCollaboratingOrgs.map((sco, index) => (
            <MiniOrganizationPreview
              className={organizationPreviewClass}
              key={index}
              nolink
              onDelete={() => handleDeleteCollaboratingOrg(sco.collaborating_organization)}
              organization={sco.collaborating_organization}
              showBorder
              size={"small"}
            />
          ))}
        </List>
      )}
    </>
  );
}
