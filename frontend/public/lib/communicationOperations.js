import { apiRequest } from "./apiOperations";

// Returns the new comments object after adding a comment locally
export function getCommentsObjectAfterAddingComment(c, comments) {
  //If the comment is a reply to a parent comment, just add it to the replies
  if (c.parent_comment_id) {
    const parent_comment = comments.find((pc) => pc.id === c.parent_comment_id);
    const newCurComments = [
      ...comments.filter((c) => c.id !== parent_comment.id),
      { ...parent_comment, replies: [...parent_comment.replies, c] },
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return newCurComments;
  } else {
    //Otherwise add it to the list. Incase the comment is already in the list as an unconfirmed comment, replace it.
    //This happens when the comment got confirmed by the server
    return [
      c,
      ...comments.filter(
        (oc) =>
          !(oc.content === c.content && oc.author_user.id === c.author_user.id && oc.unconfirmed)
      ),
    ];
  }
}

export function getCommentsObjectAfterAddingComments(commentsToAdd, comments) {
  let commentsObject = comments;
  const alreadySentCommentIds = comments.map((c) => c.id);
  const newCommentsToAdd = commentsToAdd.filter(
    (c) => !c.id || !alreadySentCommentIds.includes(c.id)
  );
  //We are sorting the comments that we want to add by id so that parent <-> child relations work out
  //If we don't do that, the child might be initialized before the parent which leads to an error
  const sortedCommentsToAdd = newCommentsToAdd.sort((a, b) => a.id - b.id);
  for (const comment of sortedCommentsToAdd) {
    commentsObject = getCommentsObjectAfterAddingComment(comment, commentsObject);
  }
  return commentsObject;
}

export function parseChats(chats, texts) {
  return chats
    ? chats.map((chat) => ({
        ...chat,
        chatting_partner:
          chat.participants.length === 2 && chat.participants.find((p) => p.id !== chat.user.id),
        unread_count: chat.unread_count,
        content: chat.last_message ? chat.last_message.content : texts.chat_has_been_created,
      }))
    : [];
}

export function parseChatData(chats) {
  return chats.map((c) => ({
    ...c,
    participants: c.participants.map((p) => ({
      ...p.user_profile,
      role: p.role,
      created_at: p.created_at,
    })),
  }));
}

export function getParsedChats(response, texts) {
  const parsedChatData = parseChatData(response.data.results);
  const parsedChats = parseChats(parsedChatData, texts);
  return parsedChats;
}

export async function getResponseFromAPI(locale, token, url) {
  try {
    return await apiRequest({
      method: "get",
      url: url,
      token: token,
      locale: locale,
    });
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}
