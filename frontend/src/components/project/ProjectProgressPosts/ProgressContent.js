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
  const [posts, setPosts] = useState([...project.timeline_posts]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const newPostTempId = parseInt(project.timeline_posts[0].id) + 1;
  const changeEditingPostId = (id) => {
    if (editingPostId === null) {
      setEditingPostId(id);
      setCreatingPost(true);
    } else if (editingPostId === id) {
        // Add alert that changed content on the currently edited post will be lost
      setEditingPostId(null);
      setCreatingPost(false);
    } else {
      // Add alert that changed content on the currently edited post will be lost
      setEditingPostId(id);
      setCreatingPost(true);
    }
  };
  const handleNewPost = () => {
    setCreatingPost(true);
    setPosts([{ id: newPostTempId, isNewPost: true }, ...posts]);
    changeEditingPostId(newPostTempId);
  };
  const cancelEditingPost = (id) => {
    if (id === newPostTempId) {
        setPosts(posts.filter((p) => p.id !== newPostTempId));
    }
    changeEditingPostId(id);
    setCreatingPost(false);
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
          disabled={creatingPost}
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
            changeEditingPostId={changeEditingPostId}
            cancelEditingPost={cancelEditingPost}
          />
        </div>
      )}
    </>
  );
}
