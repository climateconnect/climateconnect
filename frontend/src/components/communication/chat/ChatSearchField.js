import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button } from "@material-ui/core";
import ApplyFilterSearchBar from "../../search/ApplyFilterSearchBar";

const useStyles = makeStyles((theme) => {
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
    miniProfilePreview: {
      padding: theme.spacing(2),
      display: "inline-flex",
    },
  };
});

export default function ChatSearchField({
  cancelChatSearch,
  applyFilterToChats,
  handleSetIsLoading,
}) {
  const classes = useStyles();
  const { locale } = React.useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });

  return (
    <>
      <ApplyFilterSearchBar
        applyFilter={applyFilterToChats}
        label={texts.enter_chat_name_to_open}
        baseUrl={process.env.API_URL + "/api/chat/?search="}
        freeSolo
        helperText={texts.type_the_name_of_a_user_or_group_to_open_a_chat_with}
        handleSetIsLoading={handleSetIsLoading}
      />

      <div className={classes.buttonBar}>
        <Button variant="contained" className={classes.cancelButton} onClick={cancelChatSearch}>
          {texts.cancel}
        </Button>
      </div>
    </>
  );
}