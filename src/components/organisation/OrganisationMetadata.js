import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import GroupIcon from "@material-ui/icons/Group";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "left",
      paddingLeft: theme.spacing(3)
    },
    orgLogo: {
      height: "0.9rem",
      marginBottom: -2
    },
    cardIconBox: {
      width: 40,
      display: "inline-block",
      [theme.breakpoints.down("xs")]: {
        display: "none"
      }
    },
    cardIcon: {
      verticalAlign: "bottom",
      marginBottom: -2,
      marginTop: 2
    },
    textContent: {
      textOverflow: "hidden"
    }
  };
});

export default function OrganisationMetaData({ organisation }) {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.textContent}>
        <span className={classes.cardIconBox}>
          <PlaceIcon className={classes.cardIcon} />
        </span>
        {organisation.location}
      </Box>
      <Box>
        <span className={classes.cardIconBox}>
          <GroupIcon className={classes.cardIcon} />
        </span>
        <span className={classes.textContent}>{organisation.members.length} members</span>
      </Box>
    </Box>
  );
}
