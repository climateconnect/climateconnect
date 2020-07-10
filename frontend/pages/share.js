import React, { useContext } from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
import Cookies from "next-cookies";
import LoginNudge from "../src/components/general/LoginNudge";
import UserContext from "../src/components/context/UserContext";
import ShareProjectRoot from "../src/components/shareProject/ShareProjectRoot";
import { parseOptions } from "../public/lib/selectOptionsOperations";

export default function Share({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  statusOptions,
  token
}) {
  const { user } = useContext(UserContext);
  if (!user)
    return (
      <WideLayout title="Please log in to share a project" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="share a project" />
      </WideLayout>
    );
  else {
    return (
      <WideLayout title="Share a project" hideHeadline={true}>
        <ShareProjectRoot
          availabilityOptions={availabilityOptions}
          userOrganizations={userOrganizations}
          categoryOptions={categoryOptions}
          skillsOptions={skillsOptions}
          rolesOptions={rolesOptions}
          user={user}
          statusOptions={statusOptions}
          token={token}
        />
      </WideLayout>
    );
  }
}

Share.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    availabilityOptions: await getAvailabilityOptions(token),
    userOrganizations: await getUserOrganizations(token),
    categoryOptions: await getCategoryOptions(token),
    skillsOptions: await getSkillsOptions(token),
    rolesOptions: await getRolesOptions(token),
    statusOptions: await getStatusOptions(token),
    token: token
  };
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

const getCategoryOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/projecttags/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(resp.data.results, "parent_tag");
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getSkillsOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/skills/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(resp.data.results, "parent_skill");
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

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

const getStatusOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/projectstatus/", tokenConfig(token));
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

const getUserOrganizations = async token => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map(o => o.organization);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};
