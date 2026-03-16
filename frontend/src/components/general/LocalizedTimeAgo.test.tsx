/**
 * Unit tests for LocalizedTimeAgo component
 * Tests both English and German formatting for past and future dates
 */

import React from "react";
import { render } from "@testing-library/react";
import LocalizedTimeAgo from "./LocalizedTimeAgo";
import UserContext from "../context/UserContext";

// Mock UserContext to control locale in tests
const mockUserContext = (locale: string) =>
  ({
    locale,
    user: null,
    locales: ["en", "de"],
    donationGoals: [],
    hubUrl: "",
  } as any);

describe("LocalizedTimeAgo component", () => {
  // Mock Date.now() to return a fixed timestamp for consistent testing
  const mockNow = new Date("2026-01-06T12:00:00Z").getTime();

  beforeAll(() => {
    jest.spyOn(Date, "now").mockImplementation(() => mockNow);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("English formatting - past dates", () => {
    it("should format exactly 1 year ago (no extra days)", () => {
      const oneYearAgo = new Date("2025-01-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneYearAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year ago");
    });

    it("should format 1 year and 15 days ago", () => {
      const oneYearAnd15DaysAgo = new Date("2024-12-22T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneYearAnd15DaysAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year and 15 days ago");
    });

    it("should format 1 year and 1 day ago (singular day)", () => {
      const oneYearAnd1DayAgo = new Date("2025-01-05T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneYearAnd1DayAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year and 1 day ago");
    });

    it("should format multiple years with days ago (plural years and days)", () => {
      const pastDate = new Date("2023-12-03T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={pastDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toMatch(/^2 years and \d+ days ago$/);
      expect(container.textContent).toContain("years");
      expect(container.textContent).toContain("days");
    });

    it("should format multiple years with days ago", () => {
      const pastDate = new Date("2023-01-03T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={pastDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toMatch(/^3 years and \d+ days? ago$/);
      expect(container.textContent).toContain("years");
    });
  });

  describe("English formatting - future dates", () => {
    it("should format 1 year from now", () => {
      const oneYearFromNow = new Date("2027-01-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneYearFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toContain("year");
    });
  });

  describe("English formatting - other time units", () => {
    it("should format 1 month ago (singular)", () => {
      const oneMonthAgo = new Date("2025-12-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneMonthAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 month ago");
    });

    it("should format 3 months ago (plural)", () => {
      const threeMonthsAgo = new Date("2025-10-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={threeMonthsAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("3 months ago");
    });

    it("should format 1 week ago (singular)", () => {
      const oneWeekAgo = new Date("2025-12-30T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneWeekAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 week ago");
    });

    it("should format 2 weeks ago (plural)", () => {
      const twoWeeksAgo = new Date("2025-12-23T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={twoWeeksAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("2 weeks ago");
    });

    it("should format 1 day ago (singular)", () => {
      const oneDayAgo = new Date("2026-01-05T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneDayAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 day ago");
    });

    it("should format 5 days ago (plural)", () => {
      const fiveDaysAgo = new Date("2026-01-01T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={fiveDaysAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("5 days ago");
    });

    it("should format 1 hour ago (singular)", () => {
      const oneHourAgo = new Date("2026-01-06T11:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={oneHourAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 hour ago");
    });

    it("should format 12 hours ago (plural)", () => {
      const twelveHoursAgo = new Date("2026-01-06T00:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={twelveHoursAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("12 hours ago");
    });
  });

  describe("English formatting - future time units", () => {
    it("should format 3 months from now", () => {
      const threeMonthsFromNow = new Date("2026-04-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={threeMonthsFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("3 months from now");
    });

    it("should format 2 days from now", () => {
      const twoDaysFromNow = new Date("2026-01-08T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={twoDaysFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("2 days from now");
    });

    it("should format 5 hours from now", () => {
      const fiveHoursFromNow = new Date("2026-01-06T17:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={fiveHoursFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("5 hours from now");
    });
  });

  describe("German formatting - past dates", () => {
    it("should format exactly 1 year ago (no extra days)", () => {
      const oneYearAgo = new Date("2025-01-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneYearAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Jahr");
    });

    it("should format 1 year and 15 days ago", () => {
      const oneYearAnd15DaysAgo = new Date("2024-12-22T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneYearAnd15DaysAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("Vor 1 Jahr und 15 Tagen");
    });

    it("should format 1 year and 1 day ago (singular day)", () => {
      const oneYearAnd1DayAgo = new Date("2025-01-05T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneYearAnd1DayAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("Vor 1 Jahr und 1 Tag");
    });

    it("should format multiple years with days ago in German (plural)", () => {
      const pastDate = new Date("2023-12-03T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={pastDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toMatch(/^Vor 2 Jahren und \d+ Tagen$/);
      expect(container.textContent).toContain("Jahren");
      expect(container.textContent).toContain("Tagen");
    });

    it("should format multiple years with days ago in German", () => {
      const pastDate = new Date("2023-01-03T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={pastDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toMatch(/^Vor 3 Jahren und \d+ Tagen?$/);
      expect(container.textContent).toContain("Jahren");
    });
  });

  describe("German formatting - other time units", () => {
    it("should format 1 month ago (singular)", () => {
      const oneMonthAgo = new Date("2025-12-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneMonthAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Monat");
    });

    it("should format 3 months ago (plural)", () => {
      const threeMonthsAgo = new Date("2025-10-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={threeMonthsAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 3 Monaten");
    });

    it("should format 1 week ago (singular)", () => {
      const oneWeekAgo = new Date("2025-12-30T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneWeekAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Woche");
    });

    it("should format 2 weeks ago (plural)", () => {
      const twoWeeksAgo = new Date("2025-12-23T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={twoWeeksAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 2 Wochen");
    });

    it("should format 1 day ago (singular)", () => {
      const oneDayAgo = new Date("2026-01-05T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneDayAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Tag");
    });

    it("should format 5 days ago (plural)", () => {
      const fiveDaysAgo = new Date("2026-01-01T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={fiveDaysAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 5 Tagen");
    });

    it("should format 1 hour ago (singular)", () => {
      const oneHourAgo = new Date("2026-01-06T11:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneHourAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Stunde");
    });

    it("should format 12 hours ago (plural)", () => {
      const twelveHoursAgo = new Date("2026-01-06T00:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={twelveHoursAgo} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 12 Stunden");
    });
  });

  describe("German formatting - future time units", () => {
    it("should format 3 months from now", () => {
      const threeMonthsFromNow = new Date("2026-04-06T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={threeMonthsFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("in 3 Monaten");
    });

    it("should format 1 day from now (singular)", () => {
      const oneDayFromNow = new Date("2026-01-07T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={oneDayFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("in 1 Tag");
    });

    it("should format 2 days from now", () => {
      const twoDaysFromNow = new Date("2026-01-08T12:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={twoDaysFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("in 2 Tagen");
    });

    it("should format 5 hours from now", () => {
      const fiveHoursFromNow = new Date("2026-01-06T17:00:00Z");
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={fiveHoursFromNow} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("in 5 Stunden");
    });
  });

  describe("Component behavior", () => {
    const testDate = new Date("2025-01-06T12:00:00Z");

    it("should render with English formatter when locale is 'en'", () => {
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={testDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year ago");
    });

    it("should render with German formatter when locale is 'de'", () => {
      const { container } = render(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={testDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Jahr");
    });

    it("should switch formatter when locale changes", () => {
      const { container, rerender } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={testDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year ago");

      rerender(
        <UserContext.Provider value={mockUserContext("de")}>
          <LocalizedTimeAgo date={testDate} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("vor 1 Jahr");
    });

    it("should pass through additional props to TimeAgo", () => {
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={testDate} title="Custom title" />
        </UserContext.Provider>
      );
      const timeElement = container.querySelector("time");
      expect(timeElement).toBeTruthy();
      expect(timeElement?.getAttribute("title")).toBe("Custom title");
    });

    it("should accept date as string", () => {
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date="2025-01-06T12:00:00Z" />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year ago");
    });

    it("should accept date as timestamp number", () => {
      const timestamp = new Date("2025-01-06T12:00:00Z").getTime();
      const { container } = render(
        <UserContext.Provider value={mockUserContext("en")}>
          <LocalizedTimeAgo date={timestamp} />
        </UserContext.Provider>
      );
      expect(container.textContent).toBe("1 year ago");
    });
  });
});
