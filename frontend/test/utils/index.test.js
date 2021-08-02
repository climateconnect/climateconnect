import { yearAndDayFormatter } from "../../src/utils/formatting";

describe("utils", () => {
  describe("formatting", () => {
    // Note that we're testing our thin wrapper on
    // top of the underlying date calculation logic
    // in react-timeago.

    it("should use the defaultFormatter logic for dates not over a year", () => {
      expect(yearAndDayFormatter(1, "week", "ago")).toBe("1 week ago");
    });

    // To test this, we don't want to calculate "time ago"
    // from the default "Today" (Date.now()) -- we use
    // a fixed time to reference.
    it("should handle year and days correctly yaer", () => {
      const fixedStartDateMs = new Date("2020-01-10T22:17:38.387858Z").getTime();
      const fixedNow = () => {
        return new Date("2021-01-29T21:34:45.246Z").getTime();
      };

      expect(yearAndDayFormatter(1, "year", null, fixedStartDateMs, () => {}, fixedNow)).toBe(
        "1 year and 20 days ago"
      );
    });
  });
});
