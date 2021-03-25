import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import Cookies from "next-cookies";
import React, { useContext } from "react";
import tokenConfig from "../../public/config/tokenConfig";
import { sendToLogin } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import LoginNudge from "../../src/components/general/LoginNudge";
import Layout from "../../src/components/layouts/layout";
import WideLayout from "../../src/components/layouts/WideLayout";
import ManageOrganizationMembers from "../../src/components/organization/ManageOrganizationMembers";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const texts = getTexts({ page: "organization", locale: ctx.locale });
  if (ctx.req && !token) {
    const message = texts.you_have_to_log_in_to_manage_organization_members;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  const [organization, members, rolesOptions, availabilityOptions] = await Promise.all([
    getOrganizationByUrlIfExists(organizationUrl, token),
    getMembersByOrganization(organizationUrl, token),
    getRolesOptions(token),
    getAvailabilityOptions(token),
  ]);
  return {
    props: {
      organization: organization,
      members: members,
      rolesOptions: rolesOptions,
      availabilityOptions: availabilityOptions,
      token: token,
    },
  };
}

export default function manageOrganizationMembers({
  organization,
  members,
  availabilityOptions,
  rolesOptions,
  token,
}) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  const classes = useStyles();
  const [currentMembers, setCurrentMembers] = React.useState(
    members ? [...members.sort((a, b) => b.role.role_type - a.role.role_type)] : []
  );
  if (!user)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_manage_org_members}
        hideHeadline={true}
      >
        <LoginNudge fullPage whatToDo={texts.to_manage_org_members} />
      </WideLayout>
    );
  else if (!members.find((m) => m.id === user.id))
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_manage_org_members}
        hideHeadline={true}
      >
        <Typography variant="h4" color="primary" className={classes.headline}>
          {texts.you_are_not_a_member_of_this_organization}{" "}
          {texts.go_to_org_page_and_click_join_to_join_it}
        </Typography>
      </WideLayout>
    );
  else if (
    members.find((m) => m.id === user.id).role.name != "Creator" &&
    members.find((m) => m.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title={texts.no_permission_to_manage_members_of_this_org} hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          {texts.need_to_be_admin_to_manage_org_members}
        </Typography>
      </WideLayout>
    );
  else {
    return (
      <Layout title={texts.manage_organizations_members} hideHeadline>
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
  return members.map((m) => {
    const member = m.user;
    return {
      ...member,
      member_id: m.id,
      image: process.env.API_URL + member.image,
      name: member.first_name + " " + member.last_name,
      role: m.permission,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization ? m.role_in_organization : "",
      location: member.location,
      isCreator: m.permission.role_type === 2,
    };
  });
}

function parseOrganization(organization) {
  return {
    url_slug: organization.url_slug,
    background_image: organization.background_image,
    name: organization.name,
    image: organization.image,
    types: organization.types.map((t) => ({ ...t.organization_tag, key: t.organization_tag.id })),
    info: {
      location: organization.location,
      shortdescription: organization.short_description,
      school: organization.school,
      organ: organization.organ,
      parent_organization: organization.parent_organization,
    },
  };
}

const getRolesOptions = async (token) => {
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

const getAvailabilityOptions = async (token) => {
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
