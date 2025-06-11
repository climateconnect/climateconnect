import { Button, IconButton,Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/router";
import React from "react";

type StyleProps = {
  hubSlug?:string
}
const PRIO1_SLUG = "prio1";

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  button: props => ({
    color: props.hubSlug === PRIO1_SLUG ? theme.palette.background.default : theme.palette.primary.contrastText,
    height: 54,
    [theme.breakpoints.down("sm")]: {
      minWidth: 35,
      maxWidth: 35,
      minHeight: 35,
      maxHeight: 35,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  }),
}));

export default function GoBackFromProjectPageButton({
  texts,
  tinyScreen,
  locale,
  containerClassName,
  hubSlug,
}: any) {
  const classes = useStyles({ hubSlug: hubSlug });

  const router = useRouter();
  const goBack = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hubPage = urlParams.get("hub");
    const hubsLink = "/" + locale + "/hubs/" + hubPage + "/browse";
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
