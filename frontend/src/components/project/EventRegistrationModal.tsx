import React, { useContext, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import { getDateTime, getDateTimeRange } from "../../../public/lib/dateOperations";
import getTexts from "../../../public/texts/texts";
import { Project, RegistrationFieldAnswerValue } from "../../types";
import UserContext from "../context/UserContext";
import { useFeatureToggles } from "../featureToggle";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import AuthEmailStep from "../auth/AuthEmailStep";
import AuthPasswordLogin from "../auth/AuthPasswordLogin";
import AuthOtp from "../auth/AuthOtp";
import AuthSignupStep from "../auth/AuthSignupStep";
import RegistrationFieldAnswersForm, {
  RegistrationFieldAnswersFormHandle,
} from "./RegistrationFieldAnswersForm";

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    display: "flex",
    alignItems: "center",
  },
  closeButton: {
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  titleText: {
    fontSize: 20,
    color: theme.palette.text.primary,
  },
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
  },
  eventSubheader: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  eventDateLine: {
    marginTop: theme.spacing(0.5),
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
  confirmationMessage: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
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
    paddingBottom: theme.spacing(2),
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
    paddingLeft: theme.spacing(1),
  },
  loadingContainer: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  registerButton: {
    whiteSpace: "nowrap",
  },
  customFieldsScrollable: {
    overflowY: "auto",
    flex: 1,
    paddingRight: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
  },
  stickyActionRow: {
    position: "sticky",
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(1),
    zIndex: 1,
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
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale, project });
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { isEnabled } = useFeatureToggles();

  const [state, setState] = useState<RegistrationState>("initial");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // Per-field server-side errors, keyed by field ID
  const [fieldServerErrors, setFieldServerErrors] = useState<Record<number, string>>({});

  // Ref to the custom fields form so we can call validate() on submit
  const answersFormRef = useRef<RegistrationFieldAnswersFormHandle>(null);

  // Authentication flow state
  const [email, setEmail] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "password" | "otp" | "signup">("email");
  const [isNewUserOtp, setIsNewUserOtp] = useState(false);

  const showCustomFields =
    isEnabled("EVENT_REGISTRATION") && (project.registration_config?.fields?.length ?? 0) > 0;
  const hasRequiredCustomFields =
    showCustomFields &&
    (project.registration_config?.fields?.some((field) => field.is_required) ?? false);

  const eventDateText =
    project.start_date && project.end_date
      ? getDateTimeRange(project.start_date, project.end_date, locale)
      : project.start_date
      ? getDateTime(project.start_date)
      : null;

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

    // Validate custom fields if present
    let answers: RegistrationFieldAnswerValue[] | null = [];
    if (showCustomFields && answersFormRef.current) {
      answers = answersFormRef.current.validate();
      if (answers === null) {
        // Validation failed — errors are shown inline
        return;
      }
    }

    setLoading(true);
    setErrorMessage("");
    setFieldServerErrors({});

    // Build the API payload
    const payload: {
      answers?: {
        field: number;
        value_boolean?: boolean;
        value_option?: number;
        value_number?: number;
      }[];
    } = {};
    if (showCustomFields && answers && answers.length > 0) {
      payload.answers = answers.map((a) => {
        const entry: {
          field: number;
          value_boolean?: boolean;
          value_option?: number;
          value_number?: number;
        } = {
          field: a.fieldId,
        };
        if (a.valueBoolean !== undefined) entry.value_boolean = a.valueBoolean;
        if (a.valueOption !== undefined) entry.value_option = a.valueOption;
        if (a.valueNumber !== undefined) entry.value_number = a.valueNumber;
        return entry;
      });
    }

    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/projects/${project.url_slug}/registrations/`,
        payload,
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
      // Try to map field-specific errors from the server response
      const responseData = error?.response?.data;
      if (responseData?.field_errors && typeof responseData.field_errors === "object") {
        setFieldServerErrors(responseData.field_errors);
        // Also surface a top-level message so the user knows what happened
        setErrorMessage(responseData.message || texts.registration_failed_please_try_again);
        // Stay on "initial" so the user can correct the field errors
        return;
      }
      setState("error");
      setErrorMessage(responseData?.message || texts.registration_failed_please_try_again);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusDetermined = (
    status: "new" | "returning_password" | "returning_otp",
    determinedEmail: string
  ) => {
    setEmail(determinedEmail);
    if (status === "new") {
      setAuthStep("signup");
    } else if (status === "returning_password") {
      setAuthStep("password");
    } else if (status === "returning_otp") {
      setIsNewUserOtp(false);
      setAuthStep("otp");
    }
  };

  const handleClose = () => {
    setState("initial");
    setErrorMessage("");
    setFieldServerErrors({});
    setEmail("");
    setAuthStep("email");
    onClose();
  };

  const renderAuthenticatedContent = () => (
    <Box className={classes.formContainer}>
      <Box className={classes.userInfo}>
        <Box className={classes.profilePreview}>
          <MiniProfilePreview
            profile={{ ...user, thumbnail_image: (user as any)?.image }}
            size="medium"
            nolink
          />
        </Box>
        <Typography variant="body1" className={classes.confirmationMessage}>
          {texts.confirm_your_registration_for}
        </Typography>
      </Box>

      {showCustomFields && (
        <Box className={classes.customFieldsScrollable}>
          <RegistrationFieldAnswersForm
            ref={answersFormRef}
            fields={project.registration_config!.fields!}
            serverErrors={fieldServerErrors}
            texts={{
              this_field_is_required: texts.this_field_is_required,
              you_must_check_this_box: texts.you_must_check_this_box,
              please_select_an_option: texts.please_select_an_option,
              please_select_inventory_option: texts.please_select_inventory_option,
              please_enter_quantity: texts.please_enter_quantity,
              quantity_available: texts.quantity_available,
              max_per_guest: texts.max_per_guest,
              quantity_exceeds_max: texts.quantity_exceeds_max,
            }}
          />
        </Box>
      )}

      {hasRequiredCustomFields && (
        <Typography variant="caption" color="textSecondary" className={classes.helperText}>
          {texts.required_fields_participation_notice}
        </Typography>
      )}

      {errorMessage && (
        <Typography variant="body2" className={classes.errorText}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );

  const renderUnauthenticatedContent = () => {
    switch (authStep) {
      case "email":
        return (
          <AuthEmailStep
            onUserStatusDetermined={handleUserStatusDetermined}
            hubUrl={project.hubUrl}
            showHeader={false}
          />
        );
      case "password":
        return (
          <AuthPasswordLogin
            email={email}
            onBack={() => setAuthStep("email")}
            onSuccess={() => {
              // signIn() inside AuthPasswordLogin updates UserContext.
              // The modal detects user is present and auto-transitions
              // to the authenticated registration confirmation step.
            }}
            onForgotPassword={() => {
              // Return to email entry; forgot-password flow is not supported inside the modal.
              setAuthStep("email");
            }}
            onSwitchToOtp={() => {
              setIsNewUserOtp(false);
              setAuthStep("otp");
            }}
            hubUrl={project.hubUrl}
            showHeader={false}
          />
        );
      case "otp":
        return (
          <AuthOtp
            email={email}
            onBack={() => setAuthStep("email")}
            onSuccess={() => {
              // signIn() inside AuthOtp updates UserContext.
              // The modal detects user is present and auto-transitions
              // to the authenticated registration confirmation step.
            }}
            hubUrl={project.hubUrl}
            showHeader={false}
            userType={isNewUserOtp ? "new" : "returning"}
          />
        );
      case "signup":
        return (
          <AuthSignupStep
            email={email}
            onBack={() => setAuthStep("email")}
            onSignupComplete={() => {
              setIsNewUserOtp(true);
              setAuthStep("otp");
            }}
            hubUrl={project.hubUrl}
            skipInterests={true}
            showHeader={false}
            isEventSignup={true}
          />
        );
      default:
        return null;
    }
  };

  const renderSuccessContent = () => (
    <Box className={classes.confirmationContainer}>
      <CheckCircleOutlineIcon className={classes.successIcon} />
      <Typography variant="h6">{texts.youre_registered}</Typography>
      <Typography variant="body1" className={classes.confirmationText}>
        {texts.a_confirmation_email_has_been_sent}
      </Typography>
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
    </Box>
  );

  const renderActions = () => {
    if (state === "success") {
      return (
        <Button onClick={handleClose} variant="contained" color="primary">
          {texts.close}
        </Button>
      );
    }
    if (state === "error") {
      return (
        <>
          <Button onClick={handleClose} variant="outlined">
            {texts.close}
          </Button>
          <Button onClick={() => setState("initial")} variant="contained" color="primary">
            {texts.try_again}
          </Button>
        </>
      );
    }
    if (user) {
      return (
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
      );
    }
    // Unauthenticated auth-flow steps have their own submit buttons
    return null;
  };

  const actions = renderActions();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle className={classes.dialogTitle}>
        <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <Typography className={classes.titleText}>{texts.register_for_event}</Typography>
      </DialogTitle>

      <DialogContent dividers className={classes.dialogContent}>
        <Box className={classes.modalContent}>
          {(project.name || eventDateText) && (
            <Box className={classes.eventSubheader}>
              {project.name && <Typography variant="body2">{project.name}</Typography>}
              {eventDateText && (
                <Typography variant="body2" className={classes.eventDateLine}>
                  {eventDateText}
                </Typography>
              )}
            </Box>
          )}
          {renderContent()}
        </Box>
      </DialogContent>

      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
