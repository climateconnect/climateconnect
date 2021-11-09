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
  button: {
    color: "white",
    [theme.breakpoints.down("xs")]: {
      minWidth: 35, 
      maxWidth: 35, 
      minHeight: 35, 
      maxHeight: 35,
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}));

export default function GoBackButton({ texts, hubsSubHeaderRef, tinyScreen, locale }) {
  const specsSubHeader = useElementProps({ el: hubsSubHeaderRef });
  const classes = useStyles({
    containerHeight: specsSubHeader.height,
    containerTop: -specsSubHeader.height,
    tinyScreen: tinyScreen,
  });

  const router = useRouter();
  const goBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubPage = urlParams.get("hubPage");
    const hubsLink = "/" + locale + "/hubs/" + hubPage;
    const browseLink = "/" + locale + "/browse";
    if (hubPage) {
      router.push(hubsLink);
    } else {
      router.push(browseLink);
    }
  };

  if (tinyScreen)
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
