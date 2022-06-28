import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  TextField,
} from "@material-ui/core";
import React, { useContext, useState } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import RichTextEditor from "../../richTextEditor/RichTextEditor";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    background: "#F2F2F2",
  },
  titleAndDateFieldContainer: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  titleField: {
    marginRight: theme.spacing(2),
    background: "#F8F8F8",
  },
  dateField: {
    minWidth: 180,
    background: "#F8F8F8",
  },
  saveAndCancelButtonContainer: {
    marginTop: theme.spacing(2),
  },
  saveButton: {
    marginRight: theme.spacing(2),
    background: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    color: "#F8F8F8",
    "&:hover": {
      background: theme.palette.primary.dark,
      border: `1px solid ${theme.palette.primary.dark}`,
    },
  },
  cancelButton: {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
}));

export default function ProgressPost({ post, project, cancelEditingPost }) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });

  const [eventDate, setEventDate] = useState(post?.event_date ? post.event_date : null);
  const [postTitle, setPostTitle] = useState(post?.title ? post.title : "");
  const [postContent, setPostContent] = useState(post?.content ? post.content : "");

  const onEventDateChange = (date) => {
    date != "Invalid Date" && date !== null && setEventDate(date);
  };
  const onTitleChange = (e) => {
    setPostTitle(e.target.value);
  };
  const onContentChange = (content) => {
    setPostContent(content);
  };

  const [open, setOpen] = useState(false);
  const openAlertDialog = () => {
    setOpen(true);
  };
  const closeAlertDialog = () => {
    setOpen(false);
  };
  return (
    <>
      <Card className={classes.card} raised="true">
        <div className={classes.titleAndDateFieldContainer}>
          <TextField
            className={classes.titleField}
            value={postTitle}
            onChange={onTitleChange}
            variant="outlined"
            InputProps={{
              disableUnderline: true,
            }}
            label={texts.title}
            fullWidth={true}
          />
          {/*reuse DatePicker component? (currently not using it because i could not make it work for inputVariant "outlined")*/}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              className={classes.dateField}
              label={texts.event_date_upper_case}
              onChange={onEventDateChange}
              value={eventDate}
              inputVariant="outlined"
              format="MM/dd/yyyy"
            />
          </MuiPickersUtilsProvider>
        </div>
        <RichTextEditor content={postContent} onContentChange={onContentChange} />
        <div className={classes.saveAndCancelButtonContainer}>
          <Button className={classes.saveButton}>{texts.save}</Button>
          <Button className={classes.cancelButton} onClick={openAlertDialog}>
            {texts.cancel}
          </Button>
        </div>
      </Card>
      <Dialog open={open}>
        <DialogTitle>{texts.are_you_sure}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {texts.do_you_really_want_to_stop_editing_this_post}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => cancelEditingPost(post.id)} color="primary">
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
