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
  returnJoinRequestBox: {
    backgroundColor: theme.palette.primary.light,
    marginTop: theme.spacing(.5),
    padding: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  returnLink: {
    color: "#2C3E50",
  },
  userText: {
    fontWeight: "600",
  },
}));

const MessageForProject = ({
  ownClasses,
  classes,
  associatedJoinRequest,
  received,
  getLocalePrefix,
  texts,
}) => {
  return (
    <span className={`${ownClasses.returnJoinRequestBox} ${classes.message}`}>
      <Typography display="inline-block" style={{ alignSelf: "flex-start" }}>
        {associatedJoinRequest?.project_url_slug && received && (
          <a
            href={
              getLocalePrefix +
              `/projects/${associatedJoinRequest?.project_url_slug}?show_join_requests=true`
            }
            className={ownClasses.returnLink}
          >
            {texts.return_to_project_to_approve_or_ignore}
          </a>
        )}
        {!received && (
          <p>
            {texts.this_is_your_message_for_the_request_to_join}{" "}
            <span className={ownClasses.userText}>{associatedJoinRequest?.project_name}</span>{" "}
            {texts.project}
            {". "}
          </p>
        )}
      </Typography>
    </span>
  );
};

export default function Message({ message, associatedJoinRequest, classes, isPrivateChat }) {
  const ownClasses = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const received = message.sender.url_slug !== user?.url_slug;
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
        className={`${
          associatedJoinRequest
            ? classes.receiveMessageFromJoinRequest
            : received
            ? classes.receivedMessage
            : classes.sentMessage
        } ${classes.message}`}
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
        <MessageContent content={message.content} />
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
      {associatedJoinRequest && (
        <MessageForProject
          ownClasses={ownClasses}
          classes={classes}
          associatedJoinRequest={associatedJoinRequest}
          received={received}
          getLocalePrefix={getLocalePrefix(locale)}
          texts={texts}
        />
      )}
    </div>
  );
}
