import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

export default function OrganizationSelect(props) {
  return (
    <FormControl fullWidth>
      <InputLabel id="organization-select-label">Organization</InputLabel>
      <Select
        labelId="organization-select-label"
        id="organization-select"
        value={props.value}
        onChange={props.handleChange}
        displayEmpty
        autoWidth
      >
        {organizationOptions(props.organizations)}
      </Select>
    </FormControl>
  );
}

function organizationOptions(organizations) {
  return organizations.map(organization => (
    <MenuItem key={organization.id} value={organization.id}>
      {organization.name}
    </MenuItem>
  ));
}
