import React from "react";
import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { Project } from "../../../types";
import {
  RegistrationUIState,
  getRegisterButtonText,
  isRegisterButtonDisabled,
} from "../../../utils/eventRegistrationHelpers";

const useStyles = makeStyles((theme: Theme) => ({
  registrationButtonContainer: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
  },
  seatsText: {
    fontWeight: 500,
    fontSize: 15,
    textAlign: "center",
    marginTop: theme.spacing(0.5),
  },
  seatsNumber: {
    fontWeight: 700,
  },
}));

interface RegistrationActionButtonProps {
  registrationState: RegistrationUIState;
  project: Project;
  texts: any;
  isUserRegistered?: boolean;
  handleRegisterClick?: () => void;
  handleCancelClick?: () => void;
  className?: string;
  /** Rendered when registrationState is "hidden" (no registration config / feature off). */
  fallback?: React.ReactNode;
  /** Whether to show available seats count below the button (like FollowButton pattern) */
  showSeatsCount?: boolean;
  /** Current event registration data (for real-time updates) */
  eventRegistration?: { available_seats: number | null; max_participants: number | null } | null;
}

/**
 * Renders the correct registration button/label for a given UI state.
 * Used by both ProjectOverview (desktop) and ProjectInteractionButtons (mobile)
 * to avoid duplicating the state-switch logic.
 */
export default function RegistrationActionButton({
  registrationState,
  project,
  texts,
  isUserRegistered,
  handleRegisterClick,
  handleCancelClick,
  className,
  fallback = null,
  showSeatsCount = false,
  eventRegistration,
}: RegistrationActionButtonProps) {
  const classes = useStyles();

  // Use eventRegistration if provided (for real-time updates), otherwise fall back to project.registration_config
  const registrationData = eventRegistration ?? project.registration_config;
  const availableSeats = registrationData?.available_seats ?? null;
  const maxParticipants = registrationData?.max_participants ?? null;
  const shouldShowSeats = showSeatsCount && availableSeats !== null && maxParticipants !== null;

  const renderButton = () => {
    if (registrationState === "attended") {
      return (
        <Typography variant="body2" className={className}>
          {texts.you_attended_this_event}
        </Typography>
      );
    }

    if (registrationState === "cancel") {
      return (
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancelClick}
          className={className}
        >
          {texts.cancel_registration}
        </Button>
      );
    }

    if (registrationState === "adminClosed") {
      return (
        <Button variant="outlined" color="secondary" disabled className={className}>
          {texts.booked_out}
        </Button>
      );
    }

    if (registrationState === "register" || registrationState === "closed") {
      return (
        <Button
          variant="contained"
          color={isRegisterButtonDisabled(project, isUserRegistered) ? "secondary" : "primary"}
          disabled={isRegisterButtonDisabled(project, isUserRegistered)}
          onClick={handleRegisterClick}
          className={className}
        >
          {getRegisterButtonText(project, texts, isUserRegistered)}
        </Button>
      );
    }

    // "hidden" — feature disabled, no config, or status === "ended"
    return <>{fallback}</>;
  };

  const renderSeatsInfo = () => {
    if (!shouldShowSeats) return null;

    return (
      <Typography className={classes.seatsText} color="text.primary">
        <span className={classes.seatsNumber}>
          {availableSeats} / {maxParticipants}{" "}
        </span>
        {texts.seats_available}
      </Typography>
    );
  };

  // If showing seats, wrap in container; otherwise just return button
  if (shouldShowSeats && registrationState !== "hidden") {
    return (
      <span className={classes.registrationButtonContainer}>
        {renderButton()}
        {renderSeatsInfo()}
      </span>
    );
  }

  return renderButton();
}
