import React from "react";
import { Typography, makeStyles, Button, useMediaQuery } from "@material-ui/core";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import SmallCloud from "../staticpages/SmallCloud";
import OrganizationPreviewsFixed from "../organization/OrganizationPreviewsFixed";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  root: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
    marginTop: theme.spacing(15),
    position: "relative"
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 21
    }
  },
  explainerText: {
    maxWidth: 660,
    marginBottom: theme.spacing(3)
  },
  showProjectsButtonContainer: {
    marginTop: theme.spacing(3)
  },
  showProjectsArrow: {
    marginLeft: theme.spacing(2)
  },
  showProjectsText: {
    textDecoration: "underline"
  },
  smallCloud1: {
    position: "absolute",
    top: -60,
    right: "50%"
  },
  smallCloud2: {
    position: "absolute",
    right: "10%",
    top: -100,
    width: 100,
    height: 80
  }
}));

export default function OrganizationsSharedBox({ organizations }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <div className={classes.root}>
      <SmallCloud type={2} className={classes.smallCloud1} />
      <SmallCloud type={1} className={classes.smallCloud2} reverse />
      <Typography className={classes.headline} component="h1" color="primary">
        Find a climate action organization and get involved
      </Typography>
      <Typography className={classes.explainerText}>
        Find nonprofits, associations, companies, institutes, NGOs, local governments and other
        types of organizations taking climate action!{" "}
        {!isNarrowScreen && (
          <>
            You can directly contact the {"organization's"} representative to exchange knowledge,
            find volunteering opportunities or job opportunites.
          </>
        )}
      </Typography>
      <OrganizationPreviewsFixed organizations={organizations} showOrganizationType />
      <div className={classes.showProjectsButtonContainer}>
        <Button color="inherit" href="/browse#organizations">
          <span className={classes.showProjectsText}>Explore all organizations</span>
          <KeyboardArrowRightIcon className={classes.showProjectsArrow} />
        </Button>
      </div>
    </div>
  );
}
