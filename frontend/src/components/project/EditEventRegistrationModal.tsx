import React, { useContext, useEffect, useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { EventRegistrationData, Project } from "../../types";
import UserContext from "../context/UserContext";
import DatePicker from "../general/DatePicker";
import GenericDialog from "../dialogs/GenericDialog";

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
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: "0.75rem",
    marginTop: theme.spacing(0.5),
  },
  generalError: {
    marginTop: theme.spacing(1),
  },
}));

type FormErrors = {
  max_participants?: string;
  registration_end_date?: string;
  general?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called with the updated EventRegistrationData after a successful PATCH */
  onSaved: (_updated: EventRegistrationData) => void;
  project: Project;
  /** Current event_registration values to pre-fill. Treated as controlled from the outside. */
  eventRegistration: EventRegistrationData;
};

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

  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [registrationEndDate, setRegistrationEndDate] = useState<Dayjs | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

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
      setErrors({});
    }
  }, [open, eventRegistration]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const parsedMax = parseInt(maxParticipants, 10);
    if (!maxParticipants || isNaN(parsedMax) || parsedMax < 1) {
      newErrors.max_participants = texts.max_participants_must_be_greater_than_0;
    }

    if (!registrationEndDate) {
      newErrors.registration_end_date = texts.registration_end_date_required;
    } else {
      if (registrationEndDate.isBefore(dayjs())) {
        newErrors.registration_end_date = texts.registration_end_date_must_be_in_the_future;
      } else if (project.end_date && registrationEndDate.isAfter(dayjs(project.end_date))) {
        newErrors.registration_end_date = texts.registration_end_date_must_be_before_event_end_date;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const resp = await apiRequest({
        method: "patch",
        url: `/api/projects/${project.url_slug}/registration/`,
        payload: {
          max_participants: parseInt(maxParticipants, 10),
          registration_end_date: registrationEndDate!.toISOString(),
        },
        token,
        locale,
      });
      onSaved(resp.data as EventRegistrationData);
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        // Map field-level errors from the API onto the form
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
    <GenericDialog
      open={open}
      onClose={onClose}
      title={texts.edit_registration_settings}
      maxWidth="sm"
    >
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
      </Box>

      {errors.general && (
        <Typography className={`${classes.errorText} ${classes.generalError}`} role="alert">
          {errors.general}
        </Typography>
      )}

      <Box className={classes.actionRow}>
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
      </Box>
    </GenericDialog>
  );
}
