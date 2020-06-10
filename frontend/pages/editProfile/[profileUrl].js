import React from "react";
import Link from "next/link";
import Router from "next/router";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditAccountPage from "./../../src/components/account/EditAccountPage";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_FEATURED_DATA from "../../public/data/profiles.json";
import TEMP_PROFILE_TYPES from "./../../public/data/profile_types.json";
import TEMP_INFOMETADATA from "./../../public/data/profile_info_metadata.json";

const useStyles = makeStyles(theme => {
  return {
    noprofile: {
      textAlign: "center",
      padding: theme.spacing(5)
    }
  };
});

//This route should later be changed to "/editProfile" and should load the profile of the logged in person.

export default function EditProfilePage({ profile, profileTypes, infoMetadata, maxAccountTypes }) {
  const saveChanges = () => {
    //TODO: replace this with an API call that saves the updated account to our database
  };
  const handleCancel = () => {
    Router.push("/profiles/" + profile.url_slug);
  };

  return (
    <WideLayout title={profile ? profile.name + "'s profile" : "Not found"}>
      {profile ? (
        <ProfileLayout
          profile={profile}
          profileTypes={profileTypes}
          infoMetadata={infoMetadata}
          maxAccountTypes={maxAccountTypes}
          handleSubmit={saveChanges}
          handleCancel={handleCancel}
        />
      ) : (
        <NoProfileFoundLayout />
      )}
    </WideLayout>
  );
}

EditProfilePage.getInitialProps = async ctx => {
  return {
    profile: await getProfileByUrlIfExists(ctx.query.profileUrl),
    profileTypes: await getProfileTypes(),
    infoMetadata: await getProfileInfoMetadata(),
    maxAccountTypes: await getMaxProfileTypes()
  };
};

function ProfileLayout({
  profile,
  profileTypes,
  infoMetadata,
  maxAccountTypes,
  handleSubmit,
  handleCancel
}) {
  return (
    <EditAccountPage
      type="profile"
      account={profile}
      possibleAccountTypes={profileTypes}
      infoMetadata={infoMetadata}
      maxAccountTypes={maxAccountTypes}
      handleSave={handleSubmit}
      handleCancel={handleCancel}
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

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByUrlIfExists(profileUrl) {
  return TEMP_FEATURED_DATA.profiles.find(({ url }) => url === profileUrl);
}

async function getProfileTypes() {
  return TEMP_PROFILE_TYPES.profile_types;
}

async function getMaxProfileTypes() {
  return TEMP_PROFILE_TYPES.max_types;
}

async function getProfileInfoMetadata() {
  return TEMP_INFOMETADATA;
}
