import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import makeStyles from "@mui/styles/makeStyles";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import {
  EventRegistrationData,
  Project,
  RegistrationField,
  RegistrationFieldOption,
} from "../../types";
import UserContext from "../context/UserContext";
import { useFeatureToggles } from "../featureToggle";
import DatePicker from "../general/DatePicker";
import RegistrationFieldList from "../shareProject/RegistrationFieldList";

const useStyles = makeStyles((theme) => ({
  fieldsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  field: {
    width: 240,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: "0.75rem",
    marginTop: theme.spacing(0.5),
  },
  statusHint: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.75rem",
    color: theme.palette.warning.dark,
  },
  customFieldsSection: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  customFieldsError: {
    color: theme.palette.error.main,
    fontSize: "0.75rem",
    marginTop: theme.spacing(0.5),
  },
}));

type FormErrors = {
  max_participants?: string;
  registration_end_date?: string;
  status?: string;
  general?: string;
  fields?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called with the updated EventRegistrationData after a successful PATCH */
  onSaved: (_updated: EventRegistrationData) => void;
  project: Project;
  /** Current registration_config values to pre-fill. Treated as controlled from the outside. */
  eventRegistration: EventRegistrationData;
};

/** Returns "open" or "closed" as the editable initialiser for any backend status. */
function initSelectedStatus(status: EventRegistrationData["status"]): "open" | "closed" {
  if (status === "closed") return "closed";
  return "open"; // "open", "full" → intent is open; "ended" → doesn't matter, field is hidden
}

