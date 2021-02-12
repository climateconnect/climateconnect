import React from "react";
import Router from "next/router";
import EditAccountPage from "./../account/EditAccountPage";
import organization_info_metadata from "./../../../public/data/organization_info_metadata.js";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => {
  return {
    alert: {
      textAlign: "center",
      maxWidth: 1280,
      margin: "0 auto",
    },
  };
});

const parseOrganizationInfo = (info) => {
  const ret = { info: {} };
  Object.keys(info).map((key) => {
    if (organization_info_metadata[key]) ret.info[key] = info[key];
    else ret[key] = info[key];
  });
  return ret;
};

export default function EnterDetailledOrganizationInfo({
  errorMessage,
  organizationInfo,
  handleSubmit,
  tagOptions,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
}) {
  const organization = parseOrganizationInfo(organizationInfo);
  const infoMetadata = {
    ...organization_info_metadata,
    location: {
      ...organization_info_metadata.location,
      locationOptionsOpen: locationOptionsOpen,
      setLocationOptionsOpen: handleSetLocationOptionsOpen,
      locationInputRef: locationInputRef,
    },
  };
  const classes = useStyles();

  const handleCancel = () => {
    Router.push("/browse");
  };
  return (
    <div>
      {!errorMessage && (
        <div>
          <Alert severity="success" className={classes.alert}>
            Almost done! Here you can customize your organization page and add details
          </Alert>
        </div>
      )}
      <EditAccountPage
        type="organization"
        account={organization}
        possibleAccountTypes={[...tagOptions]}
        infoMetadata={infoMetadata}
        maxAccountTypes={2}
        accountHref={"/organizations/" + organization.url_slug}
        handleSubmit={handleSubmit}
        submitMessage="Create"
        handleCancel={handleCancel}
        errorMessage={errorMessage}
      />
    </div>
  );
}
