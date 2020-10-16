import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FeedbackDialog from "./FeedbackDialog";
import tokenConfig from "../../../public/config/tokenConfig";
import axios from "axios";
import Cookies from "universal-cookie";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    bottom: "calc(50vh - 20px)",
    transform: "rotate(-90deg)",
    right: -27.35
  },
  buttonText: {
    color: theme.palette.primary.main
  },
  alert: {
    position: "absolute",
    top: 98,
    width: "100%",
    maxWidth: 1280
  }
}));

export default function FeedbackButton() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const cookies = new Cookies();
  const [message, setMessage] = React.useState("");

  const submitFeedback = async data => {
    const token = cookies.get("token");
    try {
      const response = await axios.post(
        process.env.API_URL + "/api/feedback/",
        data,
        tokenConfig(token)
      );
      setMessage(response.data);
    } catch (e) {
      console.log(e);
      console.log(e.response);
    }
  };

  const onFeedbackDialogClose = text => {
    setOpen(false);
    if (text) submitFeedback(text);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  return (
    <>
      {message && (
        <Alert severity="success" className={classes.alert} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}
      <Button
        variant="contained"
        size="small"
        classes={{
          root: classes.root,
          label: classes.buttonText
        }}
        onClick={handleOpenDialog}
      >
        Feedback
      </Button>
      <FeedbackDialog
        open={open}
        onClose={onFeedbackDialogClose}
        title="Your Feedback"
        inputLabel="Your feedback"
        applyText="Send Feedback"
      />
    </>
  );
}
