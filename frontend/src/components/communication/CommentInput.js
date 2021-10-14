import { Avatar, Button, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import LoginNudge from "../general/LoginNudge";
import InputWithMentions from "./InputWithMentions";

const useStyles = makeStyles((theme) => {
  return {
    flexBox: {
      display: "flex",
      alignItems: "center",
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
    explanation: {
      float: "left",
      marginLeft: theme.spacing(8.5),
      fontSize: 13,
    },
  };
});

//@infoTextSize possible values: "short", "long", "hidden"
export default function CommentInput({
  user,
  onSendComment,
  parent_comment,
  onCancel,
  hasComments,
  infoTextSize,
}) {
  const classes = useStyles();
  const [curComment, setCurComment] = React.useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const onCurCommentChange = (e) => {
    setCurComment(e.target.value);
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

  //if `infoTextSize` is set, it overrides the screensize-based behavior
  const getInfoText = () => {
    if (!infoTextSize) {
      if (isSmallScreen) return texts.how_to_mention_explainer_text_short;
      else {
        return texts.how_to_mention_explainer_text;
      }
    }
    if (infoTextSize === "short") return texts.how_to_mention_explainer_text_short;
    if (infoTextSize === "hidden") return "";
    return texts.how_to_mention_explainer_text;
  };

  const handleMessageKeydown = (event) => {
    if (event.key === "Enter" && event.ctrlKey) handleSendComment(event, curComment);
  }

  if (user)
    return (
      <div>
        <form onSubmit={onSendComment}>
          <div className={classes.flexBox}>
            <Avatar src={getImageUrl(user.image)} />
            <InputWithMentions
              autoFocus
              multiline
              baseUrl={process.env.API_URL + "/api/members/?search="}
              placeholder={(hasComments ? texts.write_a_comment : texts.start_a_discussion) + "..."}
              className={classes.messageInput}
              value={curComment}
              onChange={onCurCommentChange}
              onKeyDown={handleMessageKeydown}
            />
          </div>
          <div className={classes.commentButtonContainer}>
            <Typography className={classes.explanation}>{getInfoText()}</Typography>
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
