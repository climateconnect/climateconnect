import { Button, Card, IconButton, makeStyles, TextField, Typography } from "@material-ui/core";
import React from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ButtonIcon from "./Buttons/ButtonIcon";

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
  heading: {
    color: theme.palette.primary.main,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
  lessMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  border: {
    borderTop: `1px solid ${theme.palette.grey[500]}`,
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

export default function ProgressPost({ post, locale, texts }) {

  const classes = useStyles();
  
  const DateParser = ({date, locale}) => {
    return new Intl.DateTimeFormat(locale).format(date)
  };
  return (
    <Card className={classes.card} raised="true">
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          
          {post.created_at && <Typography>{DateParser(post.created_at, locale)} ({texts.created_lower_case})</Typography>}
          {post.updated_at && <Typography>{DateParser(post.updated_at, locale)} ({texts.updated})</Typography>}
          {post.event_date && <Typography>{DateParser(post.event_date, locale)} ({texts.event_date})</Typography>}

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
          <IconButton className={classes.menuButton}>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <TextField
        className={classes.textField}
        multiline
        minRows={4}
        maxRows={20}
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
