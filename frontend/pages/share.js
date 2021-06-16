import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest, sendToLogin } from "../public/lib/apiOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import ShareProjectRoot from "../src/components/shareProject/ShareProjectRoot";

export async function getServerSideProps(ctx) {
  const { token } = NextCookies(ctx);
  if (ctx.req && !token) {
    const texts = getTexts({ page: "project", locale: ctx.locale });
    const message = texts.please_log_in_or_sign_up_to_share_a_project;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const [
    availabilityOptions,
    userOrganizations,
    categoryOptions,
    skillsOptions,
    rolesOptions,
    statusOptions,
  ] = await Promise.all([
    getAvailabilityOptions(token, ctx.locale),
    getUserOrganizations(token, ctx.locale),
    getCategoryOptions(token, ctx.locale),
    getSkillsOptions(token, ctx.locale),
    getRolesOptions(token, ctx.locale),
    getStatusOptions(token, ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      availabilityOptions: availabilityOptions,
      userOrganizations: userOrganizations,
      categoryOptions: categoryOptions,
      skillsOptions: skillsOptions,
      rolesOptions: rolesOptions,
      statusOptions: statusOptions,
    }),
  };
}

export default function Share({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  statusOptions,
}) {
  const token = new Cookies().get("token");
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

const getAvailabilityOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/availability/",
      token: token,
      locale: locale,
    });
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

const getCategoryOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projecttags/",
      token: token,
      locale: locale,
    });
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

const getSkillsOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/skills/",
      token: token,
      locale: locale,
    });
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

const getRolesOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/roles/",
      token: token,
      locale: locale,
    });
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

const getStatusOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projectstatus/",
      token: token,
      locale: locale,
    });
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

const getUserOrganizations = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/my_organizations/",
      token: token,
      locale: locale,
    });
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
