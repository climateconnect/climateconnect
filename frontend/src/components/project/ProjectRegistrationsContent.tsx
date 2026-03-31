import React, { useContext, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import dayjs from "dayjs";

import getTexts from "../../../public/texts/texts";
import { EventRegistrationData, Project } from "../../types";
import UserContext from "../context/UserContext";
import EditEventRegistrationModal from "./EditEventRegistrationModal";

const useStyles = makeStyles((theme) => ({
  settingsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  settingItem: {
    minWidth: 180,
  },
  settingLabel: {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(0.5),
  },
  settingValue: {
    fontWeight: 500,
    fontSize: "1rem",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  editButton: {
    marginBottom: theme.spacing(4),
  },
  placeholderBox: {
    padding: theme.spacing(4),
    textAlign: "center",
    border: `1px dashed ${theme.palette.grey[400]}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
  },
}));

type Props = {
  project: Project;
  eventRegistration: EventRegistrationData | null;
  onEventRegistrationUpdated: (_updated: EventRegistrationData) => void;
};

export default function ProjectRegistrationsContent({
  project,
  eventRegistration,
  onEventRegistrationUpdated,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  const [editModalOpen, setEditModalOpen] = useState(false);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return dayjs(iso).locale(locale).format("DD MMM YYYY, HH:mm");
  };

  if (!eventRegistration) {
    return (
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        {texts.no_registration_settings_found}
      </Typography>
    );
  }

  const isOpen = eventRegistration.status === "open";

  return (
    <>
      {/* Registration settings summary */}
      <Box className={classes.settingsGrid}>
        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.max_participants}</Typography>
          <Typography className={classes.settingValue}>
            {eventRegistration.max_participants ?? "—"}
          </Typography>
        </Box>

        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.registration_end_date}</Typography>
          <Typography className={classes.settingValue}>
            {formatDate(eventRegistration.registration_end_date)}
          </Typography>
        </Box>

        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.registration_status}</Typography>
          <Chip
            size="small"
            label={isOpen ? texts.registration_status_open : texts.registration_status_closed}
            color={isOpen ? "success" : "default"}
            icon={
              isOpen ? (
                <CheckCircleOutlineIcon fontSize="small" />
              ) : (
                <PauseCircleOutlineIcon fontSize="small" />
              )
            }
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<SettingsIcon />}
        className={classes.editButton}
        onClick={() => setEditModalOpen(true)}
        aria-label={texts.edit_registration_settings}
      >
        {texts.edit_registration_settings}
      </Button>

      {/* Placeholder for future registrant list */}
      <Typography variant="h6" component="h2" className={classes.sectionTitle}>
        {texts.registrations}
      </Typography>
      <Box className={classes.placeholderBox}>
        <Typography variant="body2">
          {/* TODO: display registered participants once EventParticipant data is available */}
          Registration list will be shown here in a future release.
        </Typography>
      </Box>

      <EditEventRegistrationModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={onEventRegistrationUpdated}
        project={project}
        eventRegistration={eventRegistration}
      />
    </>
  );
}
