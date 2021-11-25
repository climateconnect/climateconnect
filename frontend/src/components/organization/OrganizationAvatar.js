import { Avatar, Chip, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: props.inlineVersionOnMobile ? "row" : "column",
    },
  }),
  avatar: (props) => ({
    width: 120,
    height: 120,
    [theme.breakpoints.down("xs")]: {
      marginRight: props.inlineVersionOnMobile && theme.spacing(2),
    },
    ["@media(max-width: 500px)"]: {
      width: props.inlineVersionOnMobile ? 90 : 120,
      height: props.inlineVersionOnMobile ? 90 : 120,
    },
  }),
  chip: (props) => ({
    borderRadius: 100,
    width: 145,
    marginTop: theme.spacing(-3),
    zIndex: 1,
    [theme.breakpoints.down("xs")]: {
      marginTop: props.inlineVersionOnMobile ? 0 : theme.spacing(-3),
    },
  }),
  inlineRightContainer: {
    display: "flex",
    flexDirection: "column",
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: 700,
  },
}));

export default function OrganizationAvatar({ organization, inlineVersionOnMobile }) {
  const classes = useStyles({ inlineVersionOnMobile: inlineVersionOnMobile });
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const type = organization?.types[0]?.organization_tag;
  return (
    <div className={classes.root}>
      <Avatar size="large" src={getImageUrl(organization.image)} className={classes.avatar} />
      {inlineVersionOnMobile && isNarrowScreen ? (
        <div className={classes.inlineRightContainer}>
          <Typography component="h2" color="secondary" className={classes.suggestionTitle}>
            {organization.name}
          </Typography>
          <Chip color="primary" size="small" label={type?.name} className={classes.chip} />
        </div>
      ) : (
        <Chip color="primary" size="small" label={type?.name} className={classes.chip} />
      )}
    </div>
  );
}
