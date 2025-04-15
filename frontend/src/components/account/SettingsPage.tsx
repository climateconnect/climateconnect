import {
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Link from "next/link";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { removeUnnecesaryCookies } from "./../../../public/lib/cookieOperations";

const useStyles = makeStyles((theme) => ({
  wrapperElement: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: theme.breakpoints.values.lg,
  },
  blockElement: {
    display: "block",
    marginTop: theme.spacing(2),
  },
  displayBlock: {
    display: "block",
  },
  forgotPasswordLink: {
    marginTop: theme.spacing(2),
    display: "block",
  },
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
  lowerHeaders: {
    marginTop: theme.spacing(2),
  },
  primaryColor: {
    color: theme.palette.background.default_contrastText,
  },
  editProfilePageButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  deleteMessage: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  spaceStrings: {
    width: 4,
  },
  textAlignCenter: {
    textAlign: "center",
  },
}));

export default function SettingsPage({ settings, setSettings, token, setMessage }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "settings", locale: locale });
  const emailLink = "contact@climateconnect.earth";
  const possibleEmailPreferences = [
    {
      key: "send_newsletter",
      text: texts.send_newsletter_text,
    },
    {
      key: "email_on_private_chat_message",
      text: texts.email_on_private_chat_message_text,
    },
    {
      key: "email_on_group_chat_message",
      text: texts.email_on_group_chat_message_text,
    },
    {
      key: "email_on_comment_on_your_project",
      text: texts.email_on_comment_on_your_project_text,
    },
    {
      key: "email_on_comment_on_your_idea",
      text: texts.email_on_comment_on_your_idea_text,
    },
    {
      key: "email_on_reply_to_your_comment",
      text: texts.email_on_reply_to_your_comment_text,
    },
    {
      key: "email_on_new_project_follower",
      text: texts.email_on_new_project_follower_text,
    },
    {
      key: "email_on_new_project_like",
      text: texts.email_on_new_project_like_text,
    },
    {
      key: "email_on_mention",
      text: texts.email_on_mention_text,
    },
    {
      key: "email_on_idea_join",
      text: texts.email_on_new_idea_join_text,
    },
    {
      key: "email_on_join_request",
      text: texts.email_on_join_request_text,
    },
    {
      key: "email_on_new_organization_follower",
      text: texts.email_on_new_org_follower_text,
    },
    {
      key: "email_on_new_project_from_followed_org",
      text: texts.email_on_new_org_project_text,
    },
  ];

  const possibleCookiePreferences = [
    {
      key: "acceptedStatistics",
      text: texts.accepted_statistics_text,
    },
  ];
  const [errors, setErrors] = React.useState({
    passworderror: "",
    newemailerror: "",
    /*profileurlerror: "",*/
    emailpreferenceserror: "",
    cookiepreferencesserror: "",
  });

  const [passwordInputs, setPasswordInputs] = React.useState({
    oldpassword: "",
    newpassword: "",
    confirmnewpassword: "",
    /*profileurlerror: ""*/
  });
  const [newEmail, setNewEmail] = React.useState("");
  const cookies = new Cookies();
  const [cookiePreferences, setCookiePreferences] = React.useState(
    possibleCookiePreferences.reduce((obj, p) => {
      obj[p.key] = !!cookies.get(p.key);
      return obj;
    }, {})
  );

  const [emailPreferences, setEmailPreferences] = React.useState(
    possibleEmailPreferences.reduce((obj, p) => {
      obj[p.key] = settings[p.key];
      return obj;
    }, {})
  );
  /*const [newProfileUrl, setNewProfileUrl] = React.useState("");*/

  const handleNewEmailChange = (event) => {
    setNewEmail(event.target.value);
  };

  const handlePasswordInputsChange = (event, key) => {
    setPasswordInputs({ ...passwordInputs, [key]: event.target.value });
  };

  const handlePreferenceChange = (event, key) => {
    setEmailPreferences({
      ...emailPreferences,
      [key]: event.target.checked,
    });
  };

  const handleCookiePreferenceChange = (event, key) => {
    setCookiePreferences({
      ...cookiePreferences,
      [key]: event.target.checked,
    });
  };

  /*const handleNewProfileUrlChange = event => {
    setNewProfileUrl(event.target.value);
  };*/

  const changePassword = (event) => {
    event.preventDefault();
    if (passwordInputs.newpassword !== passwordInputs.confirmnewpassword) {
      setErrors({ ...errors, passworderror: texts.your_new_passwords_dont_match });
      setPasswordInputs({ ...passwordInputs, newpassword: "", confirmnewpassword: "" });
    } else {
      setErrors({ ...errors, passworderror: "" });
      apiRequest({
        method: "post",
        url: "/api/account_settings/",
        payload: {
          password: passwordInputs.newpassword,
          confirm_password: passwordInputs.confirmnewpassword,
          old_password: passwordInputs.oldpassword,
        },
        token: token,
        locale: locale,
      })
        .then(function (response) {
          setMessage(response.data.message);
          setErrors({
            ...errors,
            passworderror: "",
          });
          setPasswordInputs({
            oldpassword: "",
            newpassword: "",
            confirmnewpassword: "",
            /* profileurlerror: "", */
          });
          window.scrollTo(0, 0);
        })
        .catch(function (error) {
          if (error.response && error.response.data)
            setErrors({
              ...errors,
              passworderror: error.response.data[0],
            });
          setMessage("");
          if (error) console.log(error.response);
        });
    }
  };

  const changeEmail = (event) => {
    event.preventDefault();
    if (newEmail === settings.email)
      setErrors({
        ...errors,
        newemailerror: texts.your_new_email_can_not_be_the_same_as_your_old_email,
      });
    else {
      setErrors({ ...errors, newemailerror: "" });
      apiRequest({
        method: "post",
        url: "/api/account_settings/",
        payload: { email: newEmail },
        token: token,
        locale: locale,
      })
        .then(function () {
          redirect("/browse", {
            message:
              texts.an_e_mail_to_confirm_this_e_mail_address_change_has_been_sent_to_your_old_e_mail_address,
          });
        })
        .catch(function (error) {
          console.log(error);
          setErrors({
            ...errors,
            newemailerror: texts.error + "!",
          });
          if (error) console.log(error.response);
        });
    }
  };
  const [emailPreferencesLoading, setEmailPreferencesLoading] = React.useState(false);
  const changeEmailPreferences = async () => {
    if (
      hasChanges(
        settings,
        possibleEmailPreferences.map((p) => p.key),
        Object.keys(possibleEmailPreferences).map((k) => possibleEmailPreferences[k])
      )
    ) {
      setEmailPreferencesLoading(true);
      try {
        const response = await apiRequest({
          method: "post",
          url: "/api/account_settings/",
          payload: emailPreferences,
          token: token,
          locale: locale,
        });
        setEmailPreferencesLoading(false);
        setMessage(response.data.message);
        setSettings({
          ...settings,
          ...emailPreferences,
        });
        setErrors({
          ...errors,
          emailpreferenceserror: "",
        });
        window.scrollTo(0, 0);
      } catch (error: any) {
        setEmailPreferencesLoading(false);
        console.log(error);
        setErrors({
          ...errors,
          emailpreferenceserror: texts.error + "!",
        });
        if (error) console.log(error.response);
      }
    } else
      setErrors({
        ...errors,
        emailpreferenceserror: texts.you_havent_made_any_changes,
      });
  };

  const changeCookiePreferences = async () => {
    const now = new Date();
    const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));
    let hasChanges = false;
    Object.keys(cookiePreferences).map((p) => {
      if (cookies.get(p) === "true" && cookiePreferences[p] === false) {
        cookies.remove(p, { path: "/" });
        if (p === "acceptedStatistics") removeUnnecesaryCookies();
        hasChanges = true;
      }
      if (cookies.get(p) !== "true" && cookiePreferences[p] === true) {
        cookies.set(p, true, { path: "/", expires: oneYearFromNow, sameSite: "lax" });
        hasChanges = true;
      }
    });
    if (hasChanges) {
      setMessage(texts.cookie_settings_successfully_updated);
      window.scrollTo(0, 0);
      setErrors({
        ...errors,
        cookiepreferencesserror: "",
      });
    } else
      setErrors({
        ...errors,
        cookiepreferencesserror: texts.you_havent_made_any_changes,
      });
  };

  const hasChanges = (oldObject, oldKeys, newValues) => {
    const changedKeys = oldKeys.filter((key, index) => {
      return oldObject[key] !== newValues[index];
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
    <Container className={classes.wrapperElement}>
      <Typography
        className={[classes.primaryColor, classes.textAlignCenter].join(" ")}
        variant="h3"
        component="h2"
      >
        {texts.settings}
      </Typography>
      <Typography className={classes.primaryColor} variant="h5" component="h2">
        {texts.change_password}
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
          label={texts.old_password}
          value={passwordInputs.oldpassword}
          onChange={(event) => handlePasswordInputsChange(event, "oldpassword")}
          required
        />
        <TextField
          variant="outlined"
          className={classes.blockElement}
          type="password"
          label={texts.new_password}
          value={passwordInputs.newpassword}
          onChange={(event) => handlePasswordInputsChange(event, "newpassword")}
          required
        />
        <TextField
          variant="outlined"
          className={classes.blockElement}
          type="password"
          label={texts.confirm_new_password}
          value={passwordInputs.confirmnewpassword}
          onChange={(event) => handlePasswordInputsChange(event, "confirmnewpassword")}
          required
        />
        <div className={classes.blockElement}>
          <Typography variant="body2" className={classes.marginBottom}>
            {texts.make_sure_it_is_at_least_8_characters_including_a_number_and_an_uppercase_letter}
          </Typography>
          <Button variant="contained" color="primary" type="submit">
            {texts.change_password}
          </Button>
          <Link href={getLocalePrefix(locale) + "/resetpassword"}>
            <a className={`${classes.forgotPasswordLink} ${classes.primaryColor}`}>
              {texts.i_forgot_my_password}
            </a>
          </Link>
        </div>
      </form>

      <Typography
        className={[classes.lowerHeaders, classes.primaryColor].join(" ")}
        variant="h5"
        component="h2"
      >
        {texts.change_linked_email}
      </Typography>
      <Divider />
      <form onSubmit={changeEmail}>
        {errors.newemailerror && (
          <Typography className={classes.blockElement} color="error">
            {errors.newemailerror}
          </Typography>
        )}
        <Typography className={classes.blockElement} variant="body2">
          {texts.your_linked_email_is} {settings.email}
        </Typography>
        <TextField
          variant="outlined"
          className={classes.blockElement}
          type="email"
          label={texts.new_email}
          value={newEmail}
          onChange={handleNewEmailChange}
          required
        />
        <Button className={classes.blockElement} variant="contained" color="primary" type="submit">
          {texts.change_email}
        </Button>
        <Typography className={classes.blockElement} variant="body2">
          {texts.change_email_text}
        </Typography>
      </form>
      <Typography
        className={[classes.lowerHeaders, classes.primaryColor].join(" ")}
        variant="h5"
        component="h2"
        id="emailPreferences"
      >
        {texts.change_email_preferences}
      </Typography>
      <Divider />
      <div className={classes.blockElement}>
        {errors.emailpreferenceserror && (
          <Typography className={classes.blockElement} color="error">
            {errors.emailpreferenceserror}
          </Typography>
        )}
        {Object.keys(emailPreferences).map((key) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={emailPreferences[key]}
                color="contrast"
                onChange={() => handlePreferenceChange(event, key)}
                name={key}
              />
            }
            key={key}
            label={possibleEmailPreferences.find((p) => p.key === key)!.text}
            className={classes.displayBlock}
          />
        ))}
      </div>
      <Button
        className={[classes.editProfilePageButton].join(" ")}
        variant="contained"
        onClick={changeEmailPreferences}
        disabled={emailPreferencesLoading}
      >
        {emailPreferencesLoading && <CircularProgress size={13} />}
        {texts.change_preferences}
      </Button>
      <Typography
        className={[classes.lowerHeaders, classes.primaryColor].join(" ")}
        variant="h5"
        component="h2"
        id="cookiesettings"
      >
        {texts.change_cookie_settings}
      </Typography>
      <Divider />
      <div className={classes.blockElement}>
        {errors.cookiepreferencesserror && (
          <Typography className={classes.blockElement} color="error">
            {errors.cookiepreferencesserror}
          </Typography>
        )}
        {Object.keys(cookiePreferences).map((key) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={cookiePreferences[key]}
                color="contrast"
                onChange={(event) => handleCookiePreferenceChange(event, key)}
                name={key}
              />
            }
            key={key}
            label={possibleCookiePreferences.find((p) => p.key === key)!.text}
            className={classes.displayBlock}
          />
        ))}
      </div>
      <Button
        className={classes.editProfilePageButton}
        variant="contained"
        color="primary"
        onClick={changeCookiePreferences}
      >
        {texts.change_cookie_settings}
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
      <Typography
        className={[classes.lowerHeaders, classes.primaryColor].join(" ")}
        variant="h5"
        component="h2"
      >
        {texts.edit_your_profile_page}
      </Typography>
      <Divider />
      <Button
        href={getLocalePrefix(locale) + "/editprofile"}
        className={`${classes.editProfilePageButton}`}
        variant="contained"
        color="primary"
      >
        {texts.edit_profile_page}
      </Button>
      <Typography variant="subtitle2" className={classes.deleteMessage}>
        <InfoOutlinedIcon />
        {texts.if_you_wish_to_delete_this_account}
        <div className={classes.spaceStrings} />
        <Link href="mailto:contact@climateconnect.earth">
          <a className={classes.primaryColor}>{emailLink}</a>
        </Link>
      </Typography>
    </Container>
  );
}
