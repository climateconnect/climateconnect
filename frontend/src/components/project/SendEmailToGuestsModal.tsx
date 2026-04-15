import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles<Theme>((theme) => ({
  field: {
    marginBottom: theme.spacing(2),
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: "0.875rem",
    marginTop: theme.spacing(0.5),
  },
  confirmationBox: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(3, 0, 1),
  },
  confirmStepBox: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  confirmInfoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
  testSuccessAlert: {
    marginBottom: theme.spacing(2),
  },
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * "idle"       — compose form, ready for input
 * "confirming" — pre-send confirmation step (no API call yet)
 * "sent_all"   — bulk send completed, success view
 */
type SendState = "idle" | "confirming" | "sent_all";

type FormErrors = {
  subject?: string;
  message?: string;
  general?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  project: Project;
  /** Number of currently active (non-cancelled) registered guests. Used in the
   *  confirmation step to show how many people will receive the email. */
  activeGuestCount: number;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SendEmailToGuestsModal({
  open,
  onClose,
  project,
  activeGuestCount,
}: Props) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const token = new Cookies().get("auth_token");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [sendState, setSendState] = useState<SendState>("idle");
  // True while any async API call is in flight (test send or bulk confirm send).
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  // Non-null when a test send has just succeeded; cleared on next send or modal open.
  const [testSentToEmail, setTestSentToEmail] = useState<string | null>(null);

  // Reset form every time the modal is opened.
  useEffect(() => {
    if (open) {
      setSubject("");
      setMessage("");
      setErrors({});
      setSendState("idle");
      setIsSending(false);
      setSentCount(0);
      setTestSentToEmail(null);
    }
  }, [open]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!subject.trim()) newErrors.subject = texts.email_subject_required;
    if (!message.trim()) newErrors.message = texts.email_message_required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /** "Send now" — validate and advance to the confirmation step (no API call). */
  const handleSendNowClick = () => {
    if (!validate()) return;
    setTestSentToEmail(null);
    setSendState("confirming");
  };

  /** "Back" from the confirmation step — return to the compose form. */
  const handleBackToForm = () => {
    setSendState("idle");
  };

  /** "Confirm and send" — dispatch the bulk send API call. */
  const handleConfirmSend = async () => {
    setIsSending(true);
    setErrors({});

    try {
      const resp = await apiRequest({
        method: "post",
        url: `/api/projects/${project.url_slug}/registrations/email/`,
        payload: { subject, message, is_test: false },
        token,
        locale,
      });
      setSentCount(resp.data.sent_count as number);
      setSendState("sent_all");
    } catch (err: any) {
      // Return to the compose form so the organiser can fix or retry.
      setSendState("idle");
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const apiErrors: FormErrors = {};
        if (data.subject) {
          apiErrors.subject = Array.isArray(data.subject) ? data.subject[0] : data.subject;
        }
        if (data.message) {
          apiErrors.message = Array.isArray(data.message) ? data.message[0] : data.message;
        }
        if (data.detail || data.non_field_errors) {
          apiErrors.general = data.detail ?? data.non_field_errors?.[0];
        }
        setErrors(apiErrors);
      } else {
        setErrors({ general: String(err?.message ?? "Unknown error") });
      }
    } finally {
      setIsSending(false);
    }
  };

  /** "Send test to myself" — bypasses the confirmation step entirely. */
  const handleTestSend = async () => {
    if (!validate()) return;

    setIsSending(true);
    setErrors({});
    setTestSentToEmail(null);

    try {
      await apiRequest({
        method: "post",
        url: `/api/projects/${project.url_slug}/registrations/email/`,
        payload: { subject, message, is_test: true },
        token,
        locale,
      });
      setTestSentToEmail(user?.email ?? "");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const apiErrors: FormErrors = {};
        if (data.subject) {
          apiErrors.subject = Array.isArray(data.subject) ? data.subject[0] : data.subject;
        }
        if (data.message) {
          apiErrors.message = Array.isArray(data.message) ? data.message[0] : data.message;
        }
        if (data.detail || data.non_field_errors || data.message) {
          apiErrors.general = data.detail ?? data.non_field_errors?.[0] ?? data.message;
        }
        setErrors(apiErrors);
      } else {
        setErrors({ general: String(err?.message ?? "Unknown error") });
      }
    } finally {
      setIsSending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <GenericDialog open={open} onClose={onClose} title={texts.send_email_to_guests} maxWidth="sm">
      {sendState === "sent_all" ? (
        // ── Success view ─────────────────────────────────────────────────────
        <>
          <Box className={classes.confirmationBox}>
            <CheckCircleOutlineIcon color="success" aria-hidden="true" />
            <Typography color="success.main">
              {texts.email_sent_to_guests.replace("{count}", String(sentCount))}
            </Typography>
          </Box>

          <Box className={classes.actionRow}>
            <Button variant="contained" color="primary" onClick={onClose}>
              {texts.close}
            </Button>
          </Box>
        </>
      ) : sendState === "confirming" ? (
        // ── Confirmation step ────────────────────────────────────────────────
        <Box className={classes.confirmStepBox} role="region" aria-label={texts.confirm_and_send}>
          <Box className={classes.confirmInfoRow}>
            <InfoOutlinedIcon color="info" fontSize="small" aria-hidden="true" sx={{ mt: 0.25 }} />
            <Typography>
              {texts.email_confirmation_recipients.replace("{count}", String(activeGuestCount))}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {texts.email_confirmation_admin_cc}
          </Typography>

          <Box className={classes.actionRow}>
            <Button variant="outlined" onClick={handleBackToForm} disabled={isSending}>
              {texts.back}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmSend}
              disabled={isSending}
              startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : undefined}
              aria-label={texts.confirm_and_send}
            >
              {isSending ? texts.sending : texts.confirm_and_send}
            </Button>
          </Box>
        </Box>
      ) : (
        // ── Compose form ─────────────────────────────────────────────────────
        <>
          {/* Inline success notice after a test send */}
          <Collapse in={testSentToEmail !== null} unmountOnExit>
            <Alert severity="success" className={classes.testSuccessAlert}>
              {texts.test_email_sent_to.replace("{email}", testSentToEmail ?? "")}
            </Alert>
          </Collapse>

          <Box className={classes.field}>
            <TextField
              fullWidth
              variant="outlined"
              label={texts.email_subject}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              inputProps={{ maxLength: 200 }}
              error={!!errors.subject}
              helperText={errors.subject}
              required
              disabled={isSending}
              aria-label={texts.email_subject}
            />
          </Box>

          <Box className={classes.field}>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              label={texts.email_message}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              inputProps={{ maxLength: 5000 }}
              error={!!errors.message}
              helperText={errors.message}
              required
              disabled={isSending}
              aria-label={texts.email_message}
            />
          </Box>

          {errors.general && (
            <Typography className={classes.errorText} role="alert">
              {errors.general}
            </Typography>
          )}

          <Box className={classes.actionRow}>
            <Button variant="outlined" onClick={onClose} disabled={isSending}>
              {texts.cancel}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleTestSend}
              disabled={isSending}
              startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : undefined}
              aria-label={texts.send_test_to_myself}
            >
              {isSending ? texts.sending : texts.send_test_to_myself}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSendNowClick}
              disabled={isSending}
              aria-label={texts.send_now}
            >
              {texts.send_now}
            </Button>
          </Box>
        </>
      )}
    </GenericDialog>
  );
}
