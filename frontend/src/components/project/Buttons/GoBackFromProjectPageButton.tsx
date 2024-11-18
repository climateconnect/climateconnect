import { Button, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/router";
import React from "react";
import {buildHubUrl} from "../../../../public/lib/urlBuilder";

const useStyles = makeStyles((theme) => ({
  button: {
    color: "white",
    [theme.breakpoints.down("sm")]: {
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

export default function GoBackFromProjectPageButton({
  texts,
  tinyScreen,
  locale,
  containerClassName,
}: any) {
  const classes = useStyles();

  const router = useRouter();
  const goBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubPage = urlParams.get("hubPage");
    // const hubsLink = "/" + locale + "/hubs/" + hubPage;
    const hubsLink = buildHubUrl({hubUrlSlug: hubPage, locale: locale, pathType: "hubBrowse" })
    const browseLink = "/" + locale + "/browse";
    if (hubPage) {
      router.push(hubsLink);
    } else {
      router.push(browseLink);
    }
  };

  if (tinyScreen)
    return (
      <div className={containerClassName}>
        <IconButton onClick={goBack} className={classes.button} size="large">
          {/*adjusted viewBox to center the icon*/}
          <ArrowBackIosIcon fontSize="small" viewBox="-4.5 0 24 24" />
        </IconButton>
      </div>
    );
  else
    return (
      <div className={containerClassName}>
        <Button onClick={goBack} className={classes.button} startIcon={<ArrowBackIcon />}>
          {texts.go_back}
        </Button>
      </div>
    );
}
