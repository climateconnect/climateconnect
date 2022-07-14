import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AutoCompleteSearchBar from "../../../../src/components/search/AutoCompleteSearchBar";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../../../src/components/context/UserContext";
import { Button, IconButton } from "@material-ui/core";
import { apiRequest } from "../../../../public/lib/apiOperations";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import Cookies from "universal-cookie";
import Router from "next/router";

const useStyles = makeStyles((theme) => {
  return {
    buttonBar: {
      marginTop: 20,
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

export default function UserSearchField({ cancelChatSearch, setErrorMessage }) {
  const classes = useStyles();
  const token = new Cookies().get("token");
  const { user, locale } = React.useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [newChatMembers, setNewChatMembers] = React.useState([]);

  const handleAddNewChatMember = (member) => {
    setNewChatMembers([...newChatMembers, member]);
  };

  const getUsersToFilterOut = () => [user, ...newChatMembers];

  const renderSearchOption = (option) => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.first_name + " " + option.last_name}
      </React.Fragment>
    );
  };

  const handleRemoveMember = (member) => {
    setNewChatMembers([...newChatMembers.filter((m) => m.id !== member.id)]);
  };

  const handleStartChat = (e) => {
    e.preventDefault();
    const isGroupchat = newChatMembers.length > 1;
    const urlPostfix = isGroupchat ? "/api/start_group_chat/" : "/api/start_private_chat/";
    if (newChatMembers.length >= 1) {
      const payload = {};
      /*  redundant if block?

      if (isGroupchat) {
        
        if (!groupName) {
          setErrorMessage(
            texts.please_set_a_group_name_if_youre_starting_a_chat_with_more_than_one_member
          );
          return;
        }
        payload.participants = newChatMembers.map((m) => m.id);
        payload.group_chat_name = groupName;
      } else */ {
        payload.profile_url_slug = newChatMembers[0].url_slug;
      }

      apiRequest({
        method: "post",
        url: urlPostfix,
        payload: payload,
        token: token,
        locale: locale,
      })
        .then(async function (response) {
          console.log(response);
          Router.push("/chat/" + response.data.chat_uuid + "/");
        })
        .catch(function (error) {
          console.log(error.response);
          // TODO: Show error message that user cant connect
        });
    } else
      setErrorMessage(
        texts.please_add_a_chat_or_group_that_you_want_to_open_in_the_search_bar_below
      );
  };
  return (
    <>
      <AutoCompleteSearchBar
        label={texts.enter_chat_name_to_open}
        baseUrl={process.env.API_URL + "/api/members/?search="}
        clearOnSelect
        freeSolo
        filterOut={getUsersToFilterOut()}
        onSelect={handleAddNewChatMember}
        renderOption={renderSearchOption}
        getOptionLabel={(option) => option.first_name + " " + option.last_name}
        helperText={texts.type_the_name_of_a_user_or_group_to_open_a_chat_with}
      />
      <form onSubmit={handleStartChat}>
        <div className={classes.newChatParticipantsContainer}>
          {newChatMembers.map((m, index) => (
            <MiniProfilePreview
              key={index}
              profile={m}
              className={classes.miniProfilePreview}
              onDelete={handleRemoveMember}
            />
          ))}
        </div>
        <div className={classes.buttonBar}>
          <Button variant="contained" color="primary" type="submit">
            {texts.open_chat_from_search}
          </Button>
          <Button variant="contained" className={classes.cancelButton} onClick={cancelChatSearch}>
            {texts.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
