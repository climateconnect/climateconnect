import { Button, Hidden } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { redirect } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import Router from "next/router";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";
import Cookies from "universal-cookie";
import ContactCreatorButtonInfo from "../communication/contactcreator/ContactCreatorButtonInfo";

const useStyles = makeStyles(() => ({
  root: {
    zIndex: 1,
    position: "fixed",
    bottom: 0,
    right: "10%",
  },
}));

export default function ContactAmbassadorButton({ localAmbassador }) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("token");
  const texts = getTexts({ page: "hub", localAmbassador: localAmbassador, locale: locale });

  const handleClickContact = async (e) => {
    e.preventDefault();

    if (!user) {
      return redirect("/signup", {
        redirect: window.location.pathname + window.location.search,
        errorMessage: texts.please_create_an_account_or_log_in_to_contact_the_ambassador,
      });
    }

    const chat = await startPrivateChat(localAmbassador.user, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };

  return (
    <Hidden xsDown>
      {localAmbassador && (
        <div className={classes.root} onClick={handleClickContact}>
          <ContactCreatorButtonInfo
            creatorName={`${localAmbassador.user?.first_name} ${localAmbassador.user?.last_name}`}
            creatorImageURL={localAmbassador.user?.image}
            creatorsRoleInProject={localAmbassador.title_de}
          />
          <Button variant="contained" color="primary">
            {texts.contact_ambassador}
          </Button>
        </div>
      )}
    </Hidden>
  );
}
