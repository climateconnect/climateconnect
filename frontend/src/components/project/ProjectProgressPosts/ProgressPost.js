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
import React, { useState } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ButtonIcon from "../Buttons/ButtonIcon";
import DateDisplay from "../../general/DateDisplay";

const useStyles = makeStyles((theme) => ({
  card: {
    background: "#F2F2F2",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
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

export default function ProgressPost({ post, texts }) {
  const classes = useStyles();

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

          <IconButton className={classes.menuButton} onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu open={open} anchorEl={anchorEl} keepMounted onClose={handleMenuClose}>
            <MenuItem>{texts.edit}</MenuItem>
            <MenuItem>{texts.delete}</MenuItem>
          </Menu>
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
    </Card>
  );
}
