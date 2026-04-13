import { Project } from "../types";

/**
 * Determines if the event registration button should be displayed
 * @param isEventRegistrationEnabled - Feature flag for event registration
 * @param project - The project object containing event registration data
 * @returns true if registration button should be shown
 */
export const shouldShowRegisterButton = (
  isEventRegistrationEnabled: boolean,
  project: Project
): boolean => {
  return !!(
    isEventRegistrationEnabled &&
    project.registration_config &&
    project.registration_config.status !== "ended"
  );
};

/**
 * Gets the appropriate text label for the registration button based on event status
 * @param project - The project object containing event registration data
 * @param texts - Translation/text object containing button labels
 * @param isUserRegistered - Whether the current user is already registered
 * @returns The text to display on the registration button
 */
export const getRegisterButtonText = (
  project: Project,
  texts: any,
  isUserRegistered?: boolean
): string => {
  if (isUserRegistered) return texts.already_registered;
  const status = project.registration_config?.status;
  if (status === "open") return texts.register_now;
  if (status === "full") return texts.booked_out;
  return texts.registration_closed;
};

/**
 * Determines if the registration button should be disabled
 * @param project - The project object containing event registration data
 * @param isUserRegistered - Whether the current user is already registered
 * @returns true if the button should be disabled
 */
export const isRegisterButtonDisabled = (project: Project, isUserRegistered?: boolean): boolean => {
  if (isUserRegistered) return true;
  const status = project.registration_config?.status;
  return ["closed", "full"].includes(status || "");
};

/**
 * Describes the UI state of the registration button area on the event detail page.
 *
 * Priority order (matches spec):
 *  1. attended   — user had an active registration when the event started
 *  2. cancel     — user is actively registered and event has not yet started
 *  3. adminClosed — user's registration was cancelled by a different user (admin)
 *  4. register   — registration is open and user is not registered
 *  5. closed     — registration is full/closed and user is not registered
 *  6. hidden     — feature disabled, no registration config, or status = "ended"
 */
export type RegistrationUIState =
  | "attended"
  | "cancel"
  | "adminClosed"
  | "register"
  | "closed"
  | "hidden";

/**
 * Returns the registration button area UI state for the event detail page.
 *
 * @param isEventRegistrationEnabled - Feature flag for event registration
 * @param project - The project object containing event registration data
 * @param isUserRegistered - `is_registered` from my_interactions (active, non-cancelled)
 * @param hasAttended - `has_attended` from my_interactions
 * @param adminCancelled - `admin_cancelled` from my_interactions
 */
export const getRegistrationUIState = (
  isEventRegistrationEnabled: boolean,
  project: Project,
  isUserRegistered?: boolean,
  hasAttended?: boolean,
  adminCancelled?: boolean
): RegistrationUIState => {
  if (!isEventRegistrationEnabled || !project.registration_config) return "hidden";

  // Priority 1 — always show attended label, even if status is ended
  if (hasAttended) return "attended";

  if (project.registration_config.status === "ended") return "hidden";

  // Priority 2 — active registration + event not yet started
  if (isUserRegistered) return "cancel";

  // Priority 3 — admin-cancelled member (blocked from re-registering)
  if (adminCancelled) return "adminClosed";

  // Priority 4 / 5 — open or closed registration
  if (project.registration_config.status === "open") return "register";
  return "closed";
};
