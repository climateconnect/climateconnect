import { encodeQueryParamsFromFilters, getFilterUrl } from "../../public/lib/urlOperations";

describe.only("lib", () => {
  describe("encodeQueryParamsFromFilters", () => {
    it("doesn't build an empty filter", () => {
      expect(encodeQueryParamsFromFilters({})).toBeUndefined;
    });

    it("does not escape equals", () => {
      const stubFilters = {
        country: "Afghanistan",
        city: "",
        status: ["In Progress"],
        organization_type: [],
        category: "",
        collaboration: "",
        skills: ["Crafts", "Storytelling"],
      };
      const queryParam = encodeQueryParamsFromFilters(stubFilters);
      expect(queryParam).toBe(
        "&country=Afghanistan&status=In%20Progress&skills=Crafts%2CStorytelling&"
      );
    });

    it("properly escapes entries with multiple forward slashes (/)", () => {
      const stubFilters = {
        category: ["Gastronomy/Catering/Test"],
      };
      const queryParam = encodeQueryParamsFromFilters(stubFilters);
      expect(queryParam).toBe("&category=Gastronomy%2FCatering%2FTest&");
    });

    it("properly escapes entries with forward slashes (/) and ampersands (&)", () => {
      const stubFilters = {
        category: ["Gastronomy/Catering/Test&More"],
      };
      const queryParam = encodeQueryParamsFromFilters(stubFilters);
      expect(queryParam).toBe("&category=Gastronomy%2FCatering%2FTest%26More&");
    });
  });

  describe("getFilterUrl", () => {
    it("doesn't drop the hash link fragment ('#') when persisting ", () => {
      const stubFilters = {
        location: "",
        skills: [],
      };

      // Stub window object properties
      delete window.location;
      global.window.location = {};
      global.window.location.origin = "origin";
      global.window.location.pathname = "/browse";
      global.window.location.hash = "#members";

      const newUrl = getFilterUrl(stubFilters);
      expect(newUrl).toBe("origin/browse?&#members");
    });
  });
});
