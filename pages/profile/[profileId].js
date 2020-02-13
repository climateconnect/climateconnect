import React from "react";
import Link from "next/link";
import AboutLayout from "../../src/components/layouts/AboutLayout";
import { Container, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import TEMP_FEATURED_DATA from "../../public/data/profiles.json";

const useStyles = makeStyles(theme => {
  return {
    background: {
      width: "100%"
    },
    avatar: {
      height: theme.spacing(20),
      width: theme.spacing(20),
      margin: "0 auto",
      marginTop: theme.spacing(-11)
    },
    avatarWithName: {
      textAlign: "center",
      width: theme.spacing(40),
      margin: "0 auto"
    },
    name: {
      fontWeight: "bold",
      padding: theme.spacing(1)
    },
    subtitle: {
      color: `${theme.palette.secondary.main}`
    },
    content: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      color: `${theme.palette.secondary.main}`
    },
    noPadding: {
      padding: 0
    },
    location: {
      display: "inline-block",
      textAlign: "center",
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1)
    },
    locationIcon: {
      marginBottom: -5
    }
  };
});

export default function ProfilePage({ profile }) {
  return (
    <AboutLayout title={profile.name + "'s profile"}>
      {profile ? <ProfileLayout profile={profile} /> : <NoProfileFoundLayout />}
    </AboutLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  return {
    profile: await getProfileByIdIfExists(ctx.query.profileId)
  };
};

function ProfileLayout({ profile }) {
  console.log(profile);
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <img src={profile.background_image} className={classes.background} />
      <Container className={classes.avatarWithName}>
        <Avatar
          alt={profile.name}
          size="large"
          src={"/images/" + profile.image}
          className={classes.avatar}
        />
        <Typography variant="h5" className={classes.name}>
          {profile.name}
        </Typography>
        <Typography className={classes.subtitle}>{profile.type}</Typography>
      </Container>
      <Container className={classes.memberInfo}>
        <div className={classes.subtitle}>Bio:</div>
        <div className={classes.content}>{profile.bio}</div>
        <div className={classes.location}>
          <Typography variant="body2" color="secondary" className={classes.location}>
            <PlaceIcon className={classes.locationIcon} />
            <span className={classes.content}>{profile.location}</span>
          </Typography>
        </div>
        <div className={classes.subtitle}>Skills:</div>
        <div className={classes.content}>{profile.skills.join(", ")}</div>
        <div className={classes.subtitle}>Availability:</div>
        <div className={classes.content}>{profile.availability} hours per week</div>
      </Container>
    </Container>
  );
}

function NoProfileFoundLayout() {
  return (
    <>
      <p>Profile not found.</p>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByIdIfExists(profileId) {
  return TEMP_FEATURED_DATA.profiles.find(({ id }) => id === profileId);
}
