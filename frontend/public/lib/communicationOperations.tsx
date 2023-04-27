// Returns the new comments object after adding a comment locally
export function getCommentsObjectAfterAddingComment(c, comments) {
  //If the comment is a reply to a parent comment, just add it to the replies
  if (c.parent_comment_id) {
    const parent_comment = comments.find((pc) => pc.id === c.parent_comment_id);
    const newCurComments = [
      ...comments.filter((c) => c.id !== parent_comment.id),
      { ...parent_comment, replies: [...parent_comment.replies, c] },
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
