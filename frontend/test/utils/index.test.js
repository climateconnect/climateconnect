import { yearAndDayFormatter } from "../../src/utils/formatting";

describe.only("utils", () => {
  describe("date-formatting", () => {
    // Note that we're testing our thin wrapper on
    // top of the underlying date calculation logic
    // in react-timeago.
    it("should format year+ dates correctly", () => {
      // Note that "Today" when this was written was
      // Sunday, Jan 10 2021
      const epochMilisecondsFromToday = 1610321600873;
      expect(yearAndDayFormatter(1, "year", null, epochMilisecondsFromToday)).toBe(
        "1 year and 0 days ago"
      );
    });

    it("should use the defaultFormatter logic for dates not over a year", () => {
      expect(yearAndDayFormatter(1, "week", "ago")).toBe("1 week ago");
    });
  });
});
