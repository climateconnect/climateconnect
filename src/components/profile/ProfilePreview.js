import React from "react";
import { Typography, Link, Avatar, Button } from "@material-ui/core";
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
    },
    messageButton: {
      margin: "0 auto"
    },
    additionalInfo: {
      paddingBottom: theme.spacing(1)
    },
    additionalInfoEl: {
      color: theme.palette.grey[700]
    }
  };
});

export default function ProfilePreview({ profile, allowMessage, additionalInfo }) {
  const classes = useStyles();

  return (
    <Link href={"/profiles/" + profile.url} className={classes.avatarWithInfo}>
      <Avatar alt={profile.name} size="large" src={profile.image} className={classes.avatar} />
      <Typography variant="h5" className={classes.name}>
        {profile.name}
      </Typography>
      {additionalInfo && (
        <div className={classes.additionalInfo}>
          {additionalInfo.map((i, index) => (
            <Typography key={index} className={classes.additionalInfoEl}>
              {i}
            </Typography>
          ))}
        </div>
      )}
      {allowMessage && (
        <div>
          <Button variant="contained" color="primary" className={classes.messageButton}>
            Send Message
          </Button>
        </div>
      )}
    </Link>
  );
}
