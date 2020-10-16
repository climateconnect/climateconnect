import React, { useContext, useEffect } from "react";
import Link from "next/link";
import Router from "next/router";
import WideLayout from "../src/components/layouts/WideLayout";
import EditAccountPage from "./../src/components/account/EditAccountPage";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { parseProfile } from "./../public/lib/profileOperations";
import Cookies from "next-cookies";
import { parseOptions } from "../public/lib/selectOptionsOperations";
import { getImageUrl } from "../public/lib/imageOperations";

//temporary fake data
import TEMP_INFOMETADATA from "./../public/data/profile_info_metadata";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
import { getParams } from "./../public/lib/generalOperations";

const useStyles = makeStyles(theme => {
  return {
    noprofile: {
      textAlign: "center",
      padding: theme.spacing(5)
    }
  };
});

export default function EditProfilePage({
  skillsOptions,
  availabilityOptions,
  infoMetadata,
  token
}) {
  const [message, setMessage] = React.useState("");
  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) setMessage(decodeURI(params.message));
  });
  const { user } = useContext(UserContext);
  infoMetadata.availability.options = availabilityOptions;
  const profile = user ? parseProfile(user, true, true) : null;
  const saveChanges = (event, editedAccount) => {
    const parsedProfile = parseProfileForRequest(editedAccount, availabilityOptions, user);
    console.log(getProfileWithoutRedundantOptions(user, parsedProfile));
    axios
      .post(
        process.env.API_URL + "/api/edit_profile/",
        getProfileWithoutRedundantOptions(user, parsedProfile),
        tokenConfig(token)
      )
      .then(function(response) {
        Router.push({
          pathname: "/profiles/" + response.data.url_slug,
          query: {
            message: "You have successfully updated your profile!"
          }
        });
      })
      .catch(function(error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };
  const handleCancel = () => {
    Router.push("/profiles/" + profile.url_slug);
  };

  if (!profile)
    return (
      <WideLayout title="Please log in to edit your profile" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="edit your profile" />
      </WideLayout>
    );
  else
    return (
      <WideLayout message={message} title={"Edit Profile"}>
        {profile ? (
          <ProfileLayout
            profile={profile}
            infoMetadata={infoMetadata}
            handleSubmit={saveChanges}
            handleCancel={handleCancel}
            skillsOptions={skillsOptions}
          />
        ) : (
          <NoProfileFoundLayout />
        )}
      </WideLayout>
    );
}

EditProfilePage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    skillsOptions: await getSkillsOptions(token),
    infoMetadata: await getProfileInfoMetadata(token),
    availabilityOptions: await getAvailabilityOptions(token),
    token: token
  };
};

function ProfileLayout({
  profile,
  profileTypes,
  infoMetadata,
  maxAccountTypes,
  handleSubmit,
  handleCancel,
  skillsOptions
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
      splitName
      deleteEmail="support@climateconnect.earth"
    />
  );
}

function NoProfileFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Profile not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
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
  return TEMP_INFOMETADATA;
}

const parseProfileForRequest = (profile, availabilityOptions, user) => {
  const availability = availabilityOptions.find(o => o.name == profile.info.availability);
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    image: profile.image,
    background_image: profile.background_image,
    country: profile.info.country,
    city: profile.info.city,
    biography: profile.info.bio,
    availability: availability ? availability.id : user.availability ? user.availability.id : null,
    skills: profile.info.skills.map(s => s.id),
    website: profile.info.website
  };
};

const getProfileWithoutRedundantOptions = (user, newProfile) => {
  const oldProfile = {
    ...user,
    skills: user.skills.map(s => s.id),
    image: getImageUrl(user.image),
    background_image: getImageUrl(user.background_image),
    availability: user.availability && user.availability.id
  };
  const finalProfile = {};
  Object.keys(newProfile).map(k => {
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
