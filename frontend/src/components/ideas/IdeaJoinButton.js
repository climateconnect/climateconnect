import { Button, makeStyles, useMediaQuery } from "@material-ui/core";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { joinIdeaGroupChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";

const useStyles = makeStyles(() => ({
  dialog: {
    maxWidth: 600
  }
}));

export default function IdeaJoinButton({idea, has_joined, chat_uuid}) {
  const classes = useStyles();
  const token = new Cookies().get("token")
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const [open, setOpen] = useState(false)
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"))
  
  const onClickJoinButton = (e) => {
    e.preventDefault();
    setOpen(true)
  };

  const handleClickDialogClose = async (hasConfirmed) => {
    setOpen(false)
    if(hasConfirmed) {
      const response = await joinIdeaGroupChat({idea: idea, token: token, locale: locale})
      window.open(`/chat/${response.chat_uuid}`, '_blank');
    }
  }

  return (
    <>
      {
        has_joined ? 
          <Button color="primary" variant="contained" href={`/chat/${chat_uuid}/`} target="_blank">
            {isMediumScreen ? texts.open_chat : texts.go_to_group_chat}
          </Button>
        :
          <Button color="primary" variant="contained" onClick={onClickJoinButton}>
            {texts.join_in}
          </Button>
      }
      <ConfirmDialog 
        open={open} 
        onClose={handleClickDialogClose}
        cancelText={texts.no}
        confirmText={texts.yes}
        text={texts.do_you_want_to_join_text}
        title={texts.do_you_want_to_join}
        className={classes.dialog}
      />
    </>
  );
}
