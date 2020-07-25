import React from "react";
import Link from "next/link";
import Router from "next/router";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditAccountPage from "../../src/components/account/EditAccountPage";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import organization_info_metadata from "../../public/data/organization_info_metadata.js";
import Cookies from "next-cookies";
import axios from "axios";
import tokenConfig from "../../public/config/tokenConfig";
import { getImageUrl } from "../../public/lib/imageOperations";

const useStyles = makeStyles(theme => ({
  subtitle: {
    color: `${theme.palette.secondary.main}`
  },
  noprofile: {
    textAlign: "center",
    paddingTop: theme.spacing(5)
  }
}));

//This route should only be accessible to admins of the organization

export default function EditOrganizationPage({ organization, tagOptions, token }) {
  const saveChanges = (event, editedOrg) => {
    const org = parseForRequest(getChanges(editedOrg, organization));
    console.log(org);
    axios
      .patch(
        process.env.API_URL + "/api/organizations/" + organization.url_slug + "/",
        org,
        tokenConfig(token)
      )
      .then(function() {
        Router.push({
          pathname: "/organizations/" + organization.url_slug,
          query: {
            message: "You have successfully edited your organization."
          }
        });
      })
      .catch(function(error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };
  const handleCancel = () => {
    Router.push("/organizations/" + organization.url_slug);
  };
  const getChanges = (o, oldO) => {
    const finalProfile = {};
    const org = { ...o, ...o.info };
    delete org.info;
    const oldOrg = { ...oldO, ...oldO.info };
    delete oldOrg.info;
    Object.keys(org).map(k => {
      if (oldOrg[k] && org[k] && Array.isArray(oldOrg[k]) && Array.isArray(org[k])) {
        if (!arraysEqual(oldOrg[k], org[k])) finalProfile[k] = org[k];
      } else if (oldOrg[k] !== org[k] && !(!oldOrg[k] && !org[k])) finalProfile[k] = org[k];
    });
    return finalProfile;
  };

  function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <EditAccountPage
          type="organization"
          account={organization}
          possibleAccountTypes={tagOptions}
          infoMetadata={organization_info_metadata}
          accountHref={"/organizations/" + organization.url_slug}
          maxAccountTypes={2}
          handleSubmit={saveChanges}
          handleCancel={handleCancel}
        />
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

EditOrganizationPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const url = ctx.query.organizationUrl;
  return {
    organization: await getOrganizationByUrlIfExists(url, token),
    tagOptions: await getTags(),
    token: token
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
async function getOrganizationByUrlIfExists(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/",
      tokenConfig(token)
    );
    return parseOrganization(resp.data);
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getTags(token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizationtags/",
      tokenConfig(token)
    );
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map(t => {
        return { ...t, key: t.id, additionalInfo: t.additional_info ? t.additional_info : [] };
      });
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganization(organization) {
  const org = {
    url_slug: organization.url_slug,
    background_image: getImageUrl(organization.background_image),
    name: organization.name,
    image: getImageUrl(organization.image),
    types: organization.types.map(t => ({ ...t.organization_tag, key: t.organization_tag.id })),
    info: {
      city: organization.city,
      country: organization.country,
      shortdescription: organization.short_description,
      website: organization.website
    }
  };
  org.types = org.types.map(t => t.key);
  const additional_info = organization.types.reduce((additionalInfoArray, t) => {
    const type = t.organization_tag;
    if (type.additional_info && type.additional_info.length > 0) {
      additionalInfoArray = additionalInfoArray.concat(type.additional_info);
    } else console.log(type.additional_info);
    return additionalInfoArray;
  }, []);
  additional_info.map(infoEl => {
    org.info[infoEl] = organization[infoEl];
  });
  //Add parent org late so it's the lowest entry on the page
  const hasParentOrganization =
    organization.parent_organization && !!organization.parent_organization.name;
  if (hasParentOrganization) org.info.parent_organization = organization.parent_organization;
  else org.info.parent_organization = null;
  org.info.has_parent_organization = hasParentOrganization;
  return org;
}

const parseForRequest = org => {
  const parsedOrg = {
    ...org
  };
  if (org.shortdescription) parsedOrg.short_description = org.shortdescription;
  if (org.parent_organization)
    parsedOrg.parent_organization = org.parent_organization ? org.parent_organization.id : null;
  return parsedOrg;
};
