import React, { useContext } from "react";
import PropTypes from "prop-types";
import { TextField, Typography, Button, Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GenericDialog from "./../dialogs/GenericDialog";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(theme => ({
  textField: {
    width: "100%"
  },
  feedback: {
    marginBottom: theme.spacing(2)
  },
  sendButton: {
    marginTop: theme.spacing(2),
    float: "right"
  },
  checkbox: {
    marginLeft: theme.spacing(-1)
  }
}));

export default function FeedbackDialog({ onClose, open, title, inputLabel, maxLength, className }) {
  const classes = useStyles();
  const [element, setElement] = React.useState(null);
  const [checked, setChecked] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const { user } = useContext(UserContext);
  const handleClose = () => {
    onClose();
    setElement(null);
  };

  const onSend = event => {
    event.preventDefault();
    const data = {
      message: element,
      email_address: email,
      send_response: checked
    };
    onClose(data);
  };

  const handleChange = event => {
    setElement(event.target.value);
  };

  const handleEmailChange = event => {
    setEmail(event.target.value);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={title}>
      <div className={className}>
        <form onSubmit={onSend}>
          <Typography className={classes.feedback}>
            Send us your feedback about Climate Connect. You can send us ideas, bug reports,
            criticism or anything else.
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
            rowsMax={15}
            required
          />
          <Checkbox
            id={"feedbackcheckbox"}
            className={classes.checkbox}
            checked={checked}
            color="primary"
            size="small"
            onChange={e => setChecked(e.target.checked)}
          />
          <label htmlFor={"feedbackcheckbox"}>Please send me a response to my feedback</label>
          {checked && !user && (
            <>
              <br />
              <TextField
                variant="outlined"
                onChange={handleEmailChange}
                className={classes.emailTextField}
                value={email}
                placeholder="Email Address"
                type="email"
                required
              />
            </>
          )}
          <Button variant="contained" color="primary" type="submit" className={classes.sendButton}>
            Send
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
  className: PropTypes.string
};
