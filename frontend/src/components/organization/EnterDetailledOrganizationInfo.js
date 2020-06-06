import React from "react";
import Router from "next/router";
import EditAccountPage from "./../account/EditAccountPage";
import organization_info_metadata from "./../../../public/data/organization_info_metadata.js";
import organization_types from "./../../../public/data/organization_types.json";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    topMessageContainer: {
      padding: theme.spacing(2),
      textAlign: "center"
    }
  };
});

const parseOrganizationInfo = info => {
  const ret = { info: {} };
  Object.keys(info).map(key => {
    if (organization_info_metadata[key]) ret.info[key] = info[key];
    else ret[key] = info[key];
  });
  return ret;
};

export default function EnterDetailledOrganizationInfo({
  errorMessage,
  organizationInfo,
  handleSubmit
}) {
  const organization = parseOrganizationInfo(organizationInfo);
  const classes = useStyles();

  const handleCancel = () => {
    Router.push("/");
  };

  return (
    <div>
      <div className={classes.topMessageContainer}>
        <Typography color="primary">Almost done!</Typography>
        <Typography color="primary">
          Here you can customize your organization page and add details
        </Typography>
      </div>
      <EditAccountPage
        type="organization"
        account={organization}
        possibleAccountTypes={organization_types.organization_types}
        infoMetadata={organization_info_metadata}
        maxAccountTypes={organization_types.max_types}
        accountHref={"/organizations/" + organization.url}
        handleSubmit={handleSubmit}
        submitMessage="Create"
        handleCancel={handleCancel}
        errorMessage={errorMessage}
      />
    </div>
  );
}
