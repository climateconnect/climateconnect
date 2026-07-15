import { appendQueryParam, withQuery } from "./urlOperations";

describe("appendQueryParam", () => {
  it("appends a query param to a href with no existing query", () => {
    expect(appendQueryParam("/browse", "hub", "erlangen")).toBe("/browse?hub=erlangen");
  });

  it("joins with & when a query already exists", () => {
    expect(appendQueryParam("/projects/foo?tab=about", "hub", "erlangen")).toBe(
      "/projects/foo?tab=about&hub=erlangen"
    );
  });

  it("places the param before the fragment and preserves the anchor", () => {
    expect(appendQueryParam("/chat/abc#comments", "hub", "erlangen")).toBe(
      "/chat/abc?hub=erlangen#comments"
    );
  });

  it("URL-encodes the value in a single place", () => {
    expect(appendQueryParam("/browse", "hub", "erlangen/special")).toBe(
      "/browse?hub=erlangen%2Fspecial"
    );
  });

  it("appends to absolute URLs without dropping the origin", () => {
    expect(appendQueryParam("https://climateconnect.earth/browse", "hub", "erlangen")).toBe(
      "https://climateconnect.earth/browse?hub=erlangen"
    );
  });
});

describe("withQuery", () => {
  it("appends multiple params in order and joins existing query with &", () => {
    expect(withQuery("/browse?x=1", { hub: "erlangen", tab: "about" })).toBe(
      "/browse?x=1&hub=erlangen&tab=about"
    );
  });

  it("preserves an anchor across multiple params", () => {
    expect(withQuery("/chat/abc#comments", { hub: "erlangen" })).toBe(
      "/chat/abc?hub=erlangen#comments"
    );
  });
});
