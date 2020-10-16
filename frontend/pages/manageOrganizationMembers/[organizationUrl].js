import Layout from "../../src/components/layouts/layout";
import React from "react";
import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";
import { useContext } from "react";
import Cookies from "next-cookies";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import LoginNudge from "../../src/components/general/LoginNudge";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ManageOrganizationMembers from "../../src/components/organization/ManageOrganizationMembers";

const useStyles = makeStyles(theme => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    }
  };
});

export default function manageOrganizationMembers({
  organization,
  members,
  availabilityOptions,
  rolesOptions,
  token
}) {
  const { user } = useContext(UserContext);
  const classes = useStyles();
  const [currentMembers, setCurrentMembers] = React.useState(
    members ? [...members.sort((a, b) => b.role.role_type - a.role.role_type)] : []
  );
  if (!user)
    return (
      <WideLayout
        title="Please log in to manage the members of this organization"
        hideHeadline={true}
      >
        <LoginNudge fullPage whatToDo="manage the members of this organization" />
      </WideLayout>
    );
  else if (!members.find(m => m.id === user.id))
    return (
      <WideLayout
        title="Please log in to manage the members of an organization"
        hideHeadline={true}
      >
        <Typography variant="h4" color="primary" className={classes.headline}>
          You are not a member of this organization. Go to{" "}
          <a href={"/organizations/" + organization.url_slug}>the organization page</a> and click
          join to join it.
        </Typography>
      </WideLayout>
    );
  else if (
    members.find(m => m.id === user.id).role.name != "Creator" &&
    members.find(m => m.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title="No permission to manage members of this organization" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          You need to be an administrator of the organization to manage organization members.
        </Typography>
      </WideLayout>
    );
  else {
    return (
      <Layout title="Manage organization's members" hideHeadline>
        <ManageOrganizationMembers
          user={user}
          members={members}
          currentMembers={currentMembers}
          setCurrentMembers={setCurrentMembers}
          rolesOptions={rolesOptions}
          organization={organization}
          token={token}
          availabilityOptions={availabilityOptions}
        />
      </Layout>
    );
  }
}

manageOrganizationMembers.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  return {
    organization: await getOrganizationByUrlIfExists(organizationUrl, token),
    members: await getMembersByOrganization(organizationUrl, token),
    rolesOptions: await getRolesOptions(token),
    availabilityOptions: await getAvailabilityOptions(token),
    token: token
  };
};

async function getOrganizationByUrlIfExists(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/",
      tokenConfig(token)
    );
    return parseOrganization(resp.data);
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getMembersByOrganization(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/members/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseOrganizationMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganizationMembers(members) {
  return members.map(m => {
    const member = m.user;
    return {
      ...member,
      member_id: m.id,
      image: process.env.API_URL + member.image,
      name: member.first_name + " " + member.last_name,
      role: m.permission,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization ? m.role_in_organization : "",
      location: member.city ? member.city + ", " + member.country : member.country,
      isCreator: m.permission.role_type === 2
    };
  });
}

function parseOrganization(organization) {
  return {
    url_slug: organization.url_slug,
    background_image: organization.background_image,
    name: organization.name,
    image: organization.image,
    types: organization.types.map(t => ({ ...t.organization_tag, key: t.organization_tag.id })),
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country,
      shortdescription: organization.short_description,
      school: organization.school,
      organ: organization.organ,
      parent_organization: organization.parent_organization
    }
  };
}

const getRolesOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/roles/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getAvailabilityOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/availability/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};
