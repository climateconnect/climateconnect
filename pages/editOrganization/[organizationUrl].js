import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditAccountPage from "../../src/components/account/EditAccountPage";
import TEMP_FEATURED_DATA from "../../public/data/organizations.json";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_ORGANIZATION_TYPES from "./../../public/data/organization_types.json";
import TEMP_INFOMETADATA from "./../../public/data/organization_info_metadata.json";

const useStyles = makeStyles(theme => ({
  subtitle: {
    color: `${theme.palette.secondary.main}`
  }
}));

//This route should only be accessible to admins of the organization

export default function EditOrganizationPage({
  organization,
  organizationTypes,
  infoMetadata,
  maxAccountTypes
}) {
  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <EditAccountPage
          type="organization"
          account={organization}
          possibleAccountTypes={organizationTypes}
          infoMetadata={infoMetadata}
          maxAccountTypes={maxAccountTypes}
          accountHref={"/organizations/" + organization.url}
        />
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

EditOrganizationPage.getInitialProps = async ctx => {
  return {
    organization: await getOrganizationByUrlIfExists(ctx.query.organizationUrl),
    organizationTypes: await getOrganizationTypes(),
    infoMetadata: await getOrganizationInfoMetadata(),
    maxAccountTypes: await getMaxOrganizationTypes()
  };
};

function NoOrganizationFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Organization profile not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getOrganizationByUrlIfExists(organizationUrl) {
  return TEMP_FEATURED_DATA.organizations.find(({ url }) => url === organizationUrl);
}

async function getOrganizationTypes() {
  return TEMP_ORGANIZATION_TYPES.organization_types;
}

async function getMaxOrganizationTypes() {
  return TEMP_ORGANIZATION_TYPES.max_types;
}
async function getOrganizationInfoMetadata() {
  return TEMP_INFOMETADATA;
}
