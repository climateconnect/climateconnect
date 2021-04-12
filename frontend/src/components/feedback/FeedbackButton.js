import { Button, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import tokenConfig from "../../../public/config/tokenConfig";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FeedbackDialog from "./FeedbackDialog";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: "calc(50vh - 20px)",
    transform: "rotate(-90deg)",
    right: -27.35,
  },
  buttonText: {
    color: theme.palette.primary.main,
  },
  alert: {
    position: "absolute",
    top: 98,
    width: "100%",
    maxWidth: 1280,
  },
  link: {
    color: "white",
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

export default function FeedbackButton({ justLink, children }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const cookies = new Cookies();
  const [message, setMessage] = React.useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });

  const submitFeedback = async (data) => {
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

  const onFeedbackDialogClose = (text) => {
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
      {justLink ? (
        <Link underline="none" onClick={handleOpenDialog} className={classes.link}>
          {children}
        </Link>
      ) : (
        <Button
          variant="contained"
          size="small"
          classes={{
            root: classes.root,
            label: classes.buttonText,
          }}
          onClick={handleOpenDialog}
        >
          {texts.feedback}
        </Button>
      )}
      <FeedbackDialog
        open={open}
        onClose={onFeedbackDialogClose}
        title={texts.your_feedback}
        inputLabel={texts.your_feedback}
        applyText={texts.send_feedback}
      />
    </>
  );
}
