import { yearAndDayFormatter } from "../../src/utils/formatting";

describe.only("utils", () => {
  describe("formatting", () => {
    // Note that we're testing our thin wrapper on
    // top of the underlying date calculation logic
    // in react-timeago.

    it("should use the defaultFormatter logic for dates not over a year", () => {
      expect(yearAndDayFormatter(1, "week", "ago")).toBe("1 week ago");
    });

    // To test this, we don't want to calculate "time ago"
    // from the default "Today" (Date.now()) -- we need to introduce
    // a fixed reference time to perform the calcualtion.
    it("should handle year and days correctly yaer", () => {
      const msSinceEpochFromFixedDate = new Date("2021-01-29T21:34:45.246Z").getTime();
      const msSinceEpochFromYearAgo = new Date("2020-01-10T22:17:38.387858Z").getTime();
      const fixedElapsedMs = msSinceEpochFromFixedDate - msSinceEpochFromYearAgo;

      expect(yearAndDayFormatter(1, "year", null, fixedElapsedMs)).toBe("1 year and 20 days ago");
    });
  });
});
