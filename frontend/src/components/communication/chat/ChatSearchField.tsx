import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button } from "@mui/material";
import ApplyFilterSearchBar from "../../search/ApplyFilterSearchBar";

const useStyles = makeStyles(() => {
  return {
    buttonBar: {
      marginTop: 20,
      marginBottom: 10,
      position: "relative",
      height: 40,
    },
    cancelButton: {
      position: "absolute",
      right: 0,
    },
  };
});

export default function ChatSearchField({ cancelChatSearch, applyFilterToChats }) {
  const classes = useStyles();
  const { locale } = React.useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });

  return (
    <>
      <ApplyFilterSearchBar
        applyFilterToChats={applyFilterToChats}
        label={texts.enter_chat_name_to_open}
        freeSolo
        helperText={texts.type_the_name_of_a_user_or_group_to_open_a_chat_with}
      />

      <div className={classes.buttonBar}>
        <Button variant="contained" className={classes.cancelButton} onClick={cancelChatSearch}>
          {texts.cancel}
        </Button>
      </div>
    </>
  );
}
