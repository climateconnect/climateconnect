import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core";
import UserContext from "../../context/UserContext";
import ChatHeader from "./ChatHeader";
import ChatContent from "./ChatContent";
import ChatMemberManagementOverlay from "./ChatMemberManagementOverlay";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => {
  return {
    maxWidth: {
      maxWidth: theme.breakpoints.values["md"],
      margin: "0 auto",
    },
    showParticipantsButton: {
      cursor: "pointer",
    },
  };
});

export default function MessagingLayout({
  chatting_partner,
  messages,
  loading,
  sendMessage,
  loadMoreMessages,
  hasMore,
  title,
  isPrivateChat,
  participants,
  setParticipants,
  rolesOptions,
  token,
  chat_uuid,
  chat_id,
  handleChatWindowClose,
}) {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  
  const handleWindowClose = (e) => {
    if(curMessage && curMessage.length > 0){
      e.preventDefault();
      return (e.returnValue = "You have an unsent message. Are you sure you want to leave?.");
    }else
      handleChatWindowClose()
  }

  React.useEffect(() => {
    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  });
  const [curMessage, setCurMessage] = useState("");
  const [showChatParticipants, setShowChatParticipants] = useState(false);
  const [memberManagementExpanded, setMemberManagementExpanded] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [showAlertMessage, setShowAlertMessage] = useState(false);
  const [showSendHelper, setShowSendHelper] = useState(false);
  const user_role = participants.filter((p) => p.id === user.id)[0].role;
  //TODO show user when socket has closed
  const onSendMessage = (event) => {
    sendMessage(curMessage);
    setCurMessage("");
    if (event) event.preventDefault();
  };
  const canEditMembers = user_role.name === "Creator" || user_role.name === "Administrator";

  const handleMessageKeydown = (event) => {
    if (event.key === "Enter")
      if (event.ctrlKey) onSendMessage();
      else {
        setShowSendHelper(true);
      }
  };

  const onCurMessageChange = (event) => {
    setCurMessage(event.target.value);
  };

  const handleToggleMemberManagementExpanded = (msg, severity) => {
    if (msg && severity) {
      setAlertMessage({ message: msg, severity: severity });
      setShowAlertMessage(true);
    }
    setMemberManagementExpanded(!memberManagementExpanded);
  };

  const toggleShowChatParticipants = () => setShowChatParticipants(!showChatParticipants);
  return (
    <>
      <ChatHeader
        isPrivateChat={isPrivateChat}
        chatting_partner={chatting_partner}
        title={title}
        toggleShowChatParticipants={toggleShowChatParticipants}
        showChatParticipants={showChatParticipants}
        className={classes.maxWidth}
        canEditMembers={canEditMembers}
        handleToggleMemberManagementExpanded={handleToggleMemberManagementExpanded}
        memberManagementExpanded={memberManagementExpanded}
      />
      {showAlertMessage && alertMessage && (
        <Alert
          className={classes.alert}
          severity={alertMessage.severity}
          onClose={() => {
            setShowAlertMessage(!showAlertMessage);
          }}
        >
          {alertMessage.message}
        </Alert>
      )}
      {!memberManagementExpanded ? (
        <ChatContent
          showChatParticipants={showChatParticipants}
          participants={participants}
          user_role={user_role}
          messages={messages}
          chatting_partner={chatting_partner}
          hasMore={hasMore}
          loadMoreMessages={loadMoreMessages}
          isPrivateChat={isPrivateChat}
          title={title}
          loading={loading}
          curMessage={curMessage}
          showSendHelper={showSendHelper}
          setShowSendHelper={setShowSendHelper}
          onCurMessageChange={onCurMessageChange}
          handleMessageKeydown={handleMessageKeydown}
          onSendMessage={onSendMessage}
          handleToggleMemberManagementExpanded={handleToggleMemberManagementExpanded}
        />
      ) : (
        <ChatMemberManagementOverlay
          participants={participants}
          user_role={user_role}
          rolesOptions={rolesOptions}
          token={token}
          chat_uuid={chat_uuid}
          chat_id={chat_id}
          toggleMemberManagementExpanded={handleToggleMemberManagementExpanded}
          setParticipants={setParticipants}
        />
      )}
    </>
  );
}
