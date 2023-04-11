import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import LoadingSpinner from "../general/LoadingSpinner";
import HubPreview from "../hub/HubPreview";
import ProjectPreview from "../project/ProjectPreview";
//This component is to display a fixed amount of projects without  the option to load more

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
  },
  container: {
    whiteSpace: "nowrap",
    overflow: "auto",
    display: "flex",
    justifyContent: "space-between",
    minWidth: "100%",
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
    [theme.breakpoints.down("lg")]: {
      display: "block",
      minWidth: 0,
    },
  },
  project: {
    width: 300,
    display: "inline-block",
    whiteSpace: "normal",
    [theme.breakpoints.down("xl")]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    [theme.breakpoints.down("lg")]: {
      width: 268,
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
  firstProject: {
    marginLeft: 0,
  },
  lastProject: {
    marginRight: 0,
  },
  loadingSpinner: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function FixedPreviewCards({ elements, type, isLoading }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {isLoading ? (
          <LoadingSpinner className={classes.loadingSpinner} />
        ) : (
          <>
            {elements.map((e, index) => (
              <span
                className={`${classes.project} ${index === 0 && classes.firstProject} ${
                  index === elements.length - 1 && classes.lastProject
                }`}
                key={e.url_slug}
              >
                {type === "project" ? (
                  <ProjectPreview project={e} />
                ) : (
                  type === "hub" && <HubPreview hub={e} disableBoxShadow />
                )}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
