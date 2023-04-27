import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import LoadingSpinner from "../general/LoadingSpinner";
import OrganizationPreview from "./OrganizationPreview";
//This component is to display a fixed amount of projects without  the option to load more

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  container: {
    overflow: "auto",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      ["&::-webkit-scrollbar"]: {
        display: "block",
        height: 10,
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "#F8F8F8",
        borderRadius: 20,
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,0.8)",
        borderRadius: 20,
      },
    },
  },
  organization: {
    minWidth: 265,
    flex: "1 1 0px",
    display: "inline-block",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("xl")]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  first: {
    marginLeft: 0,
  },
  loadingSpinner: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function OrganizationPreviewsFixed({ organizations, isLoading }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {isLoading ? (
          <LoadingSpinner className={classes.loadingSpinner} />
        ) : (
          <>
            {organizations.map((organization, index) => {
              return (
                <span
                  className={`${classes.organization} ${index === 0 && classes.first}`}
                  key={organization.url_slug}
                >
                  <OrganizationPreview organization={organization} />
                </span>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
