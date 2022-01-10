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
  displayEditingInterface,
}) {
  const classes = useStyles();

  const [eventDate, setEventDate] = useState(post.event_date ? post.event_date : "");
  const [postTitle, setPostTitle] = useState(post.title ? post.title : "");
  const [postContent, setPostContent] = useState(post.content ? post.content : "");
  const today = new Intl.DateTimeFormat(locale).format(new Date());

  const onEventDateChange = (e) => {
    setEventDate(e.target.value);
  };

  const onTitleChange = (e) => {
    setPostTitle(e.target.value);
  };

  const onContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const createData = {
    title: postTitle,
    content: postContent,
    event_date: eventDate ? eventDate : null,
  };
  const refreshData = {
    ...createData,
    created_at: post.created_at ? post.created_at : today,
    updated_at: post.currentlyUpdated ? today : post.updated_at ? post.updated_at : null,
  };
  const createPost = async () => {
    await apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/create_post/",
      payload: createData,
      token: token,
      locale: locale,
    }).then((response) => {
      console.log(response.data.id);
      refreshCurrentPosts({
        id: response.data.id,
        ...refreshData,
      });
    });
  };

  const handleCancel = () => {
    if (post.currentlyEdited) {
      closeNewPost();
    } else if (post.currentlyUpdated) {
      post.currentlyUpdated = false;
      displayEditingInterface(false);
    }
  };

  const handleSave = () => {
    if (post.currentlyEdited) {
      createPost();
      post.currentlyEdited = false;
      displayEditingInterface(false);
    } else if (post.currentlyUpdated) {
      //updatePost();
      post.currentlyUpdated = false;
      displayEditingInterface(false);
    }
  };

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
        <Button onClick={handleSave}>{texts.save}</Button>
        <Button onClick={handleCancel}>{texts.cancel}</Button>
      </div>
    </Card>
  );
}
