import Cookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";

import { apiRequest } from "../public/lib/apiOperations";
import { getAllHubs } from "../public/lib/hubOperations";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import WideLayout from "../src/components/layouts/WideLayout";
import getProfileInfoMetadata from "./../public/data/profile_info_metadata";
import { nullifyUndefinedValues, parseProfile } from "./../public/lib/profileOperations";
import EditProfileRoot from "./../src/components/profile/EditProfileRoot";

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const [skillsOptions, availabilityOptions, userProfile, allHubs] = await Promise.all([
    getSkillsOptions(token, ctx.locale),
    getAvailabilityOptions(token, ctx.locale),
    getUserProfile(token, ctx.locale),
    getAllHubs(ctx.locale, true),
  ]);
  return {
    props: nullifyUndefinedValues({
      skillsOptions: skillsOptions,
      availabilityOptions: availabilityOptions,
      user: userProfile,
      allHubs: allHubs,
    }),
  };
}

export default function EditProfilePage({ skillsOptions, availabilityOptions, user, allHubs }) {
  const { locale } = useContext(UserContext);
  let infoMetadata = getProfileInfoMetadata(locale);
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
  console.log(profile);
  if (!profile)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_edit_your_profile}
        hideHeadline={true}
      >
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
          allHubs={allHubs}
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
      shouldThrowError: true,
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
}

async function getAvailabilityOptions(token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/availability/",
      token: token,
      locale: locale,
      shouldThrowError: true,
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
}

async function getUserProfile(token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/edit_profile/",
      token: token,
      locale: locale,
      shouldThrowError: true,
    });
    return resp.data;
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
