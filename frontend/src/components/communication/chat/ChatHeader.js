import { IconButton, Link, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import ChatTitle from "../../communication/chat/ChatTitle";
import UserContext from "../../context/UserContext";
import MiniProfilePreview from "../../profile/MiniProfilePreview";

const useStyles = makeStyles((theme) => ({
  topBar: {
    textAlign: "center",
    padding: theme.spacing(1),
    background: theme.palette.grey[200],
    width: "100%",
    flex: "none",
  },
  backIcon: {
    float: "left",
    left: theme.spacing(1),
    top: theme.spacing(0.75),
  },
  manageMembersButton: {
    float: "right",
    right: theme.spacing(1),
    top: theme.spacing(0.75),
  },
  showParticipantsButton: {
    cursor: "pointer",
    userSelect: "none",
  },
}));

export default function ChatHeader({
  isPrivateChat,
  chatting_partner,
  title,
  toggleShowChatParticipants,
  showChatParticipants,
  className,
  canEditMembers,
  handleToggleMemberManagementExpanded,
  memberManagementExpanded,
  leaveChat,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  return (
    <div className={`${classes.topBar} ${className}`}>
      {!memberManagementExpanded && (
        <Tooltip title={texts.back_to_inbox}>
          <IconButton className={classes.backIcon} href={getLocalePrefix(locale) + "/inbox"}>
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Tooltip>
      )}
      {!isPrivateChat && (
        <Tooltip title={texts.leave_group_chat}>
          <IconButton className={classes.manageMembersButton} onClick={leaveChat}>
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      )}
      {!isPrivateChat && !showChatParticipants && canEditMembers && !memberManagementExpanded && (
        <Tooltip title={texts.manage_chat_members}>
          <IconButton
            className={classes.manageMembersButton}
            onClick={handleToggleMemberManagementExpanded}
          >
            <GroupAddIcon />
          </IconButton>
        </Tooltip>
      )}
      {isPrivateChat ? (
        <MiniProfilePreview profile={chatting_partner} />
      ) : (
        <div>
          <ChatTitle chat={{ name: title }} />
          <div>
            <Link
              underline="always"
              onClick={toggleShowChatParticipants}
              className={classes.showParticipantsButton}
            >
              {showChatParticipants ? texts.hide_chat_participants : texts.show_chat_participants}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
