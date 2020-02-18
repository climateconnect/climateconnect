import React from "react";
import { Typography, Link, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    avatarWithInfo: {
      textAlign: "center",
      width: theme.spacing(40)
    },
    avatar: {
      height: theme.spacing(20),
      width: theme.spacing(20),
      margin: "0 auto",
      fontSize: 50,
      border: `1px solid ${theme.palette.grey[700]}`
    },
    name: {
      fontWeight: "bold",
      padding: theme.spacing(1)
    },
    subtitle: {
      color: `${theme.palette.secondary.main}`
    }
  };
});

export default function ProfilePreview({ profile }) {
  const classes = useStyles();

  return (
    <Link href={"/profile/" + profile.url} className={classes.avatarWithInfo}>
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
    </Link>
  );
}
