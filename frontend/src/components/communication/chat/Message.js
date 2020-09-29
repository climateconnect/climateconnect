import React from "react";
import MessageContent from "./../MessageContent";
import { makeStyles } from "@material-ui/core/styles";
import { getDateTime } from "../../../../public/lib/dateOperations";

const useStyles = makeStyles(theme => ({
  time: {
    fontSize: 10,
    float: "right",
    marginRight: theme.spacing(-3),
    color: theme.palette.secondary.main
  },
  timeContainer: {
    paddingLeft: theme.spacing(4)
  },
  sentTime: {
    color: "#bdb8c7"
  }
}));

export default function Message({ message, classes, chatting_partner }) {
  const ownClasses = useStyles();
  const received = message.sender.url_slug === chatting_partner.url_slug;
  const sent_date = getDateTime(message.sent_at);
  return (
    <div
      className={`${received ? classes.receivedContainer : classes.sentContainer} ${
        classes.messageContainer
      }`}
      id="messageContainer"
    >
      <span
        color={received ? "default" : "primary"}
        className={`${received ? classes.receivedMessage : classes.sentMessage} ${classes.message}`}
      >
        <MessageContent content={message.content} />
        <div className={ownClasses.timeContainer}>
          <div className={`${ownClasses.time} ${!received && ownClasses.sentTime}`}>
            {sent_date}
          </div>
        </div>
      </span>
    </div>
  );
}
