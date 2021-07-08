import { Avatar, Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";

import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoginNudge from "../general/LoginNudge";

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

export default function CommentInput({
  user,
  onSendComment,
  parent_comment,
  onCancel,
  hasComments,
}) {
  const classes = useStyles();
  const [curComment, setCurComment] = React.useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });
  const onCurCommentChange = (e) => setCurComment(e.target.value);

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
              placeholder={(hasComments ? texts.write_a_comment : texts.start_a_discussion) + "..."}
              className={classes.messageInput}
              value={curComment}
              onChange={onCurCommentChange}
              onKeyDown={handleMessageKeydown}
              required
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
