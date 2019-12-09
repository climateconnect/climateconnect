import React from "react";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import OrganizationSelect from "../../components/general/OrganizationSelect.js";

export default function ProjectBasicsPane(props) {
  return (
    <>
      <OrganizationSelect
        organizations={props.organizations}
        handleChange={props._handleOrganizationChange}
        value={props.organization_id}
      ></OrganizationSelect>
      <FormControl fullWidth>
        <TextField
          id="project_name"
          label="Project name"
          onChange={props._handleProjectNameChange}
          fullWidth
        />
      </FormControl>
      <FormControl fullWidth>
        <TextField
          id="project_location"
          label="Location"
          onChange={props._handleProjectLocationChange}
          fullWidth
        />
      </FormControl>
    </>
  );
}
