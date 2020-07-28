import React from "react";
import OrganizationMetaData from "./OrganizationMetadata";
import { Typography, Card, CardContent, Link, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles(theme => {
  return {
    root: {
      "&:hover": {
        cursor: "pointer"
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: "inherit",
      borderRadius: 0,
      textAlign: "center"
    },
    bold: {
      fontWeight: "bold"
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block"
    },
    media: {
      height: 80,
      width: 80,
      backgroundSize: "contain",
      marginTop: theme.spacing(3),
      margin: "0 auto"
    },
    noUnderline: {
      textDecoration: "inherit",
      "&:hover": {
        textDecoration: "inherit"
      }
    }
  };
});

export default function OrganizationPreview({ organization, showMembers, showOrganizationType }) {
  const classes = useStyles();
  return (
    <Link href={`/organizations/${organization.url_slug}`} className={classes.noUnderline}>
      <Card className={classes.root} variant="outlined">
        <Avatar
          alt={organization.name}
          size="large"
          src={getImageUrl(organization.image)}
          className={classes.media}
          component="div"
        />
        <CardContent>
          <Typography variant="subtitle1" component="h2" className={classes.bold}>
            {organization.name}
          </Typography>
          <OrganizationMetaData
            organization={organization}
            showMembers={showMembers}
            showOrganizationType={showOrganizationType}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