export default function EditEventRegistrationModal({
  open,
  onClose,
  onSaved,
  project,
  eventRegistration,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const token = new Cookies().get("auth_token");
  const { isEnabled } = useFeatureToggles();
  const isCustomFieldsEnabled = isEnabled("REGISTRATION_CUSTOM_FIELDS");

  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [registrationEndDate, setRegistrationEndDate] = useState<Dayjs | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"open" | "closed">("open");
  const [notifyAdmins, setNotifyAdmins] = useState<boolean>(true);
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Confirmation dialog for deleting a persisted field
  const [confirmDeleteField, setConfirmDeleteField] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  // Confirmation dialog for deleting a persisted option within a field
  const [confirmDeleteOption, setConfirmDeleteOption] = useState<{
    open: boolean;
    fieldIndex: number | null;
    optionIndex: number | null;
  }>({ open: false, fieldIndex: null, optionIndex: null });

  // Sync form state when modal opens / eventRegistration values change
  useEffect(() => {
    if (open) {
      setMaxParticipants(
        eventRegistration.max_participants != null ? String(eventRegistration.max_participants) : ""
      );
      setRegistrationEndDate(
        eventRegistration.registration_end_date
          ? dayjs(eventRegistration.registration_end_date)
          : null
      );
      setSelectedStatus(initSelectedStatus(eventRegistration.status));
      setNotifyAdmins(eventRegistration.notify_admins);
      setFields(eventRegistration.fields ?? []);
      setErrors({});
    }
  }, [open, eventRegistration]);

  const backendStatus = eventRegistration.status;
  const isStatusEnded = backendStatus === "ended";
  const isStatusFull = backendStatus === "full";

  // Participant count derived from the backend values (not the form field, which may have changed)
  const participantCount =
    eventRegistration.max_participants != null && eventRegistration.available_seats != null
      ? eventRegistration.max_participants - eventRegistration.available_seats
      : 0;

  // "Open" option is only selectable when the form's max_participants creates at least one free seat
  const canSelectOpen =
    !isStatusFull ||
    (parseInt(maxParticipants, 10) > participantCount && !isNaN(parseInt(maxParticipants, 10)));

  const isDraft = !!project.is_draft;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const parsedMax = parseInt(maxParticipants, 10);
    const hasParticipants = maxParticipants !== "";

    if (
      isDraft
        ? hasParticipants && (isNaN(parsedMax) || parsedMax < 1)
        : !hasParticipants || isNaN(parsedMax) || parsedMax < 1
    ) {
      newErrors.max_participants = texts.max_participants_must_be_greater_than_0;
    }

    const hasEndDate = registrationEndDate !== null;

    if (isDraft ? hasEndDate && !registrationEndDate!.isValid() : !hasEndDate) {
      newErrors.registration_end_date = texts.registration_end_date_required;
    } else if (hasEndDate && registrationEndDate!.isValid()) {
      // "must be in the future" only enforced for published projects
      if (!isDraft && registrationEndDate!.isBefore(dayjs())) {
        newErrors.registration_end_date = texts.registration_end_date_must_be_in_the_future;
      } else if (project.end_date && registrationEndDate!.isAfter(dayjs(project.end_date))) {
        newErrors.registration_end_date = texts.registration_end_date_must_be_before_event_end_date;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Delete field confirmation handlers ──────────────────────────────────

  const handleRequestDeleteField = (index: number, _field: RegistrationField) => {
    setConfirmDeleteField({ open: true, index });
  };

  const handleConfirmDeleteField = () => {
    const index = confirmDeleteField.index;
    if (index !== null) {
      setFields((prev) => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
    }
    setConfirmDeleteField({ open: false, index: null });
  };

  const handleCancelDeleteField = () => {
    setConfirmDeleteField({ open: false, index: null });
  };

  // ── Delete option confirmation handlers ──────────────────────────────────

  const handleRequestDeleteOption = (
    fieldIndex: number,
    optionIndex: number,
    _option: RegistrationFieldOption
  ) => {
    setConfirmDeleteOption({ open: true, fieldIndex, optionIndex });
  };

  const handleConfirmDeleteOption = () => {
    const { fieldIndex, optionIndex } = confirmDeleteOption;
    if (fieldIndex !== null && optionIndex !== null) {
      setFields((prev) =>
        prev.map((f, fi) => {
          if (fi !== fieldIndex) return f;
          const updatedOptions = (f.options ?? [])
            .filter((_, oi) => oi !== optionIndex)
            .map((o, i) => ({ ...o, order: i }));
          return { ...f, options: updatedOptions };
        })
      );
    }
    setConfirmDeleteOption({ open: false, fieldIndex: null, optionIndex: null });
  };

  const handleCancelDeleteOption = () => {
    setConfirmDeleteOption({ open: false, fieldIndex: null, optionIndex: null });
  };

  // ── Save handler ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    const payload: Record<string, unknown> = {};

    if (maxParticipants !== "") {
      payload.max_participants = parseInt(maxParticipants, 10);
    }
    if (registrationEndDate !== null) {
      payload.registration_end_date = registrationEndDate.toISOString();
    }
    // Don't send status for "ended" — the backend would reject it;
    // the organiser must extend the date first (which alone moves it out of ended).
    if (!isStatusEnded) {
      payload.status = selectedStatus;
    }
    payload.notify_admins = notifyAdmins;

    if (isCustomFieldsEnabled) {
      payload.fields = fields;
    }

    try {
      const resp = await apiRequest({
        method: "patch",
        url: `/api/projects/${project.url_slug}/registration-config/`,
        payload,
        token,
        locale,
      });
      onSaved(resp.data as EventRegistrationData);
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const apiErrors: FormErrors = {};
        if (data.max_participants) {
          apiErrors.max_participants = Array.isArray(data.max_participants)
            ? data.max_participants[0]
            : data.max_participants;
        }
        if (data.registration_end_date) {
          apiErrors.registration_end_date = Array.isArray(data.registration_end_date)
            ? data.registration_end_date[0]
            : data.registration_end_date;
        }
        if (data.status) {
          apiErrors.status = Array.isArray(data.status) ? data.status[0] : data.status;
        }
        if (data.fields) {
          // Flatten nested field errors into a single displayable string
          const fieldsErr = data.fields;
          if (typeof fieldsErr === "string") {
            apiErrors.fields = fieldsErr;
          } else if (Array.isArray(fieldsErr)) {
            // Extract the first non-empty error message from the nested structure
            const firstMsg = fieldsErr
              .flatMap((fe: any) => {
                if (typeof fe === "string") return [fe];
                if (fe && typeof fe === "object") {
                  return Object.values(fe).flatMap((v: any) =>
                    Array.isArray(v)
                      ? v.map(String)
                      : typeof v === "object" && v !== null
                      ? Object.values(v).map(String)
                      : [String(v)]
                  );
                }
                return [];
              })
              .find(Boolean);
            if (firstMsg) apiErrors.fields = firstMsg;
          }
        }
        if (data.detail || data.non_field_errors) {
          apiErrors.general = data.detail ?? data.non_field_errors?.[0];
        }
        setErrors(apiErrors);
      } else {
        setErrors({ general: String(err?.message ?? "Unknown error") });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-registration-dialog-title"
      >
        <DialogTitle
          id="edit-registration-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
          {texts.edit_registration_settings}
        </DialogTitle>

        <DialogContent dividers>
          <Box className={classes.fieldsRow}>
            <Box className={classes.field}>
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                label={texts.max_participants}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                inputProps={{ min: 1 }}
                error={!!errors.max_participants}
                helperText={errors.max_participants}
                required
                aria-label={texts.max_participants}
              />
            </Box>
            <Box className={classes.field}>
              <DatePicker
                label={texts.registration_end_date}
                enableTime
                date={registrationEndDate}
                handleChange={(val: Dayjs) => setRegistrationEndDate(val)}
                minDate={dayjs()}
                maxDate={project.end_date ? dayjs(project.end_date) : undefined}
                error={errors.registration_end_date as any}
                required
              />
            </Box>

            {/* Status field */}
            <Box className={classes.field}>
              {isStatusEnded ? (
                // "ended" is system-managed — show read-only chip, no select
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "text.secondary",
                    }}
                  >
                    {texts.registration_status}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={texts.registration_status_ended}
                      color="error"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              ) : (
                // "open", "closed", or "full" — show a Switch
                <Box>
                  {isStatusFull && (
                    // Extra chip to communicate the current effective status
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        size="small"
                        label={texts.registration_status_full}
                        color="warning"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedStatus === "open"}
                        onChange={(e) => {
                          // Capacity guard: block turning ON when full and seats not freed
                          if (e.target.checked && !canSelectOpen) return;
                          setSelectedStatus(e.target.checked ? "open" : "closed");
                        }}
                        color="primary"
                        aria-label={texts.registration_status}
                      />
                    }
                    label={
                      selectedStatus === "open"
                        ? texts.registration_is_open
                        : texts.registration_is_closed
                    }
                  />
                  {errors.status && (
                    <Typography className={classes.errorText} role="alert">
                      {errors.status}
                    </Typography>
                  )}
                  {isStatusFull && !canSelectOpen && (
                    <Typography className={classes.statusHint} role="note">
                      {texts.registration_fully_booked_increase_max_participants}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Notify admins toggle */}
          <Box sx={{ width: "100%", mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifyAdmins}
                  onChange={(e) => setNotifyAdmins(e.target.checked)}
                  color="primary"
                  aria-label={texts.notify_admins_on_registration}
                />
              }
              label={texts.notify_admins_on_registration}
            />
          </Box>

          {/* Custom fields section (toggle-gated) */}
          {isCustomFieldsEnabled && (
            <Box className={classes.customFieldsSection}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                {texts.registration_custom_fields}
              </Typography>
              <RegistrationFieldList
                fields={fields}
                onFieldsChange={setFields}
                onRequestDeleteField={handleRequestDeleteField}
                onRequestDeleteOption={handleRequestDeleteOption}
              />
              {errors.fields && (
                <Typography className={classes.customFieldsError} role="alert">
                  {errors.fields}
                </Typography>
              )}
            </Box>
          )}

          {errors.general && (
            <Typography className={classes.errorText} sx={{ mt: 1 }} role="alert">
              {errors.general}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={saving} aria-label={texts.cancel}>
            {texts.cancel}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            aria-label={texts.save}
          >
            {saving ? texts.save + "…" : texts.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete field confirmation dialog */}
      <Dialog
        open={confirmDeleteField.open}
        onClose={handleCancelDeleteField}
        aria-labelledby="confirm-delete-field-title"
      >
        <DialogTitle id="confirm-delete-field-title">
          {texts.confirm_delete_field_title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{texts.confirm_delete_field_body}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteField}>{texts.cancel}</Button>
          <Button onClick={handleConfirmDeleteField} color="error" variant="contained">
            {texts.delete_field}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete option confirmation dialog */}
      <Dialog
        open={confirmDeleteOption.open}
        onClose={handleCancelDeleteOption}
        aria-labelledby="confirm-delete-option-title"
      >
        <DialogTitle id="confirm-delete-option-title">
          {texts.confirm_delete_option_title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{texts.confirm_delete_option_body}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteOption}>{texts.cancel}</Button>
          <Button onClick={handleConfirmDeleteOption} color="error" variant="contained">
            {texts.delete_option}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
