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
      fontSize: 50
    },
    name: {
      fontWeight: 700,
      padding: theme.spacing(1),
      paddingBottom: 0,
      marginTop: theme.spacing(2)
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
    lowImportanceInfo: {
      color: theme.palette.grey[700],
      fontSize: "12px",
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1)
    },
    highImportanceInfo: {
      color: "#000"
    },
    disableHover: {
      "&:hover": {
        textDecoration: "none"
      }
    }
  };
});

export default function ProfilePreview({ profile, allowMessage, showAdditionalInfo }) {
  const classes = useStyles();
  return (
    <div className={classes.avatarWithInfo}>
      <Link href={"/profiles/" + profile.url} className={classes.disableHover}>
        <Avatar alt={profile.name} size="large" src={profile.image} className={classes.avatar} />
        <Typography variant="h6" className={classes.name}>
          {profile.name}
        </Typography>
        {showAdditionalInfo && (
          <div className={classes.additionalInfo}>
            {Object.keys(profile.additionalInfo).map((key, index) => {
              const item = profile.additionalInfo[key];
              return (
                <Typography
                  key={index}
                  className={`${
                    item.importance === "low"
                      ? classes.lowImportanceInfo
                      : classes.highImportanceInfo
                  }`}
                >
                  {item.icon && <item.icon name={item.iconName} />}
                  {item.text}
                </Typography>
              );
            })}
          </div>
        )}
      </Link>
      {allowMessage && (
        <div>
          <Button
            variant="contained"
            href={"/messageUser/" + profile.url}
            color="primary"
            className={classes.messageButton}
          >
            Send Message
          </Button>
        </div>
      )}
    </div>
  );
}
