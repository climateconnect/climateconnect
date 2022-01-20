import { IconButton, makeStyles, Menu, MenuItem, TextField, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ConfirmDialog from "../../dialogs/ConfirmDialog";
import DateDisplay from "../../general/DateDisplay";
import FeedbackContext from "../../context/FeedbackContext";
import LikeButton from "../Buttons/LikeButton";
import LikesDialog from "../../dialogs/LikesDialog";
import { apiRequest } from "../../../../public/lib/apiOperations";
import ROLE_TYPES from "../../../../public/data/role_types";
import UserContext from "../../context/UserContext";
import getTexts from "../../../../public/texts/texts";

const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
  },
  headerRight: {
    display: "flex",
    alignItems: "flex-start",
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  menuButton: { 
    width: 40,
    height: 40,
    marginLeft: theme.spacing(1),
  },
}));

export default function ProgressPost({
  post,
  displayEditingInterface,
  token,
  refreshCurrentPosts,
  project,
  userPermission,
}) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    post.currentlyUpdating = true;
    displayEditingInterface(true);
  };
  const handleDelete = async () => {
    await apiRequest({
      method: "delete",
      url: "/api/projects/" + project.url_slug + "/delete_post/" + post.id + "/",
      token: token,
    }).then(() => {
      refreshCurrentPosts({
        deletePost: true,
        id: post.id,
      });
    });
  };
  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          {post.created_at && (
            <Typography>
              {<DateDisplay date={new Date(post.created_at)} woTimeAgo />} (
              {texts.created_lower_case})
            </Typography>
          )}
          {post.updated_at && (
            <Typography>
              {<DateDisplay date={new Date(post.updated_at)} woTimeAgo />} ({texts.updated})
            </Typography>
          )}
          {post.event_date && (
            <Typography>
              {<DateDisplay date={new Date(post.event_date)} woTimeAgo />} ({texts.event_date})
            </Typography>
          )}

          <Typography variant="h5" color="primary">
            {post.title}
          </Typography>
        </div>
        <div className={classes.headerRight}>
          <PostLikeButton texts={texts} post={post} token={token} locale={locale} />

          {userPermission &&
            [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(userPermission) && (
              <>
                <IconButton className={classes.menuButton} onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu open={open} anchorEl={anchorEl} keepMounted onClose={handleMenuClose}>
                  <MenuItem onClick={handleEdit}>{texts.edit}</MenuItem>
                  <MenuItem onClick={handleDelete}>{texts.delete}</MenuItem>
                </Menu>
              </>
            )}
        </div>
      </div>
      <TextField
        className={classes.textField}
        multiline
        value={post.content}
        fullWidth={true}
        variant="standard"
        InputProps={{
          disableUnderline: true,
        }}
      />
    </>
  );
}

function PostLikeButton({ texts, post, token, locale }) {

  const classes = useStyles();

  /** Belonging to the LikeButton */
  const [numberOfPostLikes, setNumberOfPostLikes] = useState(post.number_of_likes);
  const [isUserLikingPost, setIsUserLikingPost] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);

  const { showFeedbackMessage } = useContext(FeedbackContext);

  const handleToggleLike = () => {
    if (!token)
      showFeedbackMessage({
        message: <span>{texts.please_log_in_to_like_a_post}</span>,
        error: true,
        promptLogIn: true,
      });
    else if (isUserLikingPost) setConfirmDialogOpen(true);
    else toggleLike();
  };
  const toggleLike = async () => {
    setIsUserLikingPost(isUserLikingPost);
    setPendingLike(true);
    await apiRequest({
      method: "post",
      url: "/api/set_post_like/" + post.id + "/",
      payload: { liking: !isUserLikingPost },
      token: token,
      locale: locale,
    })
      .then(function (response) {
        setIsUserLikingPost(response.data.liking);
        if (response.data.liking) {
          setNumberOfPostLikes(numberOfPostLikes + 1);
        } else {
          setNumberOfPostLikes(numberOfPostLikes - 1);
        }
        setPendingLike(false);
        getLikes();
        showFeedbackMessage({
          message: response.data.message,
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };

  /** Belonging to the LikesDialog */
  const [initiallyCaughtLikes, setInitiallyCaughtLikes] = useState(false);
  const [likes, setLikes] = useState([]);
  const [showLikes, setShowLikes] = useState(false);

  const toggleShowLikes = async () => {
    setShowLikes(!showLikes);
    if (!initiallyCaughtLikes) {
      await getLikes();
      setInitiallyCaughtLikes(true);
    }
  };

  /** Belonging to the ConfirmDialog */
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const onLikeDialogClose = (confirmed) => {
    if (confirmed) toggleLike();
    setConfirmDialogOpen(false);
  };

  /** Belonging to the LikeButton & the ConfirmDialog */
  const getLikes = async () => {
    await apiRequest({
        method: "get",
        url: "/api/post_likes/" + post.id + "/",
        token: token,
        locale: locale,
      }).then(response => {
        setLikes(response.data.results);
      }).catch (error => {
      console.log(error);
      if (error.response && error.response.data) console.log("Error: " + error.response.data.detail);
    });
  };

  /** On the first render: Get information on whether the user is liking the post */
  useEffect(async function () {
    await apiRequest({
      method: "get",
      url: "/api/is_user_liking_post/" + post.id + "/",
      token: token,
      locale: locale,
    })
      .then((response) => {
        setIsUserLikingPost(response.data.is_liking);
      })
      .catch((error) => {
        if (error.response && error.response.data)
          console.log("Error: " + error.response.data.detail);
        return null;
      });
  }, []);

  /** Whenever the button enters or leaves the state 'pendingLike' (a like is currently processed):
  *     Warn the user about possibly losing data when leaving the page 
  */
  useEffect(() => {
    if (pendingLike) {
      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        return (e.returnValue = texts.changes_might_not_be_saved);
      });
    } else {
      window.removeEventListener("beforeunload", null);
    }
  }, [pendingLike]);

  return (
    <>
      <LikeButton
        texts={texts}
        project={post}
        likes={likes}
        numberOfLikes={numberOfPostLikes}
        isUserLiking={isUserLikingPost}
        likingChangePending={pendingLike}
        handleToggleLikeProject={handleToggleLike}
        toggleShowLikes={toggleShowLikes}
        hasAdminPermissions={true}
      />
      <LikesDialog
        open={showLikes}
        loading={!initiallyCaughtLikes}
        likes={likes}
        project={post}
        onClose={toggleShowLikes}
        url={"post/" + post.title + "?show_likes=true"}
        pleaseLogInText={`${texts.please_log_in} ${texts.to_see_this_posts_likes}!`}
        titleText={`${texts.likes_of} ${post.title}`}
        noLikesYetText={texts.this_post_does_not_have_any_likes_yet}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={onLikeDialogClose}
        title={texts.do_you_really_want_to_dislike}
        text={
          <span className={classes.dialogText}>
            {texts.are_you_sure_that_you_want_to_dislike_this_project}
          </span>
        }
        confirmText={texts.yes}
        cancelText={texts.no}
      />
    </>
  );
}
