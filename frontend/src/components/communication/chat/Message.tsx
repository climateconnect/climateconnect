import { CircularProgress, Link, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getDateTime } from "../../../../public/lib/dateOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import MessageContent from "./../MessageContent";

const useStyles = makeStyles((theme) => ({
  time: {
    fontSize: 10,
    float: "right",
    marginRight: theme.spacing(-3),
    color: theme.palette.secondary.main,
  },
  timeContainer: {
    paddingLeft: theme.spacing(4),
  },
  sentTime: {
    color: "#bdb8c7",
  },
  senderName: {
    fontSize: 12,
  },
}));

export default function Message({ message, classes, isPrivateChat }) {
  const ownClasses = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const received = message.sender.url_slug !== user.url_slug;
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
        {received && !isPrivateChat && (
          <Link
            href={getLocalePrefix(locale) + "/profiles/" + message.sender.url_slug}
            target="_blank"
            underline="hover"
          >
            <Typography className={ownClasses.senderName} color="primary" component="span">
              {message.sender.first_name + " " + message.sender.last_name}
            </Typography>
          </Link>
        )}
        <MessageContent content={message.content} received={received} />
        <div className={ownClasses.timeContainer}>
          <div className={`${ownClasses.time} ${!received && ownClasses.sentTime}`}>
            {message.unconfirmed && (
              <Tooltip title={texts.sending_message + "..."}>
                <CircularProgress size={10} color="inherit" className={classes.loader} />
              </Tooltip>
            )}
            {sent_date}
          </div>
        </div>
      </span>
    </div>
  );
}
