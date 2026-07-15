import { appHref } from "./appLink";

describe("appHref", () => {
  describe("locale prefix", () => {
    it("applies the locale prefix for a relative href (de)", () => {
      expect(appHref("/browse", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/browse?hub=erlangen"
      );
    });

    it("applies no locale prefix for en", () => {
      expect(appHref("/browse", { locale: "en", hubUrl: "erlangen" })).toBe("/browse?hub=erlangen");
    });

    it("applies the locale prefix without a hub when none is active", () => {
      expect(appHref("/browse", { locale: "de" })).toBe("/de/browse");
    });

    it("does not double-apply an already-present locale prefix", () => {
      expect(appHref("/de/browse", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/browse?hub=erlangen"
      );
    });
  });

  describe("& join", () => {
    it("appends ?hub= with & when a query already exists", () => {
      expect(appHref("/projects/foo?tab=about", { hubUrl: "erlangen" })).toBe(
        "/projects/foo?tab=about&hub=erlangen"
      );
    });
  });

  describe("anchor preservation", () => {
    it("places ?hub= before the fragment and preserves the anchor", () => {
      expect(appHref("/chat/abc#comments", { hubUrl: "erlangen" })).toBe(
        "/chat/abc?hub=erlangen#comments"
      );
    });
  });

  describe("already-present ?hub=", () => {
    it("does not append a second ?hub=", () => {
      expect(appHref("/projects/foo?hub=erlangen", { hubUrl: "erlangen" })).toBe(
        "/projects/foo?hub=erlangen"
      );
    });
  });

  describe("hub-route skip", () => {
    it("skips ?hub= for a hub landing route (no locale prefix)", () => {
      expect(appHref("/hubs/erlangen", { hubUrl: "erlangen" })).toBe("/hubs/erlangen");
    });

    it("skips ?hub= for a hub landing route (with /de prefix)", () => {
      expect(appHref("/de/hubs/erlangen", { locale: "de", hubUrl: "erlangen" })).toBe(
        "/de/hubs/erlangen"
      );
    });

    it("skips ?hub= for a sub-hub browse route", () => {
      expect(appHref("/hubs/erlangen/zerowaste/browse", { hubUrl: "erlangen" })).toBe(
        "/hubs/erlangen/zerowaste/browse"
      );
    });
  });

  describe("absolute-URL passthrough", () => {
    it("returns external URLs unchanged", () => {
      expect(appHref("https://example.com/x?y=1#z", { hubUrl: "erlangen" })).toBe(
        "https://example.com/x?y=1#z"
      );
    });
  });

  describe("encoding", () => {
    it("URL-encodes the slug in a single place", () => {
      expect(appHref("/browse", { hubUrl: "erlangen/special" })).toBe(
        "/browse?hub=erlangen%2Fspecial"
      );
    });
  });

  describe("no hub active", () => {
    it("returns the href unchanged when no hub is active", () => {
      expect(appHref("/browse", { locale: "de" })).toBe("/de/browse");
      expect(appHref("/browse")).toBe("/browse");
    });

    it("returns the href unchanged when leaveHub is set", () => {
      expect(appHref("/browse", { hubUrl: "erlangen", leaveHub: true })).toBe("/browse");
    });
  });
});
