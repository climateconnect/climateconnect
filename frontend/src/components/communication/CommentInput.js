import { Avatar, Button, IconButton, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import React, { useContext } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoginNudge from "../general/LoginNudge";
import UserMentionableMessageInput from "./UserMentionableMessageInput";

const useStyles = makeStyles((theme) => {
  return {
    flexBox: {
      display: "flex",
      alignItems: "center",
    },
    messageInput: {
      marginLeft: theme.spacing(3),
      flexGrow: 1,
    },
    cancelButton: {
      float: "right",
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    commentButton: {
      float: "right",
      marginTop: theme.spacing(1),
    },
    commentButtonContainer: {
      height: 60,
    },
  };
});

export default function CommentInput({ user, onSendComment, parent_comment, onCancel }) {
  const classes = useStyles();
  const [curComment, setCurComment] = React.useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });

  var autoCompleteEnabled = false;
  var autoCompleteLookupStr = "";
  const onCurCommentChange = (e) => {
    var maybeIsACLookup = e.target.value.split(" ").slice(-1)[0];
    if (maybeIsACLookup.startsWith("@")) {
      autoCompleteEnabled = true;
      autoCompleteLookupStr = maybeIsACLookup.substring(1);

      // auto-complete search bar component
      // AutoCompleteSearchBar
      //
      // should be a drawer pulled out from bottom of text box
    }
    setCurComment(e.target.value);
  };

  const handleMessageKeydown = (event) => {
    if (event.key === "Enter" && event.ctrlKey) handleSendComment(event, curComment);
  };

  const handleSendComment = (event) => {
    if (event) event.preventDefault();
    if (!curComment) alert(texts.your_comment_cannot_be_empty);
    onSendComment(curComment, parent_comment, clearInput);
  };

  const clearInput = () => {
    setCurComment("");
    if (onCancel) onCancel();
  };

  const getUsersToFilerOut = () => {};

  const handleTagUser = () => {};

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

  if (user)
    return (
      <div>
        <form onSubmit={onSendComment}>
          <div className={classes.flexBox}>
            <Avatar src={getImageUrl(user.image)} />
            <TextField
              size="small"
              autoFocus
              multiline
              placeholder={texts.write_a_comment + "..."}
              className={classes.messageInput}
              value={curComment}
              onChange={onCurCommentChange}
              onKeyDown={handleMessageKeydown}
              required
            />
          </div>
          <div>
            <UserMentionableMessageInput
              baseUrl={process.env.API_URL + "/api/members/?search="}
              value={curComment}
              onChange={onCurCommentChange}
              placeholder={texts.write_a_comment + "..."}
            />
          </div>
          <div className={classes.commentButtonContainer}>
            <Button
              color="primary"
              variant="contained"
              className={classes.commentButton}
              onClick={(event) => handleSendComment(event)}
            >
              {texts.send}
            </Button>
            {onCancel && (
              <Button variant="contained" className={classes.cancelButton} onClick={onCancel}>
                {texts.cancel}
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  else return <LoginNudge whatToDo={texts.to_write_a_comment} />;
}
