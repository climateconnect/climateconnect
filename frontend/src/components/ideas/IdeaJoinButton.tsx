import { Button, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { joinIdeaGroupChat } from "../../../public/lib/messagingOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ButtonLoader from "../general/ButtonLoader";

const useStyles = makeStyles(() => ({
  dialog: {
    maxWidth: 600,
  },
}));

//If we are still loading the current value of `has_joined`, initializing will be true
export default function IdeaJoinButton({ idea, has_joined, chat_uuid, onJoinIdea, initializing }) {
  const classes = useStyles();
  const token = new Cookies().get("auth_token");
  const { locale, user } = useContext(UserContext);
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("lg"));

  const onClickJoinButton = (e) => {
    e.preventDefault();
    if (!user) {
      showFeedbackMessage({
        message: texts.please_sign_up_or_log_in_to_join_an_idea,
        promptLogIn: true,
        newHash: window.location.hash,
        error: true,
      });
    } else {
      setOpen(true);
    }
  };

  const handleClickDialogClose = async (hasConfirmed) => {
    setOpen(false);
    if (hasConfirmed) {
      setLoading(true);
      const response = await joinIdeaGroupChat({ idea: idea, token: token, locale: locale });
      window.open(`/chat/${response.chat_uuid}`, "_blank");
      onJoinIdea({ has_joined: true, chat_uuid: response.chat_uuid });
      showFeedbackMessage({
        message: texts.you_have_successfully_joined_the_idea_click_open_groupchat,
        newHash: window.location.hash,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {has_joined ? (
        <Button color="primary" variant="contained" href={`/chat/${chat_uuid}/`} target="_blank">
          {isMediumScreen ? texts.open_chat : texts.go_to_group_chat}
        </Button>
      ) : (
        <Button color="primary" variant="contained" onClick={onClickJoinButton}>
          {loading || initializing ? <ButtonLoader /> : texts.join_in}
        </Button>
      )}
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
