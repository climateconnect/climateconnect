import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { getProjectTypeOptions } from "../../public/lib/getOptions";
import { apiRequest } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import BrowseContext from "../../src/components/context/BrowseContext";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProfileRoot from "../../src/components/profile/ProfileRoot";
import getProfileInfoMetadata from "./../../public/data/profile_info_metadata";
import { nullifyUndefinedValues, parseProfile } from "./../../public/lib/profileOperations";
import UserContext from "./../../src/components/context/UserContext";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const profileUrl = encodeURI(ctx.query.profileUrl);
  const [profile, organizations, projects, ideas, projectTypes] = await Promise.all([
    getProfileByUrlIfExists(profileUrl, auth_token, ctx.locale),
    getOrganizationsByUser(profileUrl, auth_token, ctx.locale),
    getProjectsByUser(profileUrl, auth_token, ctx.locale),
    getIdeasByUser(profileUrl, auth_token, ctx.locale),
    getProjectTypeOptions(ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      profile: profile,
      organizations: organizations,
      projects: projects,
      ideas: ideas,
      projectTypes: projectTypes,
    }),
  };
}

export default function ProfilePage({ profile, projects, organizations, ideas, projectTypes }) {
  const token = new Cookies().get("auth_token");
  const { user, locale } = useContext(UserContext);
  const infoMetadata = getProfileInfoMetadata(locale);
  const texts = getTexts({ page: "profile", locale: locale, profile: profile });

  const contextValues = {
    projectTypes: projectTypes,
  };

  return (
    <WideLayout
      title={profile ? texts.persons_profile : texts.not_found}
      description={
        profile.name +
        " | " +
        profile.info.location +
        (profile.info.bio ? " | " + profile.info.bio : "")
      }
    >
      {profile ? (
        <BrowseContext.Provider value={contextValues}>
          <ProfileRoot
            profile={profile}
            projects={projects}
            organizations={organizations}
            infoMetadata={infoMetadata}
            user={user}
            token={token}
            texts={texts}
            locale={locale}
            ideas={ideas}
          />
        </BrowseContext.Provider>
      ) : (
        <PageNotFound itemName="Profile" />
      )}
    </WideLayout>
  );
}

async function getProfileByUrlIfExists(profileUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/member/" + profileUrl + "/",
      token: token,
      locale: locale,
    });
    return parseProfile(resp.data, false);
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}

async function getIdeasByUser(profileUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/member/" + profileUrl + "/ideas/",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return resp.data.results.map((r) => r.idea);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectsByUser(profileUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/member/" + profileUrl + "/projects/",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return parseProjectStubs(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getOrganizationsByUser(profileUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/member/" + profileUrl + "/organizations/",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return parseOrganizationStubs(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseProjectStubs(projects) {
  return projects.map((p) => {
    const project = p.project;
    return {
      ...project,
      location: project.location,
    };
  });
}

function parseOrganizationStubs(organizations) {
  return organizations.map((o) => ({
    ...o.organization,
    types: o.organization.types.map((type) => type.organization_tag),
    info: {
      location: o.organization.location,
      short_description: o.organization?.short_description,
    },
  }));
}
