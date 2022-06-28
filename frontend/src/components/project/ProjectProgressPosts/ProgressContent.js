import { Button, makeStyles, Typography } from "@material-ui/core";
import React, { useContext, useState } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import ProgressPosts from "./ProgressPosts";

const useStyles = makeStyles((theme) => ({
  progressContent: {
    marginTop: theme.spacing(5),
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  newPostButton: {
    marginTop: theme.spacing(1),
    whiteSpace: "nowrap",
  },
}));
export default function ProgressContent({ project }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [posts, setPosts] = useState(project.timeline_posts ? [...project.timeline_posts] : null);
  const [editingPostId, setEditingPostId] = useState(null);
  const newPostTempId = project.timeline_posts ? project.timeline_posts[0].id + 1 : 1;
  const updateEditingPostId = (id) => {
    if (editingPostId === null) {
      setEditingPostId(id);
    }
    if (editingPostId === id) {
      setEditingPostId(null);
    }
  };
  const handleNewPost = () => {
    const newPost = { id: newPostTempId, isNewPost: true };
    posts ? setPosts([newPost, ...posts]) : setPosts(newPost);
    updateEditingPostId(newPostTempId);
  };
  const cancelEditingPost = (id) => {
    if (id === newPostTempId) {
      setPosts(posts.filter((p) => p.id !== newPostTempId));
    }
    updateEditingPostId(id);
  };
  return (
    <>
      <div className={classes.progressHeader}>
        <div>
          <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
            {texts.progress}
          </Typography>
          <Typography variant="body2" fontStyle="italic" fontWeight="bold">
            {texts.follow_the_project_to_be_notified_when_they_make_an_update_post}
          </Typography>
        </div>
        <Button
          className={classes.newPostButton}
          variant="contained"
          color="primary"
          onClick={handleNewPost}
          disabled={editingPostId !== null}
        >
          {texts.new_update}
        </Button>
      </div>
      {project.timeline_posts && project.timeline_posts.length > 0 && (
        <div className={classes.progressContent}>
          <ProgressPosts
            project={project}
            posts={posts}
            editingPostId={editingPostId}
            updateEditingPostId={updateEditingPostId}
            cancelEditingPost={cancelEditingPost}
          />
        </div>
      )}
    </>
  );
}