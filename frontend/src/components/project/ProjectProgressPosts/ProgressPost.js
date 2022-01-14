import {
  Button,
  Card,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ButtonIcon from "../Buttons/ButtonIcon";
import DateDisplay from "../../general/DateDisplay";
import { apiRequest } from "../../../../public/lib/apiOperations";
import ROLE_TYPES from "../../../../public/data/role_types";
import UserContext from "../../context/UserContext";
import getTexts from "../../../../public/texts/texts";

const useStyles = makeStyles((theme) => ({
  header: {
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
  likeButton: {
    height: 35,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  menuButton: {
    width: 35,
    height: 35,
    margin: theme.spacing(1),
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
          {/*Button: Placeholder for LikeButton Component */}

          <Button
            className={classes.likeButton}
            variant="contained"
            color="primary"
            startIcon={<ButtonIcon icon="like" size={25} color="white" />}
          >
            Like • 12
          </Button>
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
