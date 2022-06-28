import {
  Button,
  Card,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DateDisplay from "../../general/DateDisplay";
import UserContext from "../../context/UserContext";
import getTexts from "../../../../public/texts/texts";
import RichTextEditor from "../../richTextEditor/RichTextEditor";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    background: "#F2F2F2",
  },
  header: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    marginLeft: theme.spacing(1),
  },
  dialogText: {
    textAlign: "center",
    margin: "0 auto",
    display: "block",
  },
  title: {
    fontWeight: "bold",
  },
}));

export default function ProgressPost({ post, project, updateEditingPostId }) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const [postContent, setPostContent] = useState(post.content);
  const onContentChange = (content) => {
    setPostContent(content);
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <Card className={classes.card} raised="true">
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          {post.event_date && (
            <Typography>
              {texts.event_date}
              {<DateDisplay date={new Date(post.event_date)} woTimeAgo />}
            </Typography>
          )}
          <Typography variant="h5" color="primary" className={classes.title}>
            {post.title}
          </Typography>
        </div>
        <div className={classes.headerRight}>
          {/**Placeholder like button */}
          <Button color="primary" variant="contained">
            Like
          </Button>
          <IconButton className={classes.menuButton} onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu open={open} anchorEl={anchorEl} keepMounted onClose={handleMenuClose}>
            <MenuItem onClick={() => updateEditingPostId(post.id)}>{texts.edit}</MenuItem>
            <MenuItem>{texts.delete}</MenuItem>
          </Menu>
        </div>
      </div>
      <RichTextEditor content={postContent} onContentChange={onContentChange} readOnly />
      <Typography variant="caption" color="secondary">
        {texts.this_post_was_created_on}
        <DateDisplay date={new Date(post.created_at)} woTimeAgo />
        {post.updated_at && (
          <>
            {texts.and_updated_on}
            <DateDisplay date={new Date(post.updated_at)} woTimeAgo />
          </>
        )}
        .
      </Typography>
    </Card>
  );
}
