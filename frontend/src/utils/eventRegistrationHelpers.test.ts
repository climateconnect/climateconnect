/**
 * Unit tests for event registration helper functions
 * Tests the core display logic for the registration button state machine
 */

import {
  shouldShowRegisterButton,
  getRegisterButtonText,
  isRegisterButtonDisabled,
} from "./eventRegistrationHelpers";
import { Project } from "../types";

describe("shouldShowRegisterButton", () => {
  describe("when registration should NOT be shown", () => {
    it("should return false when feature toggle is disabled", () => {
      const project = {
        registration_config: {
          status: "open",
        },
      } as Project;

      const result = shouldShowRegisterButton(false, project);

      expect(result).toBe(false);
    });

    it("should return false when project has no registration_config", () => {
      const project = {} as Project;

      const result = shouldShowRegisterButton(true, project);

      expect(result).toBe(false);
    });

    it('should return false when registration status is "ended"', () => {
      const project = {
        registration_config: {
          status: "ended",
        },
      } as Project;

      const result = shouldShowRegisterButton(true, project);

      expect(result).toBe(false);
    });
  });

  describe("when registration should be shown", () => {
    it('should return true when toggle enabled, config exists, and status is "open"', () => {
      const project = {
        registration_config: {
          status: "open",
        },
      } as Project;

      const result = shouldShowRegisterButton(true, project);

      expect(result).toBe(true);
    });

    it('should return true when toggle enabled, config exists, and status is "full"', () => {
      const project = {
        registration_config: {
          status: "full",
        },
      } as Project;

      const result = shouldShowRegisterButton(true, project);

      expect(result).toBe(true);
    });

    it('should return true when toggle enabled, config exists, and status is "closed"', () => {
      const project = {
        registration_config: {
          status: "closed",
        },
      } as Project;

      const result = shouldShowRegisterButton(true, project);

      expect(result).toBe(true);
    });
  });
});

describe("getRegisterButtonText", () => {
  const mockTexts = {
    register_now: "Register Now",
    booked_out: "Booked Out",
    registration_closed: "Registration Closed",
  };

  it('should return "Register Now" text when status is "open"', () => {
    const project = {
      registration_config: {
        status: "open",
      },
    } as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Register Now");
  });

  it('should return "Booked Out" text when status is "full"', () => {
    const project = {
      registration_config: {
        status: "full",
      },
    } as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Booked Out");
  });

  it('should return "Registration Closed" text when status is "closed"', () => {
    const project = {
      registration_config: {
        status: "closed",
      },
    } as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Registration Closed");
  });

  it('should return "Registration Closed" text when status is "ended"', () => {
    const project = {
      registration_config: {
        status: "ended",
      },
    } as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Registration Closed");
  });

  it('should return "Registration Closed" text when registration_config is undefined', () => {
    const project = {} as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Registration Closed");
  });

  it('should return "Registration Closed" text when status is undefined', () => {
    const project = {
      registration_config: {},
    } as Project;

    const result = getRegisterButtonText(project, mockTexts);

    expect(result).toBe("Registration Closed");
  });
});

describe("isRegisterButtonDisabled", () => {
  it('should return true when status is "closed"', () => {
    const project = {
      registration_config: {
        status: "closed",
      },
    } as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(true);
  });

  it('should return true when status is "full"', () => {
    const project = {
      registration_config: {
        status: "full",
      },
    } as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(true);
  });

  it('should return false when status is "open"', () => {
    const project = {
      registration_config: {
        status: "open",
      },
    } as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(false);
  });

  it('should return false when status is "ended"', () => {
    const project = {
      registration_config: {
        status: "ended",
      },
    } as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(false);
  });

  it("should return false when registration_config is undefined", () => {
    const project = {} as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(false);
  });

  it("should return false when status is undefined", () => {
    const project = {
      registration_config: {},
    } as Project;

    const result = isRegisterButtonDisabled(project);

    expect(result).toBe(false);
  });
});
