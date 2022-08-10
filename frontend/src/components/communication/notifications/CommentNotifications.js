import CommentIcon from "@material-ui/icons/Comment";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import GenericNotification from "./GenericNotification";

function CommentNotification({ link, object_commented_on, comment_text, is_reply }) {
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
    />
  );
}

export const ProjectCommentNotification = ({ notification }) => {
  return (
    <CommentNotification
      link={"/projects/" + notification.project.url_slug + "/#comments"}
      object_commented_on={notification.project}
      comment_text={notification.project_comment.content}
      is_reply={false}
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
    />
  );
};

export const ProjectCommentReplyNotification = ({ notification }) => {
  return (
    <CommentNotification
      link={"/projects/" + notification.project.url_slug + "/#comments"}
      object_commented_on={notification.project}
      comment_text={notification?.project_comment?.content}
      is_reply={true}
    />
  );
};
