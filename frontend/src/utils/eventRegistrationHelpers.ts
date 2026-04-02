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
 * @returns The text to display on the registration button
 */
export const getRegisterButtonText = (project: Project, texts: any): string => {
  const status = project.registration_config?.status;
  if (status === "open") return texts.register_now;
  if (status === "full") return texts.booked_out;
  return texts.registration_closed;
};

/**
 * Determines if the registration button should be disabled
 * @param project - The project object containing event registration data
 * @returns true if the button should be disabled
 */
export const isRegisterButtonDisabled = (project: Project): boolean => {
  const status = project.registration_config?.status;
  return ["closed", "full"].includes(status || "");
};
