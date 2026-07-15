import { withHub } from "./hubLink";

describe("withHub", () => {
  describe("locale prefix", () => {
    it("applies the locale prefix for a relative href (de)", () => {
      expect(withHub("/browse", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/browse?hub=erlangen"
      );
    });

    it("applies no locale prefix for en", () => {
      expect(withHub("/browse", { locale: "en", hubUrl: "erlangen" })).toBe("/browse?hub=erlangen");
    });

    it("applies the locale prefix without a hub when none is active", () => {
      expect(withHub("/browse", { locale: "de" })).toBe("/de/browse");
    });

    it("does not double-apply an already-present locale prefix", () => {
      expect(withHub("/de/browse", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/browse?hub=erlangen"
      );
    });
  });

  describe("& join", () => {
    it("appends ?hub= with & when a query already exists", () => {
      expect(withHub("/projects/foo?tab=about", { hubUrl: "erlangen" })).toBe(
        "/projects/foo?tab=about&hub=erlangen"
      );
    });
  });

  describe("anchor preservation", () => {
    it("places ?hub= before the fragment and preserves the anchor", () => {
      expect(withHub("/chat/abc#comments", { hubUrl: "erlangen" })).toBe(
        "/chat/abc?hub=erlangen#comments"
      );
    });
  });

  describe("already-present ?hub=", () => {
    it("does not append a second ?hub=", () => {
      expect(withHub("/projects/foo?hub=erlangen", { hubUrl: "erlangen" })).toBe(
        "/projects/foo?hub=erlangen"
      );
    });
  });

  describe("hub-route skip", () => {
    it("skips ?hub= for a hub landing route (no locale prefix)", () => {
      expect(withHub("/hubs/erlangen", { hubUrl: "erlangen" })).toBe("/hubs/erlangen");
    });

    it("skips ?hub= for a hub landing route (with /de prefix)", () => {
      expect(withHub("/de/hubs/erlangen", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/hubs/erlangen"
      );
    });

    it("skips ?hub= for a sub-hub browse route", () => {
      expect(withHub("/hubs/erlangen/zerowaste/browse", { hubUrl: "erlangen" })).toBe(
        "/hubs/erlangen/zerowaste/browse"
      );
    });
  });

  describe("absolute-URL passthrough", () => {
    it("returns external URLs unchanged", () => {
      expect(withHub("https://example.com/x?y=1#z", { hubUrl: "erlangen" })).toBe(
        "https://example.com/x?y=1#z"
      );
    });
  });

  describe("encoding", () => {
    it("URL-encodes the slug in a single place", () => {
      expect(withHub("/browse", { hubUrl: "erlangen/special" })).toBe(
        "/browse?hub=erlangen%2Fspecial"
      );
    });
  });

  describe("no hub active", () => {
    it("returns the href unchanged when no hub is active", () => {
      expect(withHub("/browse", { locale: "de" })).toBe("/de/browse");
      expect(withHub("/browse")).toBe("/browse");
    });

    it("returns the href unchanged when leaveHub is set", () => {
      expect(withHub("/browse", { hubUrl: "erlangen", leaveHub: true })).toBe("/browse");
    });
  });
});
