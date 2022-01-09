import { Button, Card, makeStyles, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { apiRequest } from "../../../../public/lib/apiOperations";

const useStyles = makeStyles((theme) => ({
  card: {
    background: "#F2F2F2",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  editingButtonsContainer: {
    marginBottom: theme.spacing(2),
  },
  containerTop: {
    display: "flex",
    justifyContent: "space-between",
  },
  dateField: {
    minWidth: 140,
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

export default function ProgressPost({
  post,
  locale,
  texts,
  closeNewPost,
  token,
  project,
  refreshCurrentPosts,
}) {
  const classes = useStyles();

  const [eventDate, setEventDate] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const today = new Intl.DateTimeFormat(locale).format(new Date());

  const resetStates = () => {
    setEventDate("");
    setPostTitle("");
    setPostContent("");
  };

  const onEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const onTitleChange = (e) => {
    setPostTitle(e.target.value);
  };

  const onContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const createPost = async () => {
    try {
      const resp = await apiRequest({
        method: "post",
        url: "/api/projects/" + project.url_slug + "/create_post/",
        payload: {
          title: postTitle,
          content: postContent,
          event_date: eventDate ? eventDate : null,
        },
        token: token,
        locale: locale,
      }).then(() => {
        closeNewPost();
        refreshCurrentPosts({
          title: postTitle,
          content: postContent,
          event_date: eventDate ? eventDate : null,
          created_at: today,
        });
        resetStates();
      });
      return resp.data.results;
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    }
  };

  //Interface for editing
  if (post.currentlyEdited) {
    return (
      <Card className={classes.card} raised="true">
        <div className={classes.containerTop}>
          <TextField
            className={classes.textField}
            value={postTitle}
            onChange={onTitleChange}
            variant="outlined"
            InputProps={{
              disableUnderline: true,
            }}
            label={texts.title}
            helperText={texts.add_your_title_here}
            fullWidth={true}
          />
          <TextField
            className={classes.dateField}
            label={texts.event_date_upper_case}
            type="date"
            value={eventDate}
            onChange={onEventDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <TextField
          className={classes.textField}
          multiline
          value={postContent}
          onChange={onContentChange}
          rows={20}
          fullWidth={true}
          variant="outlined"
          InputProps={{
            disableUnderline: true,
          }}
          helperText={post.currentlyEdited ? texts.add_your_text_here : ""}
          label={post.currentlyEdited ? texts.text : ""}
        />

        <div className={classes.editingButtonsContainer}>
          <Button onClick={createPost}>{texts.save}</Button>
          <Button onClick={closeNewPost}>{texts.cancel}</Button>
        </div>
      </Card>
    );
  }
}
