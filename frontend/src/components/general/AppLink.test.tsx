import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppLink from "./AppLink";
import { HubContext, HubContextValue } from "../context/HubContext";

const mockUseRouter = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => mockUseRouter(),
}));

// Render `next/link` as a plain anchor so we can assert the resolved href that
// `AppLink` passes down (and confirm no `locale` prop leaks through).
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : JSON.stringify(href)} {...rest}>
      {children}
    </a>
  ),
}));

const setLocale = (locale = "en") => mockUseRouter.mockReturnValue({ locale });

const renderAppLink = (props: React.ComponentProps<typeof AppLink>, hubUrl = "") => {
  const value = { hubUrl } as HubContextValue;
  render(
    <HubContext.Provider value={value}>
      <AppLink {...props}>link</AppLink>
    </HubContext.Provider>
  );
  return screen.getByText("link") as HTMLAnchorElement;
};

describe("AppLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setLocale("en");
  });

  it("appends ?hub= for a Category A internal link", () => {
    const link = renderAppLink({ href: "/projects/foo" }, "erlangen");
    expect(link).toHaveAttribute("href", "/projects/foo?hub=erlangen");
  });

  it("does not append ?hub= when leaveHub is set (Category B)", () => {
    const link = renderAppLink({ href: "/about", leaveHub: true }, "erlangen");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("does not append ?hub= when no hub is active", () => {
    const link = renderAppLink({ href: "/projects/foo" }, "");
    expect(link).toHaveAttribute("href", "/projects/foo");
  });

  it("applies the locale prefix for a relative href (de)", () => {
    setLocale("de");
    const link = renderAppLink({ href: "/projects/foo" }, "erlangen");
    expect(link).toHaveAttribute("href", "/de/projects/foo?hub=erlangen");
  });

  it("applies no locale prefix for en", () => {
    setLocale("en");
    const link = renderAppLink({ href: "/projects/foo" }, "erlangen");
    expect(link).toHaveAttribute("href", "/projects/foo?hub=erlangen");
  });

  it("leaves absolute/external URLs untouched", () => {
    const link = renderAppLink({ href: "https://example.com/x?y=1#z" }, "erlangen");
    expect(link).toHaveAttribute("href", "https://example.com/x?y=1#z");
  });

  it("preserves the anchor and places ?hub= before the fragment", () => {
    const link = renderAppLink({ href: "/chat/abc#comments" }, "erlangen");
    expect(link).toHaveAttribute("href", "/chat/abc?hub=erlangen#comments");
  });

  it("joins an existing query string with & (never a second ?)", () => {
    const link = renderAppLink({ href: "/projects/foo?tab=about" }, "erlangen");
    expect(link).toHaveAttribute("href", "/projects/foo?tab=about&hub=erlangen");
  });

  it("does not append ?hub= for a hub route already conveying the hub", () => {
    const link = renderAppLink({ href: "/hubs/erlangen" }, "erlangen");
    expect(link).toHaveAttribute("href", "/hubs/erlangen");
  });

  it("forwards other next/link props unchanged", () => {
    const link = renderAppLink(
      { href: "/projects/foo", className: "my-link", id: "the-link" },
      "erlangen"
    );
    expect(link).toHaveAttribute("href", "/projects/foo?hub=erlangen");
    expect(link).toHaveClass("my-link");
    expect(link).toHaveAttribute("id", "the-link");
  });

  it("forwards a UrlObject href unchanged", () => {
    const link = renderAppLink({ href: { pathname: "/projects/foo" } }, "erlangen");
    expect(link).toHaveAttribute("href", JSON.stringify({ pathname: "/projects/foo" }));
  });
});
