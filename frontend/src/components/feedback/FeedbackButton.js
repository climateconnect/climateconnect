import { Button, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
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
  const { locale } = useContext(UserContext);
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const texts = getTexts({ page: "communication", locale: locale });

  const submitFeedback = async (data) => {
    const token = cookies.get("token");
    try {
      const response = await apiRequest({
        method: "post",
        url: "/api/feedback/",
        payload: data,
        token: token,
        locale: locale,
      });
      showFeedbackMessage({
        message: response.data,
      });
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
