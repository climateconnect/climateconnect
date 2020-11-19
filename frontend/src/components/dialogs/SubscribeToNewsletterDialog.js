import React from "react";
import { makeStyles, TextField, Button, Typography, useMediaQuery } from "@material-ui/core";
import GenericDialog from "./GenericDialog";
import theme from "../../themes/theme";
import axios from "axios";

const useStyles = makeStyles(theme => ({
  callToAction: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "center"
  },
  subscribeButton: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
      height: 56,
      width: 150
    },
    [theme.breakpoints.down("xs")]: {
      width: 250,
      marginTop: theme.spacing(1),
      marginLeft: 0
    }
  },
  emailTextField: {
    [theme.breakpoints.up("md")]: {
      width: 340
    },
    [theme.breakpoints.down("xs")]: {
      width: 250
    }
  },
  textBlock: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      marginTop: theme.spacing(-1)
    }
  }
}));

export default function SubscribeToNewsletterDialog({ onClose, open }) {
  const classes = useStyles();
  const [emailAddress, setEmailAddress] = React.useState("");
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = React.useState(false)
  const handleSubscribe = async e => {
    e.preventDefault()
    console.log("subscribing!")
    try {
      setLoading(true)
      const resp = await subscribeToNewsletter(emailAddress)
      console.log(resp)
      setLoading(false)
    } catch(e) {
      console.log(e)
    }
  };
  const handleEmailTextChange = e => {
    setEmailAddress(e.target.value)
  }
  return (
    <GenericDialog
      maxWidth="sm"
      onClose={onClose}
      open={open}
      title={isMediumScreen ? "Climate News" : "Receive Climate news every month!"}
    >
      <Typography className={classes.textBlock}>
        Get the most <b>interesting climate solutions</b> and <b>updates</b> about the Climate
        Connect platform {"&"} community delivered right to your inbox <b>every month</b>!
      </Typography>
      <form className={classes.callToAction} onSubmit={handleSubscribe}>
        <TextField
          value={emailAddress}
          variant="outlined"
          size={isMediumScreen ? "small" : "large"}
          label="Your email address"
          className={classes.emailTextField}
          onChange={handleEmailTextChange}
          type="email"
          required
        />
        {isNarrowScreen && <br />}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          size={!isMediumScreen ? "large" : "normal"}
          className={classes.subscribeButton}
          disabled={loading}
        >
          Subscribe
        </Button>
      </form>
    </GenericDialog>
  );
}

const subscribeToNewsletter = (emailAddress) => {
  const url = process.env.API_URL + "/api/subscribe_to_newsletter/"
    const payload = {email: emailAddress}
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };
    axios.post(url, payload, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        throw error
      })
}