import React, { useContext, useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";
import MiniProfilePreview from "../profile/MiniProfilePreview";

const useStyles = makeStyles((theme: Theme) => ({
  modalContent: {
    minHeight: 400,
    display: "flex",
    flexDirection: "column",
  },
  formContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  userInfo: {
    marginBottom: theme.spacing(3),
  },
  profilePreview: {
    marginBottom: theme.spacing(2),
  },
  infoField: {
    marginBottom: theme.spacing(2),
  },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
  },
  authMessage: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
  authButtons: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    maxWidth: 300,
    margin: "0 auto",
  },
  successIcon: {
    fontSize: 64,
    color: theme.palette.success.main,
    marginBottom: theme.spacing(2),
  },
  errorIcon: {
    fontSize: 64,
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  errorText: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(2),
  },
  confirmationContainer: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
  confirmationText: {
    marginTop: theme.spacing(2),
  },
  confirmationActions: {
    justifyContent: "center",
    marginTop: theme.spacing(4),
  },
  authFieldsContainer: {
    gap: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(2),
  },
  helperText: {
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  registerButton: {
    whiteSpace: "nowrap",
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
  project: Project;
  onRegistrationSuccess?: () => void;
};

type RegistrationState = "initial" | "success" | "error";

export default function EventRegistrationModal({
  open,
  onClose,
  project,
  onRegistrationSuccess,
}: Props) {
  const classes = useStyles();
  const { locale, user, signIn } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const cookies = new Cookies();
  const token = cookies.get("auth_token");

  const [state, setState] = useState<RegistrationState>("initial");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Authentication flow state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "login" | "signup">("email");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Render the appropriate content based on authentication and registration state
  const renderContent = () => {
    // Show success/error states regardless of authentication
    if (state === "success") {
      return renderSuccessContent();
    }
    if (state === "error") {
      return renderErrorContent();
    }

    // Show registration form for authenticated users
    if (user) {
      return renderAuthenticatedContent();
    }

    // Show authentication flow for unauthenticated users
    return renderUnauthenticatedContent();
  };

  const handleRegister = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/projects/${project.url_slug}/registrations/`,
        payload: {},
        token: token,
        locale: locale,
      });

      if (response.status === 200 || response.status === 201) {
        setState("success");
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        }
      }
    } catch (error: any) {
      setState("error");
      setErrorMessage(error?.response?.data?.message || texts.registration_failed_please_try_again);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!email) return;

    setCheckingEmail(true);
    // TODO: Implement email check API call
    // For now, just show login form
    setAuthStep("login");
    setCheckingEmail(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await apiRequest({
        method: "post",
        url: "/login/",
        payload: {
          username: email.toLowerCase(),
          password: password,
        },
        locale: locale,
      });

      // Sign in the user - this will update the UserContext
      await signIn(response.data.token, response.data.expiry);

      // After signIn updates the context, the modal will automatically re-render
      // and show the authenticated registration form instead of login form
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.data?.type === "not_verified") {
        setErrorMessage(error.response.data.message || "Account not verified");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Login failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setState("initial");
    setErrorMessage("");
    setEmail("");
    setPassword("");
    setAuthStep("email");
    onClose();
  };

  const renderAuthenticatedContent = () => (
    <Box className={classes.formContainer}>
      <Box className={classes.userInfo}>
        <Box className={classes.profilePreview}>
          <MiniProfilePreview
            profile={{ ...user, thumbnail_image: user.image }}
            size="medium"
            nolink
          />
        </Box>
      </Box>

      <Box className={classes.actionRow}>
        <Button
          onClick={handleRegister}
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          className={classes.registerButton}
        >
          {loading ? <CircularProgress size={24} /> : texts.confirm_registration}
        </Button>
        <Button onClick={handleClose} variant="outlined">
          {texts.cancel}
        </Button>
      </Box>
    </Box>
  );

  const renderUnauthenticatedContent = () => (
    <Box className={classes.formContainer}>
      <Box>
        <Typography variant="body1" className={classes.authMessage}>
          {texts.to_register_please_login_or_signup}
        </Typography>

        {errorMessage && (
          <Typography variant="body2" className={classes.errorText}>
            {errorMessage}
          </Typography>
        )}

        {authStep === "email" && (
          <Box className={classes.authFieldsContainer}>
            <TextField
              fullWidth
              label={texts.email}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email) {
                  handleCheckEmail();
                }
              }}
              disabled={checkingEmail}
            />
            <Button
              onClick={handleCheckEmail}
              variant="contained"
              color="primary"
              disabled={!email || checkingEmail}
              fullWidth
            >
              {checkingEmail ? <CircularProgress size={24} /> : texts.continue}
            </Button>
          </Box>
        )}

        {authStep === "login" && (
          <Box className={classes.authFieldsContainer}>
            <TextField fullWidth label={texts.email} type="email" value={email} disabled />
            <TextField
              fullWidth
              label={texts.password}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  handleLogin();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={handleLogin}
              variant="contained"
              color="primary"
              disabled={!password || loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : texts.log_in}
            </Button>
          </Box>
        )}

        {authStep === "signup" && (
          <Box className={classes.authButtons}>
            <Typography variant="body2" className={classes.helperText}>
              {texts.signup_flow_coming_soon}
            </Typography>
          </Box>
        )}
      </Box>

      <Box className={classes.actionRow}>
        <Button onClick={handleClose} variant="outlined" fullWidth>
          {texts.cancel}
        </Button>
      </Box>
    </Box>
  );

  const renderSuccessContent = () => (
    <Box className={classes.confirmationContainer}>
      <CheckCircleOutlineIcon className={classes.successIcon} />
      <Typography variant="h6">{texts.youre_registered}</Typography>
      <Typography variant="body1" className={classes.confirmationText}>
        {texts.a_confirmation_email_has_been_sent}
      </Typography>
      <Box className={`${classes.actionRow} ${classes.confirmationActions}`}>
        <Button onClick={handleClose} variant="contained" color="primary">
          {texts.close}
        </Button>
      </Box>
    </Box>
  );

  const renderErrorContent = () => (
    <Box className={classes.confirmationContainer}>
      <ErrorOutlineIcon className={classes.errorIcon} />
      <Typography variant="h6">{texts.registration_failed}</Typography>
      {errorMessage && (
        <Typography variant="body1" className={classes.errorText}>
          {errorMessage}
        </Typography>
      )}
      <Box className={`${classes.actionRow} ${classes.confirmationActions}`}>
        <Button onClick={handleClose} variant="outlined">
          {texts.close}
        </Button>
        <Button onClick={() => setState("initial")} variant="contained" color="primary">
          {texts.try_again}
        </Button>
      </Box>
    </Box>
  );

  return (
    <GenericDialog open={open} onClose={handleClose} title={texts.register_for_event} maxWidth="sm">
      <Box className={classes.modalContent}>{renderContent()}</Box>
    </GenericDialog>
  );
}
