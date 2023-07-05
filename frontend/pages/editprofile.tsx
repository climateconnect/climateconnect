import Cookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";

import { apiRequest } from "../public/lib/apiOperations";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import getProfileInfoMetadata from "./../public/data/profile_info_metadata";
import { nullifyUndefinedValues, parseProfile } from "./../public/lib/profileOperations";
import EditProfileRoot from "./../src/components/profile/EditProfileRoot";

export async function getServerSideProps(ctx) {
  const { auth_token } = Cookies(ctx);
  const [skillsOptions, availabilityOptions, userProfile] = await Promise.all([
    getSkillsOptions(auth_token, ctx.locale),
    getAvailabilityOptions(auth_token, ctx.locale),
    getUserProfile(auth_token, ctx.locale),
  ]);

  return {
    props: nullifyUndefinedValues({
      skillsOptions: skillsOptions,
      availabilityOptions: availabilityOptions,
      user: userProfile,
    }),
  };
}

export default function EditProfilePage({ skillsOptions, availabilityOptions, user }) {
  const { locale } = useContext(UserContext);
  let infoMetadata: any = getProfileInfoMetadata(locale);
  const texts = getTexts({ page: "profile", locale: locale });
  const [errorMessage, setErrorMessage] = useState("");
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const locationInputRef = useRef(null);
  const handleSetLocationOptionsOpen = (newValue) => {
    setLocationOptionsOpen(newValue);
  };

  //add dynamic data to the data retrieved from profile_info_metadata.js
  infoMetadata = {
    ...infoMetadata,
    availability: {
      ...infoMetadata.availability,
      options: availabilityOptions,
    },
    location: {
      ...infoMetadata.location,
      locationOptionsOpen: locationOptionsOpen,
      setLocationOptionsOpen: handleSetLocationOptionsOpen,
      locationInputRef: locationInputRef,
    },
  };
  const profile = user ? parseProfile(user, true) : null;
  if (!profile)
    return (
      <WideLayout title={texts.please_log_in + " " + texts.to_edit_your_profile}>
        <LoginNudge fullPage whatToDo={texts.to_edit_your_profile} />
      </WideLayout>
    );
  else
    return (
      <WideLayout
        title={texts.edit_profile}
        message={errorMessage}
        messageType={errorMessage && "error"}
      >
        <EditProfileRoot
          profile={profile}
          user={user}
          initialTranslations={user.translations}
          skillsOptions={skillsOptions}
          infoMetadata={infoMetadata}
          locationInputRef={locationInputRef}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          setErrorMessage={setErrorMessage}
          availabilityOptions={availabilityOptions}
        />
      </WideLayout>
    );
}

async function getSkillsOptions(token, locale) {
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
}

async function getAvailabilityOptions(token, locale) {
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
}

async function getUserProfile(token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/edit_profile/",
      token: token,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
