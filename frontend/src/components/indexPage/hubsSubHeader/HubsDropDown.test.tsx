import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const testTheme = createTheme({
  palette: {
    primary: { main: "#207178", contrastText: "#ffffff" },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

const mockRouter = { pathname: "/browse", asPath: "/browse" };

jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

// Note: no jest.mock for UserContext — we use the real UserContext.Provider
// in the renderDropdown wrapper below.

jest.mock("../../header/DropDownList", () => ({
  __esModule: true,
  default: ({ items }: { items: { href: string; text: string }[] }) => (
    <ul data-testid="dropdown-list">
      {items.map((it) => (
        <li key={it.href}>
          <a href={it.href}>{it.text}</a>
        </li>
      ))}
    </ul>
  ),
}));

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

import HubsDropDown from "./HubsDropDown";
import UserContext from "../../context/UserContext";

const userContextValue: any = {
  locale: "en",
  user: null,
};

const hubs = [
  { name: "Kassel", url_slug: "kassel", landing_page_component: null },
  { name: "Prio1", url_slug: "prio1", landing_page_component: "SomeComponent" },
];

function setPathname(pathname: string) {
  mockRouter.pathname = pathname;
  mockRouter.asPath = pathname;
}

function renderDropdown(props: any) {
  return render(
    <ThemeProvider theme={testTheme}>
      <UserContext.Provider value={userContextValue}>
        <HubsDropDown
          open
          hubs={hubs}
          label="Alle Hubs"
          isNarrowScreen={false}
          onToggleOpen={() => undefined}
          onOpen={() => undefined}
          onClose={() => undefined}
          addLocationHubExplainerLink
          {...props}
        />
      </UserContext.Provider>
    </ThemeProvider>
  );
}

function getHrefs(): string[] {
  return Array.from(document.querySelectorAll("li a")).map((a) => a.getAttribute("href")!);
}

describe("HubsDropDown href rewriting", () => {
  beforeEach(() => {
    setPathname("/browse");
  });

  it("links to /hubs/<hub>/browse on the projects page", () => {
    setPathname("/browse");
    renderDropdown({ activeEntry: "projects" });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/browse");
    expect(hrefs).toContain("/hubs/prio1/browse");
    // No "/events" entries
    expect(hrefs.some((h) => h.endsWith("/events"))).toBe(false);
  });

  it("links to /hubs/<hub>/organizations on the organizations page", () => {
    setPathname("/hubs/kassel/organizations");
    renderDropdown({ activeEntry: "organizations" });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/organizations");
    expect(hrefs).toContain("/hubs/prio1/organizations");
  });

  it("links to /hubs/<hub>/members on the members page", () => {
    setPathname("/hubs/kassel/members");
    renderDropdown({ activeEntry: "members" });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/members");
    expect(hrefs).toContain("/hubs/prio1/members");
  });

  it("links to /hubs/<hub>/events on the events page (any pathname ending in /events)", () => {
    setPathname("/events");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/events");
    expect(hrefs).toContain("/hubs/prio1/events");
  });

  it("links to /hubs/<hub>/events on hub events pages", () => {
    setPathname("/hubs/kassel/events");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/events");
    expect(hrefs).toContain("/hubs/prio1/events");
  });

  it("links to /hubs/<hub>/events on sub-hub events pages", () => {
    setPathname("/hubs/erlangen/zerowaste/events");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/events");
    expect(hrefs).toContain("/hubs/prio1/events");
  });

  it("links to /hubs/<hub>/browse when activeEntry is null and pathname is not events", () => {
    setPathname("/about");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/hubs/kassel/browse");
  });

  it("links to the hub's landing page (when present) for logged-out users on non-browse pages", () => {
    setPathname("/about");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    // prio1 has a landing_page_component, so the dropdown offers the landing
    // page (not the browse page) to logged-out users.
    expect(hrefs).toContain("/hubs/prio1");
    expect(hrefs).not.toContain("/hubs/prio1/browse");
  });

  it("the all-locations link points to the current page's global equivalent", () => {
    setPathname("/hubs/kassel/organizations");
    renderDropdown({ activeEntry: "organizations" });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/organizations");
  });

  it("the all-locations link points to /events when on the events page", () => {
    setPathname("/events");
    renderDropdown({ activeEntry: null });
    const hrefs = getHrefs();
    expect(hrefs).toContain("/events");
  });
});
