import React, { useContext } from "react";
import MessageContent from "./../MessageContent";
import { makeStyles } from "@material-ui/core/styles";
import { getDateTime } from "../../../../public/lib/dateOperations";
import UserContext from "../../context/UserContext";
import { Typography, Link, CircularProgress, Tooltip } from "@material-ui/core";

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
  },
  senderName: {
    fontSize: 12
  }
}));

export default function Message({ message, classes, isPrivateChat }) {
  const ownClasses = useStyles();
  const { user } = useContext(UserContext);
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
          <Link href={"/profiles/" + message.sender.url_slug} target="_blank">
            <Typography className={ownClasses.senderName} color="primary" component="span">
              {message.sender.first_name + " " + message.sender.last_name}
            </Typography>
          </Link>
        )}
        <MessageContent content={message.content} />
        <div className={ownClasses.timeContainer}>
          <div className={`${ownClasses.time} ${!received && ownClasses.sentTime}`}>
            {message.unconfirmed && (
              <Tooltip title="sending message...">
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
