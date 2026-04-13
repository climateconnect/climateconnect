import React from "react";
import { Button, Typography } from "@mui/material";
import { Project } from "../../../types";
import {
  RegistrationUIState,
  getRegisterButtonText,
  isRegisterButtonDisabled,
} from "../../../utils/eventRegistrationHelpers";

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
}: RegistrationActionButtonProps) {
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
        {texts.registration_closed}
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
}
