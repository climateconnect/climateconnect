import { Button, Checkbox, TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "./../dialogs/GenericDialog";

const useStyles = makeStyles((theme) => ({
  textField: {
    width: "100%",
  },
  feedback: {
    marginBottom: theme.spacing(2),
  },
  sendButton: {
    marginTop: theme.spacing(2),
    float: "right",
  },
  checkbox: {
    marginLeft: theme.spacing(-1),
  },
}));

export default function FeedbackDialog({ onClose, open, title, inputLabel, maxLength, className }) {
  const classes = useStyles();
  const [element, setElement] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });
  const handleClose = () => {
    onClose();
    setElement("");
  };

  const onSend = (event) => {
    event.preventDefault();
    const data = {
      message: element,
      email_address: email,
      send_response: checked,
    };
    onClose(data);
    setElement("");
  };

  const handleChange = (event) => {
    setElement(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={title}>
      <div className={className}>
        <form onSubmit={onSend}>
          <Typography className={classes.feedback}>
            {texts.send_us_your_feedback_about_climate_connect}
          </Typography>
          <TextField
            multiline
            className={classes.textField}
            label={inputLabel}
            autoFocus={true}
            variant="outlined"
            onChange={handleChange}
            value={element}
            inputProps={{ maxLength: maxLength }}
            rows={4}
            maxRows={15}
            required
          />
          <Checkbox
            id={"feedbackcheckbox"}
            className={classes.checkbox}
            checked={checked}
            size="small"
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor={"feedbackcheckbox"}>
            {texts.please_send_me_a_response_to_my_feedback}
          </label>
          {checked && !user && (
            <>
              <br />
              <TextField
                variant="outlined"
                onChange={handleEmailChange}
                /*TODO(undefined) className={classes.emailTextField} */
                value={email}
                placeholder={texts.email_address}
                type="email"
                required
              />
            </>
          )}
          <Button variant="contained" color="primary" type="submit" className={classes.sendButton}>
            {texts.send}
          </Button>
        </form>
      </div>
    </GenericDialog>
  );
}

FeedbackDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  applyText: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  className: PropTypes.string,
};
