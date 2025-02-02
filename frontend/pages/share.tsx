import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest, sendToLogin } from "../public/lib/apiOperations";
import { getProjectTypeOptions } from "../public/lib/getOptions";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import ShareProjectRoot from "../src/components/shareProject/ShareProjectRoot";
import getHubTheme from "../src/themes/fetchHubTheme";
import { transformThemeData } from "../src/themes/transformThemeData";

export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hub;

  const { auth_token } = NextCookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "project", locale: ctx.locale });
    const message = texts.please_log_in_or_sign_up_to_share_a_project;
    return sendToLogin(ctx, message);
  }
  const [
    availabilityOptions,
    userOrganizations,
    categoryOptions,
    skillsOptions,
    rolesOptions,
    statusOptions,
    projectTypeOptions,
    hubThemeData,
  ] = await Promise.all([
    getAvailabilityOptions(auth_token, ctx.locale),
    getUserOrganizations(auth_token, ctx.locale),
    getCategoryOptions(auth_token, ctx.locale),
    getSkillsOptions(auth_token, ctx.locale),
    getRolesOptions(auth_token, ctx.locale),
    getStatusOptions(auth_token, ctx.locale),
    getProjectTypeOptions(ctx.locale),
    getHubTheme(hubUrl),
  ]);
  return {
    props: nullifyUndefinedValues({
      availabilityOptions: availabilityOptions,
      userOrganizations: userOrganizations,
      categoryOptions: categoryOptions,
      skillsOptions: skillsOptions,
      rolesOptions: rolesOptions,
      statusOptions: statusOptions,
      projectTypeOptions: projectTypeOptions,
      hubUrl: hubUrl ?? undefined,
      hubThemeData: hubThemeData ?? undefined,
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
  projectTypeOptions,
  hubUrl,
  hubThemeData,
}) {
  const token = new Cookies().get("auth_token");
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSetErrorMessage = (newMessage) => setErrorMessage(newMessage);
  if (!user)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_share_a_project}
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
      >
        <LoginNudge fullPage whatToDo={texts.to_share_a_project} />
      </WideLayout>
    );
  else {
    return (
      <WideLayout
        title={texts.share_your_climate_solution}
        // hideHeadline={true}
        message={errorMessage}
        messageType={errorMessage && "error"}
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
        isHubPage={hubUrl !== ""}
        hubUrl={hubUrl}
        headerBackground={hubUrl === "prio1" ? "#7883ff" : "#FFF"}
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
          projectTypeOptions={projectTypeOptions}
          hubName={hubUrl}
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
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
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
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};
