import React, { useContext } from "react";
import { Link, Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getDateTime } from "../../../../public/lib/dateOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import MessageContent from "./../MessageContent";
import TimeContainer from "./TimeContainer";
import { apiRequest } from "../../../../public/lib/apiOperations";
import FeedbackContext from "../../context/FeedbackContext";
import Cookies from "universal-cookie";

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
  projectMessage: {
    fontSize: 12,
    marginTop: "5px",
    marginBottom: "22px",
  },
  userMessage: {
    color: "white",
  },
  returnJoinRequestBox: {
    backgroundColor: theme.palette.primary.light,
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  returnLink: {
    color: "#2C3E50",
  },
  userText: {
    fontWeight: "600",
  },
  buttonContainer: {
    margin: "25px 0 10px 0",
  },
  submitBtn: {
    margin: "0 5px 0 5px",
  },
  ignoreBtn: {
    border: "1px solid #707070",
    color: "#484848",
    paddingTop: "6px",
    paddingBottom: "6px"
  },
  approveText: {
    color: "#207178",
  },
  ignoreText: {
    color: "#484848",
  },
  pendingText: {
    color: "#F8F8F8",
    lineHeight: "3"
  },
  projectRecivedMessage: {
    backgroundColor: "white",
    border: "1px solid #707070",
    padding: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  projectSentMessage: {
    backgroundColor: "#66BCB5",
    padding: theme.spacing(1),
    color: "white",
    textAlign: "left",
    paddingRight: theme.spacing(4),
  },
  chatClarification: {
    margin: "2px 0"
  }
}));

const JoinProjectMessage = ({
  ownClasses,
  isPrivateChat,
  locale,
  message,
  sentDate,
  associatedJoinRequest,
  received,
  texts,
}) => {
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const notificationText = getTexts({ page: "project", locale: locale });
  const [approveRequest, setApproveRequest] = React.useState<string | null>(null);
  const cookies = new Cookies();
  const token = cookies.get("auth_token");

  async function handleRequest(approve: boolean): Promise<void> {
    const url = `/api/projects/${associatedJoinRequest.project_url_slug}/request_membership/${
      approve ? "approve" : "reject"
    }/${associatedJoinRequest.requestId}/`;
    try {
      await apiRequest({
        method: "post",
        url: url,
        locale: locale,
        headers: {
          Authorization: `Token ${token}`,
        },
        payload: {},
      });

      if (approve) setApproveRequest("approve");
      else setApproveRequest("ignore");

      showFeedbackMessage({
        message: approve
          ? notificationText.requester_accepted_successfully
          : notificationText.requester_ignored_successfully,
        success: true,
      });
    } catch (e) {
      if (e.response.status === 401) {
        showFeedbackMessage({
          message: texts.no_permission,
          error: true,
        });
      }
      console.log(e);
    }
  }
  return (
    <>
      {received && !isPrivateChat && (
        <Typography className={ownClasses.projectMessage} color="primary" component="p">
          {texts.this_message_is_part_of_users_request +
            message.sender.first_name +
            " " +
            message.sender.last_name +
            " " +
            texts.request_to_join_your_project}
          <a href={"/projects/" + associatedJoinRequest?.project_url_slug}>
            {` "`}
            {associatedJoinRequest?.project_name}
            {`". `}
          </a>
          <p className={ownClasses.chatClarification}>{texts.if_you_are_not_sure_answer_here_in_the_chat}</p>
        </Typography>
      )}
      {!received && (
        <Typography className={ownClasses.projectMessage} color="#207178" component="p">
          {texts.this_message_is_part_of_users_request + texts.user_request_to_join_project}
          <a href={"/projects/" + associatedJoinRequest?.project_url_slug}>
            {` "`}
            {associatedJoinRequest?.project_name}
            {`" `}
          </a>
          {texts.project}
        </Typography>
      )}
      <MessageContent
        content={message.content}
        associatedJoinRequest={associatedJoinRequest}
        sentDate={sentDate}
        received={received}
        unconfirmed={message.unconfirmed}
      />
      {received && (
        <div className={ownClasses.buttonContainer}>
          {approveRequest == "approve" && (
            <span className={ownClasses.approveText}>{texts.request_accepted}</span>
          )}
          {approveRequest == "ignore" && (
            <span className={ownClasses.ignoreText}>{texts.request_declined}</span>
          )}
          {approveRequest == null && (
            <>
              <Button
                className={ownClasses.ignoreBtn}
                variant="outlined"
                onClick={() => handleRequest(false)}
              >
                {texts.ignore}
              </Button>
              <Button
                className={ownClasses.submitBtn}
                variant="contained"
                color="primary"
                onClick={() => handleRequest(true)}
              >
                {texts.accept}
              </Button>
            </>
          )}
        </div>
      )}
      {!received && approveRequest == null && (
        <span className={ownClasses.pendingText}>{texts.answer_pending}</span>
      )}
    </>
  );
};

const OtherTypeMessage = ({
  received,
  isPrivateChat,
  getLocalePrefix,
  message,
  ownClasses,
  sentDate,
}) => {
  return (
    <>
      {received && !isPrivateChat && (
        <Link
          href={getLocalePrefix + "/profiles/" + message?.sender?.url_slug}
          target="_blank"
          underline="hover"
        >
          <Typography className={ownClasses.senderName} color="primary" component="span">
            {message?.sender?.first_name + " " + message?.sender?.last_name}
          </Typography>
        </Link>
      )}
      <MessageContent content={message.content} />
      <TimeContainer received={received} unconfirmed={message?.unconfirmed} sentDate={sentDate} />
    </>
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
          !associatedJoinRequest
            ? received
              ? classes.receivedMessage
              : classes.sentMessage
            : received
            ? ownClasses.projectRecivedMessage
            : ownClasses.projectSentMessage
        } ${classes.message}`}
      >
        {!associatedJoinRequest && (
          <OtherTypeMessage
            received={received}
            isPrivateChat={isPrivateChat}
            getLocalePrefix={getLocalePrefix(locale)}
            message={message}
            ownClasses={ownClasses}
            sentDate={sent_date}
          />
        )}
        {associatedJoinRequest && (
          <JoinProjectMessage
            received={received}
            isPrivateChat={isPrivateChat}
            locale={locale}
            message={message}
            ownClasses={ownClasses}
            texts={texts}
            sentDate={sent_date}
            associatedJoinRequest={associatedJoinRequest}
          />
        )}
      </span>
    </div>
  );
}
