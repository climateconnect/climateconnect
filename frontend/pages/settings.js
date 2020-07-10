import React from "react";
import Layout from "../src/components/layouts/layout";
import Link from "next/link";
import {
  Typography,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import TEMP_FEATURED_PROFILE_DATA from "../public/data/profiles.json";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  blockElement: {
    display: "block",
    marginTop: theme.spacing(2)
  },
  displayBlock: {
    display: "block"
  },
  forgotPasswordLink: {
    marginTop: theme.spacing(2),
    display: "block"
  },
  marginBottom: {
    marginBottom: theme.spacing(1)
  },
  lowerHeaders: {
    marginTop: theme.spacing(2)
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
  editProfilePageButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const possibleEmailPreferences = [
  {
    key: "notifications",
    text: "Receive updates on the projects you follow"
  },
  {
    key: "suggestions",
    text: "Receive suggestions for projects you might like"
  }
];

export default function Settings({ loggedInUser }) {
  const classes = useStyles();

  const [errors, setErrors] = React.useState({
    passworderror: "",
    newemailerror: ""
  });

  const [passwordInputs, setPasswordInputs] = React.useState({
    oldpassword: "",
    newpassword: "",
    confirmnewpassword: "",
    profileurlerror: ""
  });
  const [newEmail, setNewEmail] = React.useState("");
  const [emailPreferences, setEmailPreferences] = React.useState(
    possibleEmailPreferences.reduce((obj, p) => {
      obj[p.key] = { text: p.text, checked: loggedInUser.emailPreferences[p.key] };
      return obj;
    }, {})
  );
  const [newProfileUrl, setNewProfileUrl] = React.useState("");

  const handleNewEmailChange = event => {
    setNewEmail(event.target.value);
  };

  const handlePasswordInputsChange = (event, key) => {
    setPasswordInputs({ ...passwordInputs, [key]: event.target.value });
  };

  const handlePreferenceChange = (event, key) => {
    setEmailPreferences({
      ...emailPreferences,
      [key]: { ...emailPreferences[key], checked: event.target.checked }
    });
  };

  const handleNewProfileUrlChange = event => {
    setNewProfileUrl(event.target.value);
  };

  const changePassword = event => {
    event.preventDefault();
    if (passwordInputs.newpassword !== passwordInputs.confirmnewpassword) {
      setErrors({ ...errors, passworderror: "Your new passwords don't match" });
      setPasswordInputs({ ...passwordInputs, newpassword: "", confirmnewpassword: "" });
    } else {
      setErrors({ ...errors, passworderror: "" });
      //TODO: make API request to change password
    }
  };

  const changeEmail = event => {
    event.preventDefault();
    if (newEmail === loggedInUser.email)
      setErrors({
        ...errors,
        newemailerror: "Your new email can not be the same as your old email."
      });
    else {
      setErrors({ ...errors, newemailerror: "" });
      //TODO: make API request to change email
    }
  };

  const changePreferences = () => {
    //TODO: make API request to change preferences
  };

  const changeProfileUrl = event => {
    event.preventDefault();
    if (newProfileUrl === loggedInUser.url_slug)
      setErrors({
        ...errors,
        profileurlerror: "Your new profile url can not be the same as your old profile url."
      });
    else {
      setErrors({ ...errors, profileurlerror: "" });
      //TODO: make API request to change preferences
    }
  };

  return (
    <div>
      <Layout title="Settings">
        <Typography color="primary" variant="h5" component="h2">
          Change Password
        </Typography>
        <Divider />
        <form onSubmit={changePassword}>
          {errors.passworderror && (
            <Typography className={classes.blockElement} color="error">
              {errors.passworderror}
            </Typography>
          )}
          <TextField
            variant="outlined"
            className={classes.blockElement}
            type="password"
            label="Old password"
            value={passwordInputs.oldpassword}
            onChange={() => handlePasswordInputsChange(event, "oldpassword")}
            required
          />
          <TextField
            variant="outlined"
            className={classes.blockElement}
            type="password"
            label="New password"
            value={passwordInputs.newpassword}
            onChange={() => handlePasswordInputsChange(event, "newpassword")}
            required
          />
          <TextField
            variant="outlined"
            className={classes.blockElement}
            type="password"
            label="Confirm new password"
            value={passwordInputs.confirmnewpassword}
            onChange={() => handlePasswordInputsChange(event, "confirmnewpassword")}
            required
          />
          <div className={classes.blockElement}>
            <Typography variant="body2" className={classes.marginBottom}>
              Make sure it is at least 8 characters including a number and an uppercase letter.
            </Typography>
            <Button variant="contained" color="primary" type="submit">
              Change Password
            </Button>
            <Link href="/resetpassword">
              <a className={`${classes.forgotPasswordLink} ${classes.primaryColor}`}>
                I forgot my password
              </a>
            </Link>
          </div>
        </form>

        <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
          Change linked email
        </Typography>
        <Divider />
        <form onSubmit={changeEmail}>
          {errors.newemailerror && (
            <Typography className={classes.blockElement} color="error">
              {errors.newemailerror}
            </Typography>
          )}
          <Typography className={classes.blockElement} variant="body2">
            Your linked email is {loggedInUser.email}
          </Typography>
          <TextField
            variant="outlined"
            className={classes.blockElement}
            type="email"
            label="New Email"
            value={newEmail}
            onChange={handleNewEmailChange}
            required
          />
          <Button
            className={classes.blockElement}
            variant="contained"
            color="primary"
            type="submit"
          >
            Change email
          </Button>
        </form>
        <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
          Change email preferences
        </Typography>
        <Divider />
        <div className={classes.blockElement}>
          {Object.keys(emailPreferences).map(key => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={emailPreferences[key].checked}
                  onChange={() => handlePreferenceChange(event, key)}
                  name={key}
                  color="primary"
                />
              }
              key={key}
              label={emailPreferences[key].text}
              className={classes.displayBlock}
            />
          ))}
        </div>
        <Button
          className={`${classes.editProfilePageButton}`}
          variant="contained"
          color="primary"
          onClick={changePreferences}
        >
          Change preferences
        </Button>
        <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
          Change your profile url
        </Typography>
        <Divider />
        <Typography className={classes.blockElement} variant="body2">
          Your profile url is{" "}
          <Link href={"/profiles/" + loggedInUser.url_slug}>
            <a className={classes.primaryColor}>climateconnect.earth/{loggedInUser.url_slug}</a>
          </Link>
        </Typography>
        {errors.profileurlerror && (
          <Typography className={classes.blockElement} color="error">
            {errors.profileurlerror}
          </Typography>
        )}
        <form onSubmit={changeProfileUrl}>
          <TextField
            variant="outlined"
            className={classes.blockElement}
            type="text"
            label="New profile url"
            value={newProfileUrl}
            onChange={handleNewProfileUrlChange}
            required
          />
          <Button
            className={classes.blockElement}
            variant="contained"
            color="primary"
            type="submit"
          >
            Change profile url
          </Button>
        </form>
        <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
          Edit your profile page
        </Typography>
        <Divider />
        <Button
          href={"/editprofile" + loggedInUser.url_slug}
          className={`${classes.editProfilePageButton}`}
          variant="contained"
          color="primary"
        >
          Edit profile page
        </Button>
      </Layout>
    </div>
  );
}

Settings.getInitialProps = async () => {
  return {
    loggedInUser: await getLoggedInUser()
  };
};

async function getLoggedInUser() {
  return TEMP_FEATURED_PROFILE_DATA.profiles.find(p => p.url_slug === "christophstoll");
}
