import React from "react";
import Link from "next/link";
import {
  Typography,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import tokenConfig from "../../../public/config/tokenConfig";
import Axios from "axios";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { redirect } from "../../../public/lib/apiOperations";

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
  },
  deleteMessage: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

const possibleEmailPreferences = [
  {
    key: "email_updates_on_projects",
    text: "Receive updates on the projects you follow"
  },
  {
    key: "email_project_suggestions",
    text: "Receive suggestions for projects you might like"
  }
];

export default function SettingsPage({ settings, setSettings, token, setMessage }) {
  const classes = useStyles();
  const [errors, setErrors] = React.useState({
    passworderror: "",
    newemailerror: "",
    /*profileurlerror: "",*/
    emailpreferenceserror: ""
  });

  const [passwordInputs, setPasswordInputs] = React.useState({
    oldpassword: "",
    newpassword: "",
    confirmnewpassword: ""
    /*profileurlerror: ""*/
  });
  const [newEmail, setNewEmail] = React.useState("");
  const [emailPreferences, setEmailPreferences] = React.useState(
    possibleEmailPreferences.reduce((obj, p) => {
      obj[p.key] = settings[p.key];
      return obj;
    }, {})
  );
  /*const [newProfileUrl, setNewProfileUrl] = React.useState("");*/

  const handleNewEmailChange = event => {
    setNewEmail(event.target.value);
  };

  const handlePasswordInputsChange = (event, key) => {
    setPasswordInputs({ ...passwordInputs, [key]: event.target.value });
  };

  const handlePreferenceChange = (event, key) => {
    setEmailPreferences({
      ...emailPreferences,
      [key]: event.target.checked
    });
  };

  /*const handleNewProfileUrlChange = event => {
    setNewProfileUrl(event.target.value);
  };*/

  const changePassword = event => {
    event.preventDefault();
    if (passwordInputs.newpassword !== passwordInputs.confirmnewpassword) {
      setErrors({ ...errors, passworderror: "Your new passwords don't match" });
      setPasswordInputs({ ...passwordInputs, newpassword: "", confirmnewpassword: "" });
    } else {
      setErrors({ ...errors, passworderror: "" });
      console.log(passwordInputs.newpassword);
      Axios.post(
        process.env.API_URL + "/api/account_settings/",
        {
          password: passwordInputs.newpassword,
          confirm_password: passwordInputs.confirmnewpassword,
          old_password: passwordInputs.oldpassword
        },
        tokenConfig(token)
      )
        .then(function(response) {
          console.log(response);
          setMessage(response.data.message);
          setErrors({
            ...errors,
            passworderror: ""
          });
          setPasswordInputs({
            oldpassword: "",
            newpassword: "",
            confirmnewpassword: "",
            profileurlerror: ""
          });
          window.scrollTo(0, 0);
        })
        .catch(function(error) {
          console.log(error.response.data);
          console.log();
          if (error.response && error.response.data)
            setErrors({
              ...errors,
              passworderror: error.response.data[0]
            });
          setMessage("");
          if (error) console.log(error.response);
        });
    }
  };

  const changeEmail = event => {
    event.preventDefault();
    if (newEmail === settings.email)
      setErrors({
        ...errors,
        newemailerror: "Your new email can not be the same as your old email."
      });
    else {
      setErrors({ ...errors, newemailerror: "" });
      Axios.post(
        process.env.API_URL + "/api/account_settings/",
        { email: newEmail },
        tokenConfig(token)
      )
        .then(function() {
          redirect("/", {
            message:
              "An E-Mail to confirm this E-Mail address change has been sent to your old E-Mail address."
          });
        })
        .catch(function(error) {
          console.log(error);
          setErrors({
            ...errors,
            newemailerror: "Error!"
          });
          if (error) console.log(error.response);
        });
    }
  };

  const changePreferences = async () => {
    if (
      hasChanges(
        ["email_updates_on_projects", "email_project_suggestions"],
        [emailPreferences.email_updates_on_projects, emailPreferences.email_project_suggestions]
      )
    ) {
      Axios.post(
        process.env.API_URL + "/api/account_settings/",
        emailPreferences,
        tokenConfig(token)
      )
        .then(function(response) {
          setMessage(response.data.message);
          setSettings({
            ...settings,
            email_updates_on_projects: emailPreferences.email_updates_on_projects,
            email_project_suggestions: emailPreferences.email_project_suggestions
          });
          setErrors({
            ...errors,
            emailpreferenceserror: ""
          });
          window.scrollTo(0, 0);
        })
        .catch(function(error) {
          console.log(error);
          setErrors({
            ...errors,
            emailpreferenceserror: "Error!"
          });
          if (error) console.log(error.response);
        });
    } else
      setErrors({
        ...errors,
        emailpreferenceserror: "You haven't made any changes"
      });
  };

  const hasChanges = (oldKeys, newValues) => {
    const changedKeys = oldKeys.filter((key, index) => {
      return settings[key] !== newValues[index];
    });
    return changedKeys.length > 0;
  };

  /*const changeProfileUrl = event => {
    event.preventDefault();
    if (newProfileUrl === settings.url_slug)
      setErrors({
        ...errors,
        profileurlerror: "Your new profile url can not be the same as your old profile url."
      });
    else {
      setErrors({ ...errors, profileurlerror: "" });
      //TODO: make API request to change preferences
    }
  };*/

  return (
    <>
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
          Your linked email is {settings.email}
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
        <Button className={classes.blockElement} variant="contained" color="primary" type="submit">
          Change email
        </Button>
        <Typography className={classes.blockElement} variant="body2">
          Changing your E-Mail will not change the E-Mail you use for Login. It will just change the
          E-Mail that your E-Mails are delivered to.
        </Typography>
      </form>
      <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
        Change email preferences
      </Typography>
      <Divider />
      <div className={classes.blockElement}>
        {errors.emailpreferenceserror && (
          <Typography className={classes.blockElement} color="error">
            {errors.emailpreferenceserror}
          </Typography>
        )}
        {Object.keys(emailPreferences).map(key => (
          <FormControlLabel
            control={
              <Checkbox
                checked={emailPreferences[key]}
                onChange={() => handlePreferenceChange(event, key)}
                name={key}
                color="primary"
              />
            }
            key={key}
            label={possibleEmailPreferences.find(p => p.key === key).text}
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
      {/*<Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
        Change your profile url
      </Typography>
      <Divider />
      <Typography className={classes.blockElement} variant="body2">
        Your profile url is{" "}
        <Link href={"/profiles/" + settings.url_slug}>
          <a className={classes.primaryColor}>climateconnect.earth/{settings.url_slug}</a>
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
        <Button className={classes.blockElement} variant="contained" color="primary" type="submit">
          Change profile url
        </Button>
      </form>*/}
      <Typography className={classes.lowerHeaders} color="primary" variant="h5" component="h2">
        Edit your profile page
      </Typography>
      <Divider />
      <Button
        href={"/editprofile"}
        className={`${classes.editProfilePageButton}`}
        variant="contained"
        color="primary"
      >
        Edit profile page
      </Button>
      <Typography variant="subtitle2" className={classes.deleteMessage}>
        <InfoOutlinedIcon />
        If you wish to delete this account, send an E-Mail to support@climateconnect.earth
      </Typography>
    </>
  );
}
