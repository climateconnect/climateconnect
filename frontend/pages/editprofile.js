import React, { useContext } from "react";
import Router from "next/router";
import WideLayout from "../src/components/layouts/WideLayout";
import EditAccountPage from "./../src/components/account/EditAccountPage";
import { parseProfile } from "./../public/lib/profileOperations";
import Cookies from "next-cookies";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import { getImageUrl } from "../public/lib/imageOperations";

import profile_info_metadata from "./../public/data/profile_info_metadata";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
import PageNotFound from "../src/components/general/PageNotFound";

export default function EditProfilePage({
  skillsOptions,
  availabilityOptions,
  infoMetadata,
  token,
}) {
  const { user } = useContext(UserContext);
  infoMetadata.availability.options = availabilityOptions;
  const profile = user ? parseProfile(user, true, /*true*/) : null;
  const saveChanges = (event, editedAccount) => {
    const parsedProfile = parseProfileForRequest(editedAccount, availabilityOptions, user);
    axios
      .post(
        process.env.API_URL + "/api/edit_profile/",
        getProfileWithoutRedundantOptions(user, parsedProfile),
        tokenConfig(token)
      )
      .then(function (response) {
        Router.push({
          pathname: "/profiles/" + response.data.url_slug,
          query: {
            message: "You have successfully updated your profile!",
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };
  const handleCancel = () => {
    Router.push("/profiles/" + profile.url_slug);
  };
  if (!profile)
    return (
      <WideLayout title="Please Log In to Edit your Profile" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="edit your profile" />
      </WideLayout>
    );
  else
    return (
      <WideLayout title={"Edit Profile"}>
        {profile ? (
          <ProfileLayout
            profile={profile}
            infoMetadata={infoMetadata}
            handleSubmit={saveChanges}
            handleCancel={handleCancel}
            skillsOptions={skillsOptions}
          />
        ) : (
          <PageNotFound itemName="Profile" />
        )}
      </WideLayout>
    );
}

EditProfilePage.getInitialProps = async (ctx) => {
  const { token } = Cookies(ctx);
  const [skillsOptions, infoMetadata, availabilityOptions] = await Promise.all([
    getSkillsOptions(token),
    getProfileInfoMetadata(token),
    getAvailabilityOptions(token),
  ]);
  return {
    skillsOptions: skillsOptions,
    infoMetadata: infoMetadata,
    availabilityOptions: availabilityOptions,
    token: token,
  };
};

function ProfileLayout({
  profile,
  profileTypes,
  infoMetadata,
  maxAccountTypes,
  handleSubmit,
  handleCancel,
  skillsOptions,
}) {
  return (
    <EditAccountPage
      type="profile"
      account={profile}
      possibleAccountTypes={profileTypes}
      infoMetadata={infoMetadata}
      maxAccountTypes={maxAccountTypes}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      skillsOptions={skillsOptions}
      deleteEmail="support@climateconnect.earth"
    />
  );
}

async function getSkillsOptions(token) {
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
}

async function getAvailabilityOptions(token) {
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
}

async function getProfileInfoMetadata() {
  return profile_info_metadata;
}

const parseProfileForRequest = (profile, availabilityOptions, user) => {
  const availability = availabilityOptions.find((o) => o.name == profile.info.availability);
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    image: profile.image,
    background_image: profile.background_image,
    country: profile.info.country,
    location: profile.info.location,
    biography: profile.info.bio,
    availability: availability ? availability.id : user.availability ? user.availability.id : null,
    skills: profile.info.skills.map((s) => s.id),
    website: profile.info.website,
  };
};

const getProfileWithoutRedundantOptions = (user, newProfile) => {
  const oldProfile = {
    ...user,
    skills: user.skills.map((s) => s.id),
    image: getImageUrl(user.image),
    background_image: getImageUrl(user.background_image),
    availability: user.availability && user.availability.id,
  };
  const finalProfile = {};
  Object.keys(newProfile).map((k) => {
    if (
      oldProfile[k] &&
      newProfile[k] &&
      Array.isArray(oldProfile[k]) &&
      Array.isArray(newProfile[k])
    ) {
      if (!arraysEqual(oldProfile[k], newProfile[k])) finalProfile[k] = newProfile[k];
    } else if (oldProfile[k] !== newProfile[k] && !(!oldProfile[k] && !newProfile[k]))
      finalProfile[k] = newProfile[k];
  });
  return finalProfile;
};

function arraysEqual(_arr1, _arr2) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) return false;

  var arr1 = _arr1.concat().sort();
  var arr2 = _arr2.concat().sort();
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
