import CommentIcon from "@mui/icons-material/Comment";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import GenericNotification from "./GenericNotification";

function CommentNotification({ link, object_commented_on, comment_text, is_reply, notification }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "notification", locale: locale });
  const primaryText =
    (is_reply ? texts.reply_to_your_comment_on : texts.comment_on) +
    ' "' +
    object_commented_on.name +
    '"';
  return (
    <GenericNotification
      link={link}
      primaryText={primaryText}
      secondaryText={comment_text}
      notificationIcon={{ icon: CommentIcon }}
      notification={notification}
    />
  );
}

export const ProjectCommentNotification = ({ notification }) => {
  const queryString = notification?.hub_url ? `?hub=${notification?.hub_url}` : "";
  return (
    <CommentNotification
      link={"/projects/" + notification.project.url_slug + queryString + "#comments"}
      object_commented_on={notification.project}
      comment_text={notification.project_comment.content}
      is_reply={false}
      notification={notification}
    />
  );
};

export const IdeaCommentNotification = ({ notification }) => {
  return (
    <CommentNotification
      link={`/hubs/${notification.idea.hub_url_slug}?idea=${notification.idea.url_slug}&show_comments=true#ideas`}
      object_commented_on={notification.idea}
      comment_text={notification?.idea_comment?.content}
      is_reply={false}
      notification={notification}
    />
  );
};

export const IdeaCommentReplyNotification = ({ notification }) => {
  return (
    <CommentNotification
      link={`/hubs/${notification.idea.hub_url_slug}?idea=${notification.idea.url_slug}&show_comments=true#ideas`}
      object_commented_on={notification.idea}
      comment_text={notification?.idea_comment?.content}
      is_reply={true}
      notification={notification}
    />
  );
};

export const ProjectCommentReplyNotification = ({ notification }) => {
  const queryString = notification?.hub_url ? `?hub=${notification?.hub_url}` : "";
  return (
    <CommentNotification
      link={"/projects/" + notification.project.url_slug + `${queryString}#comments`}
      object_commented_on={notification.project}
      comment_text={notification?.project_comment?.content}
      is_reply={true}
      notification={notification}
    />
  );
};
