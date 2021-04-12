import { Avatar, Card, CardContent, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import UserContext from "../context/UserContext";
import OrganizationMetaData from "./OrganizationMetadata";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      "&:hover": {
        cursor: "pointer",
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: "inherit",
      borderRadius: 0,
      textAlign: "center",
      height: 250,
    },
    bold: {
      fontWeight: "bold",
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block",
    },
    media: {
      height: 80,
      width: 80,
      backgroundSize: "contain",
      marginTop: theme.spacing(3),
      margin: "0 auto",
    },
    noUnderline: {
      textDecoration: "inherit",
      "&:hover": {
        textDecoration: "inherit",
      },
    },
  };
});

export default function OrganizationPreview({ organization, showOrganizationType }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext)
  return (
    <Link href={getLocalePrefix(locale) + `/organizations/${organization.url_slug}`} className={classes.noUnderline}>
      <Card className={classes.root} variant="outlined">
        <Avatar
          alt={organization.name}
          size="large"
          src={getImageUrl(organization.thumbnail_image)}
          className={classes.media}
          component="div"
        />
        <CardContent>
          <Typography variant="subtitle1" component="h2" className={classes.bold}>
            {organization.name}
          </Typography>
          <OrganizationMetaData
            organization={organization}
            showOrganizationType={showOrganizationType}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
