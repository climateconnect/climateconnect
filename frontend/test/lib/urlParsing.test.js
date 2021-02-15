import { buildUrlEndingFromFilters } from "../../public/lib/urlParsing";

describe.only("lib", () => {
  describe("buildUrlEndingFromFilters", () => {
    it("doesn't build an empty filter", () => {
      expect(buildUrlEndingFromFilters({})).toBeUndefined;
    });

    it("builds basic query param", () => {
      const stubFilters = {
        country: "Afghanistan",
        city: "",
        status: ["In Progress"],
        organization_type: [],
        category: "",
        collaboration: "",
        skills: ["Crafts", "Storytelling"],
      };
      const queryParam = buildUrlEndingFromFilters(stubFilters);
      expect(queryParam).toBe(
        "&country%3DAfghanistan%26status%3DIn%20Progress%26skills%3DCrafts%2CStorytelling%26"
      );
    });

    it("properly escapes entries with multiple forward slashes (/)", () => {
      const stubFilters = {
        category: ["Gastronomy/Catering/Test"],
      };
      const queryParam = buildUrlEndingFromFilters(stubFilters);
      expect(queryParam).toBe("&category%3DGastronomy%2FCatering%2FTest%26");
    });

    it("properly escapes entries with forward slashes (/) and ampersands (&)", () => {
      const stubFilters = {
        category: ["Gastronomy/Catering/Test&More"],
      };
      const queryParam = buildUrlEndingFromFilters(stubFilters);
      expect(queryParam).toBe("&category%3DGastronomy%2FCatering%2FTest%26More%26");
    });
  });
});
