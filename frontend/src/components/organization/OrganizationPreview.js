import { Card, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import OrganizationPreviewHeader from "./OrganizationPreviewHeader";
import OrganizationPreviewBody from "./OrganizationPreviewBody";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "grid",
      gridTemplateRows: "min-content",
      "&:hover": {
        cursor: "pointer",
        backgroundColor: "#f1f1f1",
        boxShadow: "rgba(99, 99, 99, 0.33) 0px 2px 8px 0px;",
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: "#f7f7f7",
      backgroundRepeat: "no-repeat",
      backgroundSize: "calc(100% - 1px) 100%",
      borderRadius: "5px",
      textAlign: "center",
      height: "350px",
      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
      padding: "0 12px",
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
  const { locale } = useContext(UserContext);

  return (
    <Link
      href={getLocalePrefix(locale) + `/organizations/${organization.url_slug}`}
      className={classes.noUnderline}
    >
      <Card className={classes.root} variant="outlined">
        <OrganizationPreviewHeader organization={organization} />
        <OrganizationPreviewBody
          organization={organization}
          showOrganizationType={showOrganizationType}
        />
      </Card>
    </Link>
  );
}
