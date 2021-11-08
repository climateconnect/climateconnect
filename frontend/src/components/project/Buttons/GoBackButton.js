import { Button, IconButton, makeStyles } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import React from "react";
import useElementProps from "../../hooks/useElementProps";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    position: "absolute",
    height: props.tinyScreen ? 0 : props.containerHeight,
    top: props.tinyScreen ? 0 : props.containerTop,
    display: "flex",
    marginLeft: props.tinyScreen ? theme.spacing(1) : theme.spacing(2),
    marginTop: props.tinyScreen ? theme.spacing(1) : 0,
  }),
  button: (props) => ({
    color: "white",
    backgroundColor: props.tinyScreen ? theme.palette.primary.main : "none",
    "&:hover": {
      backgroundColor: props.tinyScreen ? theme.palette.primary.main : "none",
    },
    minWidth: props.tinyScreen ? 35 : "none",
    maxWidth: props.tinyScreen ? 35 : "none",
    minHeight: props.tinyScreen ? 35 : "none",
    maxHeight: props.tinyScreen ? 35 : "none",
  }),
}));

export default function GoBackButton({ texts, hubsSubHeaderRef, screenSize, locale }) {
  const specsSubHeader = useElementProps({ el: hubsSubHeaderRef });
  const classes = useStyles({
    containerHeight: specsSubHeader.height,
    containerTop: -specsSubHeader.height,
    tinyScreen: screenSize.belowTiny,
  });

  const router = useRouter();
  const goBack = () => {
    const hubsLink = "/" + locale + "/hubs/" + window.location.search.substring(1);
    const browseLink = "/" + locale + "/browse";
    if (window.location.search) {
      router.push(hubsLink);
    } else {
      router.push(browseLink);
    }
  };

  if (screenSize.belowTiny)
    return (
      <div className={classes.root}>
        <IconButton onClick={goBack} className={classes.button}>
          <ArrowBackIosIcon fontSize="small" viewBox="-4.5 0 24 24" />
        </IconButton>
      </div>
    );
  else
    return (
      <div className={classes.root}>
        <Button onClick={goBack} className={classes.button} startIcon={<ArrowBackIcon />}>
          {texts.go_back}
        </Button>
      </div>
    );
}
