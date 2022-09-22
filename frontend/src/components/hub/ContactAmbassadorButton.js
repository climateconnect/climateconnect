import { Button, Hidden, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { redirect } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import Router from "next/router";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";
import Cookies from "universal-cookie";
import ContactCreatorButtonInfo from "../communication/contactcreator/ContactCreatorButtonInfo";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 10,
    position: "fixed",
    bottom: 0,
    right: "1%",
    display: "flex",
    flexDirection: "column",
    maxWidth: 300
  },
}));

export default function ContactAmbassadorButton({ hubAmbassador }) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("token");
  const texts = getTexts({ page: "hub", hubAmbassador: hubAmbassador, locale: locale });

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
    <Hidden xsDown>
      {hubAmbassador && (
        <div className={classes.root} onClick={handleClickContact}>
          <ContactCreatorButtonInfo
            creatorName={`${hubAmbassador?.user?.first_name} ${hubAmbassador?.user?.last_name}`}
            creatorImageURL={getImageUrl(hubAmbassador?.user?.thumbnail_image)}
            creatorsRoleInProject={hubAmbassador.title_de}
            customMessage={hubAmbassador.custom_message}
          />
          <Button variant="contained" color="primary">
            {texts.contact_ambassador}
          </Button>
        </div>
      )}
    </Hidden>
  );
}
