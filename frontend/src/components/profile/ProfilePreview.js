import React from "react";
import { Typography, Link, Avatar, Button, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getImageUrl } from "../../../public/lib/imageOperations";

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
    info: {
      display: "flex",
      alignItems: "center",
      margin: "0 auto",
      textAlign: "center",
      justifyContent: "center",
      marginTop: theme.spacing(0.5)
    },
    lowImportanceInfo: {
      color: theme.palette.grey[700],
      fontSize: "12px",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    highImportanceInfo: {
      color: "#000"
    },
    disableHover: {
      "&:hover": {
        textDecoration: "none"
      }
    },
    icon: {
      marginRight: theme.spacing(0.5)
    }
  };
});

export default function ProfilePreview({ profile, allowMessage, showAdditionalInfo }) {
  const classes = useStyles();
  return (
    <div className={classes.avatarWithInfo}>
      <Link href={"/profiles/" + profile.url_slug} className={classes.disableHover}>
        <Avatar
          alt={profile.name}
          size="large"
          src={getImageUrl(profile.image)}
          className={classes.avatar}
        />
        <Typography variant="h6" className={classes.name}>
          {profile.first_name + " " + profile.last_name}
        </Typography>
        {showAdditionalInfo && (
          <div className={classes.additionalInfo}>
            {Object.keys(profile.additionalInfo).map((key, index) => {
              const item = profile.additionalInfo[key];
              return (
                <Typography
                  key={index}
                  className={`${classes.info}
                    ${
                      item.importance === "low"
                        ? classes.lowImportanceInfo
                        : classes.highImportanceInfo
                    }`}
                >
                  {item.icon &&
                    (item.toolTipText ? (
                      <Tooltip className={classes.icon} title={item.toolTipText}>
                        <item.icon name={item.iconName} />
                      </Tooltip>
                    ) : (
                      <item.icon className={classes.icon} name={item.iconName} />
                    ))}
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
            href={"/messageUser/" + profile.url_slug}
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
