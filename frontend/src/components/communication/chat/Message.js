import React from "react";
import MessageContent from "./../MessageContent";

export default function Message({ message, classes, chatting_partner }) {
  const received = message.sender.url_slug === chatting_partner.url_slug;
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
        {<MessageContent content={message.content} />}
      </span>
    </div>
  );
}
