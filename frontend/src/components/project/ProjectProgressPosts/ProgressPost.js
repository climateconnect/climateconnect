import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { apiRequest } from "../../../../public/lib/apiOperations";

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

export default function ProgressPost({ post, project, updateEditingPostId, token, refreshPosts }) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const openAlertDialog = () => {
    setDialogOpen(true);
  };
  const closeAlertDialog = () => {
    setDialogOpen(false);
    setAnchorEl(null);
  };
  const handleDelete = async () => {
    console.log("/api/projects/" + project.url_slug + "/delete_post/" + post.id + "/");
    await apiRequest({
      method: "delete",
      url: "/api/projects/" + project.url_slug + "/delete_post/" + post.id + "/",
      token: token,
    })
      .then(() => {
        closeAlertDialog();
        refreshPosts();
      })
      .catch((err) => console.log(err));
  };
  return (
    <>
      <Card className={classes.card} raised="true">
        <div className={classes.header}>
          <div className={classes.headerLeft}>
            {post.event_date && (
              <Typography>
                {texts.event_date}
                {<DateDisplay date={new Date(post.event_date)} withoutTimeAgo />}
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
            <Menu open={menuOpen} anchorEl={anchorEl} keepMounted onClose={handleMenuClose}>
              <MenuItem onClick={() => updateEditingPostId(post.id)}>{texts.edit}</MenuItem>
              <MenuItem onClick={openAlertDialog}>{texts.delete}</MenuItem>
            </Menu>
          </div>
        </div>
        <RichTextEditor content={post.content} readOnly />
        <Typography variant="caption" color="secondary">
          {texts.this_post_was_created_on}
          <DateDisplay date={new Date(post.created_at)} withoutTimeAgo />
          {post.updated_at && (
            <>
              {texts.and_updated_on}
              <DateDisplay date={new Date(post.updated_at)} withoutTimeAgo />
            </>
          )}
          .
        </Typography>
      </Card>
      <Dialog open={dialogOpen}>
        <DialogTitle>{texts.are_you_sure}</DialogTitle>
        <DialogContent>
          <DialogContentText>{texts.do_you_really_want_to_delete_this_post}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="primary">
            {texts.yes}
          </Button>
          <Button onClick={closeAlertDialog} color="primary" autoFocus>
            {texts.no}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
