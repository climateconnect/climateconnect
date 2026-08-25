import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Cookies from "universal-cookie";
import dayjs from "dayjs";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import OrganizerMessageEditor, { stripHtml } from "../richText/OrganizerMessageEditor";
import { getLinkBubbleMenuLabels, getTableMenuControlLabels } from "../richText/richTextLabels";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles<Theme>((theme) => ({
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
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
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
  toggleSection: {
    marginBottom: theme.spacing(2),
  },
  toggleHelperText: {
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SendState = "idle" | "confirming" | "sent_all";

type FormErrors = {
  subject?: string;
  message?: string;
  general?: string;
};

type RegistrationRow = {
  id: number;
  registered_at: string;
  cancelled_at: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  project: Project;
  activeGuestCount: number;
  lastGuestEmailSentAt: string | null;
  registrations: RegistrationRow[];
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SendEmailToGuestsModal({
  open,
  onClose,
  project,
  activeGuestCount,
  lastGuestEmailSentAt,
  registrations,
}: Props) {
  const classes = useStyles();
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const token = new Cookies().get("auth_token");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [sendState, setSendState] = useState<SendState>("idle");
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [testSentToEmail, setTestSentToEmail] = useState<string | null>(null);
  const [sendToNewGuestsOnly, setSendToNewGuestsOnly] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject("");
      setMessage("");
      setErrors({});
      setSendState("idle");
      setIsSending(false);
      setSentCount(0);
      setTestSentToEmail(null);
      setSendToNewGuestsOnly(false);
    }
  }, [open]);

  // ---------------------------------------------------------------------------
  // New-guests-only logic
  // ---------------------------------------------------------------------------

  const { showToggle, newGuestCount, formattedDate } = useMemo(() => {
    if (!lastGuestEmailSentAt) {
      return { showToggle: false, newGuestCount: 0, formattedDate: "" };
    }
    const cutoff = new Date(lastGuestEmailSentAt);
    const count = registrations.filter(
      (r) => r.cancelled_at === null && new Date(r.registered_at) > cutoff
    ).length;
    if (count === 0) {
      return { showToggle: false, newGuestCount: 0, formattedDate: "" };
    }
    const dateStr = dayjs(lastGuestEmailSentAt).locale(locale).format("LL");
    return { showToggle: true, newGuestCount: count, formattedDate: dateStr };
  }, [lastGuestEmailSentAt, registrations, locale]);

  const effectiveRecipientCount = useMemo(() => {
    if (showToggle && sendToNewGuestsOnly) {
      return newGuestCount;
    }
    return activeGuestCount;
  }, [showToggle, sendToNewGuestsOnly, newGuestCount, activeGuestCount]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!subject.trim()) newErrors.subject = texts.email_subject_required;
    if (!stripHtml(message)) newErrors.message = texts.email_message_required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSendNowClick = () => {
    if (!validate()) return;
    setTestSentToEmail(null);
    setSendState("confirming");
  };

  const handleBackToForm = () => {
    setSendState("idle");
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    setErrors({});
    try {
      const payload: Record<string, unknown> = {
        subject,
        message,
        is_test: false,
        send_to_new_guests_only: showToggle && sendToNewGuestsOnly,
      };
      const resp = await apiRequest({
        method: "post",
        url: `/api/projects/${project.url_slug}/registrations/email/`,
        payload,
        token,
        locale,
      });
      setSentCount(resp.data.sent_count as number);
      setSendState("sent_all");
    } catch (err: any) {
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

  const recipientInfoText = useMemo(() => {
    if (showToggle && sendToNewGuestsOnly) {
      return texts.email_new_guests_will_receive
        .replace("{count}", String(newGuestCount))
        .replace("{total}", String(activeGuestCount))
        .replace("{date}", formattedDate);
    }
    return texts.email_all_guests_will_receive.replace("{count}", String(activeGuestCount));
  }, [showToggle, sendToNewGuestsOnly, newGuestCount, activeGuestCount, formattedDate, texts]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle className={classes.dialogTitle}>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        <Typography className={classes.titleText}>{texts.send_email_to_guests}</Typography>
      </DialogTitle>

      <DialogContent dividers className={classes.dialogContent}>
        {sendState === "sent_all" ? (
          <Box className={classes.confirmationBox}>
            <CheckCircleOutlineIcon color="success" aria-hidden="true" />
            <Typography color="success.main">
              {texts.email_sent_to_guests.replace("{count}", String(sentCount))}
            </Typography>
          </Box>
        ) : sendState === "confirming" ? (
          <Box className={classes.confirmStepBox} role="region" aria-label={texts.confirm_and_send}>
            <Box className={classes.confirmInfoRow}>
              <InfoOutlinedIcon
                color="info"
                fontSize="small"
                aria-hidden="true"
                sx={{ mt: 0.25 }}
              />
              <Typography>
                {texts.email_confirmation_recipients.replace(
                  "{count}",
                  String(effectiveRecipientCount)
                )}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {texts.email_confirmation_admin_cc}
            </Typography>
          </Box>
        ) : (
          <>
            <Collapse in={testSentToEmail !== null} unmountOnExit>
              <Alert severity="success" className={classes.testSuccessAlert}>
                {texts.test_email_sent_to.replace("{email}", testSentToEmail ?? "")}
              </Alert>
            </Collapse>

            {showToggle && (
              <Box className={classes.toggleSection}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendToNewGuestsOnly}
                      onChange={(e) => setSendToNewGuestsOnly(e.target.checked)}
                      disabled={isSending}
                      inputProps={{
                        "aria-label": texts.email_send_to_new_guests_only.replace(
                          "{date}",
                          formattedDate
                        ),
                      }}
                    />
                  }
                  label={texts.email_send_to_new_guests_only.replace("{date}", formattedDate)}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className={classes.toggleHelperText}
                >
                  {recipientInfoText}
                </Typography>
              </Box>
            )}

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
              <OrganizerMessageEditor
                content={message}
                onChange={setMessage}
                editable={!isSending}
                error={errors.message}
                ariaLabel={texts.email_message}
                linkBubbleMenuLabels={getLinkBubbleMenuLabels(locale)}
                tableMenuControlLabels={getTableMenuControlLabels(locale)}
                tooltipLabels={{
                  bold: texts.editor_bold,
                  italic: texts.editor_italic,
                  bulletList: texts.editor_bullet_list,
                  orderedList: texts.editor_ordered_list,
                  alignLeft: texts.editor_align_left,
                  alignCenter: texts.editor_align_center,
                  alignRight: texts.editor_align_right,
                  editLink: texts.editor_edit_link,
                  addTable: texts.editor_add_table,
                }}
              />
            </Box>

            {errors.general && (
              <Typography className={classes.errorText} role="alert">
                {errors.general}
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions className={classes.actionRow}>
        {sendState === "sent_all" ? (
          <Button variant="contained" color="primary" onClick={onClose}>
            {texts.close}
          </Button>
        ) : sendState === "confirming" ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
