import axios from "axios";
import Cookies from "next-cookies";
import React, { useContext } from "react";
import tokenConfig from "../public/config/tokenConfig";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import ShareProjectRoot from "../src/components/shareProject/ShareProjectRoot";

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const [
    availabilityOptions,
    userOrganizations,
    categoryOptions,
    skillsOptions,
    rolesOptions,
    statusOptions,
  ] = await Promise.all([
    getAvailabilityOptions(token),
    getUserOrganizations(token),
    getCategoryOptions(token),
    getSkillsOptions(token),
    getRolesOptions(token),
    getStatusOptions(token),
  ]);
  return {
    props: {
      availabilityOptions: availabilityOptions,
      userOrganizations: userOrganizations,
      categoryOptions: categoryOptions,
      skillsOptions: skillsOptions,
      rolesOptions: rolesOptions,
      statusOptions: statusOptions,
      token: token,
    },
  };
}

export default function Share({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  statusOptions,
  token,
}) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSetErrorMessage = (newMessage) => setErrorMessage(newMessage);
  if (!user)
    return (
      <WideLayout title={texts.please_log_in + " " + texts.to_share_a_project} hideHeadline={true}>
        <LoginNudge fullPage whatToDo={texts.to_share_a_project} />
      </WideLayout>
    );
  else {
    return (
      <WideLayout
        title={texts.share_your_climate_solution}
        hideHeadline={true}
        message={errorMessage}
        messageType={errorMessage && "error"}
      >
        <ShareProjectRoot
          availabilityOptions={availabilityOptions}
          userOrganizations={userOrganizations}
          categoryOptions={categoryOptions}
          skillsOptions={skillsOptions}
          rolesOptions={rolesOptions}
          user={user}
          statusOptions={statusOptions}
          token={token}
          setMessage={handleSetErrorMessage}
        />
      </WideLayout>
    );
  }
}

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

const getCategoryOptions = async (token) => {
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

const getSkillsOptions = async (token) => {
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

const getStatusOptions = async (token) => {
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

const getUserOrganizations = async (token) => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map((o) => o.organization);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};
