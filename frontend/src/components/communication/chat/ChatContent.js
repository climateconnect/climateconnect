import React, { useContext } from "react";
import MiniProfilePreview from "../../profile/MiniProfilePreview";
import { Button, IconButton, TextField, makeStyles, Tooltip } from "@material-ui/core";
import Messages from "./Messages";
import UserContext from "../../context/UserContext";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import SendIcon from "@material-ui/icons/Send";

const useStyles = makeStyles((theme) => ({
  chatParticipantsContainer: {
    background: theme.palette.grey[200],
    width: "100%",
    paddingBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: 960,
    margin: "0 auto",
  },
  chatParticipantsPreview: {
    padding: theme.spacing(1),
  },
  content: {
    flex: "auto",
    overflowY: "auto",
    width: "100%",
  },
  maxWidth: {
    maxWidth: theme.breakpoints.values["md"],
    margin: "0 auto",
  },
  bottomBar: {
    background: theme.palette.grey[200],
    flex: "none",
    width: "100%",
  },
  sendMessageBarContent: {
    padding: theme.spacing(1),
  },
  messageInput: {
    width: "calc(100% - 60px)",
    border: 0,
  },
  sendButton: {
    height: 40,
    width: 40,
    marginLeft: theme.spacing(2),
  },
  sendButtonIcon: {
    height: 35,
    width: 35,
  },
}));

export default function ChatContent({
  showChatParticipants,
  participants,
  user_role,
  messages,
  chatting_partner,
  hasMore,
  loadMoreMessages,
  isPrivateChat,
  title,
  loading,
  curMessage,
  onCurMessageChange,
  handleMessageKeydown,
  onSendMessage,
  handleToggleMemberManagementExpanded,
  showSendHelper,
  setShowSendHelper,
}) {
  const classes = useStyles();
  const { user } = useContext(UserContext);

  const handleOpen = () => {
    setShowSendHelper(true);
  };
  const handleClose = () => {
    setShowSendHelper(false);
  };

  return (
    <>
      {showChatParticipants && (
        <div className={classes.chatParticipantsContainer}>
          {participants
            .filter((p) => p.id !== user.id)
            .map((p, index) => {
              return (
                <MiniProfilePreview
                  key={index}
                  profile={p}
                  className={classes.chatParticipantsPreview}
                />
              );
            })}
          {user_role.name === "Creator" && (
            <Button
              className={classes.manageMembersButton}
              startIcon={<GroupAddIcon />}
              onClick={handleToggleMemberManagementExpanded}
            >
              Manage
            </Button>
          )}
        </div>
      )}
      {loading ? (
        <div>Loading</div>
      ) : (
        <Messages
          messages={messages}
          chatting_partner={chatting_partner}
          className={`${classes.content} ${classes.maxWidth}`}
          hasMore={hasMore}
          loadFunc={loadMoreMessages}
          isPrivateChat={isPrivateChat}
          title={title}
        />
      )}
      <div className={`${classes.bottomBar} ${classes.maxWidth}`}>
        <form className={classes.sendMessageBarContent} onSubmit={onSendMessage}>
          <TextField
            variant="outlined"
            size="small"
            autoFocus
            multiline
            placeholder="Message"
            className={classes.messageInput}
            value={curMessage}
            onChange={onCurMessageChange}
            onKeyDown={handleMessageKeydown}
          />
          <Tooltip
            open={showSendHelper}
            onClose={handleClose}
            onOpen={handleOpen}
            arrow
            title="Click here to send (or press ctrl + Enter)"
            placement="top"
          >
            <IconButton
              disableRipple
              disableFocusRipple
              size="small"
              type="submit"
              className={classes.sendButton}
              style={{ backgroundColor: "transparent" }}
            >
              <SendIcon className={classes.sendButtonIcon} />
            </IconButton>
          </Tooltip>
        </form>
      </div>
    </>
  );
}
