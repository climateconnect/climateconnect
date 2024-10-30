import { HPlusMobiledata } from "@mui/icons-material";
import { Avatar, Button, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { redirect } from "../../../public/lib/apiOperations";
import React, { useContext } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Cookies from "universal-cookie";
import Router from "next/router";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "white",
    // marginTop: theme.spacing(2),
    marginBottom: "auto",
    marginLeft: "auto",
    maxWidth: 320,
  },
  upperSection: {
    padding: theme.spacing(2),
    background: theme.palette.grey.light,
  },
  lowerSection: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  headline: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  avatar: {
    marginRight: theme.spacing(2),
    width: 65,
    height: 65,
  },
  name: {
    fontWeight: 700,
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

export default function LocalAmbassadorInfoBox({ hubAmbassador, hubData, hubSupportersExists }) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const texts = getTexts({
    page: "hub",
    locale: locale,
    hubAmbassador: hubAmbassador,
    hubName: hubData.name,
  });
  const handleClickContact = async (e) => {
    e.preventDefault();

    if (!user) {
      return redirect("/signup", {
        redirect: window.location.pathname + window.location.search,
        errorMessage: texts.please_create_an_account_or_log_in_to_contact_the_ambassador,
      });
    }

    const chat = await startPrivateChat(hubAmbassador?.user, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  return (
    <div className={classes.root}>
      {!hubSupportersExists && (
        <div className={classes.upperSection}>
          <Typography color="primary" className={classes.headline}>
            {texts.do_you_need_support}
          </Typography>
          <Typography color="secondary">{texts.local_ambassador_is_there_for_you}</Typography>
        </div>
      )}
      <div className={classes.lowerSection}>
        <Avatar
          className={classes.avatar}
          src={getImageUrl(hubAmbassador?.user?.thumbnail_image)}
        />
        <div>
          <Typography className={classes.name} color="secondary">
            {hubAmbassador?.user?.first_name} {hubAmbassador?.user?.last_name}
          </Typography>
          <Typography color="secondary">
            {hubAmbassador?.title} {hubData.name}
          </Typography>
          <Button variant="outlined" className={classes.button} onClick={handleClickContact}>
            {texts.send_message}
          </Button>
        </div>
      </div>
    </div>
  );
}
