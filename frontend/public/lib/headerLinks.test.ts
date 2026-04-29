import { getLinks } from "./headerLinks";
import { getCustomHubData } from "../data/customHubData";

jest.mock("../data/customHubData", () => ({
  getCustomHubData: jest.fn(),
}));

const mockedGetCustomHubData = getCustomHubData as jest.MockedFunction<typeof getCustomHubData>;

const buildTexts = () => ({
  climate_connect: "Climate Connect",
  projects_worldwide: "Projects Worldwide",
  browse: "Browse",
  return_to_climatehub_projects: "Return to hub projects",
  about_climatehub: "About climate hub",
  about: "About",
  donate: "Donate",
  share_a_project: "Share a project",
  inbox: "Inbox",
  log_in: "Log in",
  sign_up: "Sign up",
});

describe("getLinks", () => {
  beforeEach(() => {
    mockedGetCustomHubData.mockReset();
  });

  it("returns landing-page variants for location hubs on their root path", () => {
    const texts = buildTexts();
    const hubSlug = "erlangen";
    const links = getLinks(`/hubs/${hubSlug}`, texts, true, false, true, hubSlug, false);

    expect(links[0]).toMatchObject({
      href: "/browse",
      text: texts.climate_connect,
      showStaticLinksInDropdown: true,
    });
    expect(links[1]).toMatchObject({
      href: `/hubs/${hubSlug}/browse`,
      text: texts.return_to_climatehub_projects,
      showStaticLinksInDropdown: false,
      hideOnStaticPages: true,
    });
  });

  it("falls back to the hub About link when not on the landing route", () => {
    const texts = buildTexts();
    const hubSlug = "erlangen";
    const links = getLinks(`/hubs/${hubSlug}/browse`, texts, true, false, true, hubSlug, false);

    expect(links[0]).toMatchObject({ text: texts.climate_connect });
    expect(links[1]).toMatchObject({
      href: `/hubs/${hubSlug}/`,
      text: texts.about_climatehub,
      showStaticLinksInDropdown: false,
    });
  });

  it("uses global About/Browse labels for non-hub pages", () => {
    const texts = buildTexts();
    const links = getLinks("/projects", texts, false, false, false, undefined, false);

    expect(links[0]).toMatchObject({ text: texts.browse, showStaticLinksInDropdown: false });
    expect(links[1]).toMatchObject({ text: texts.about, showStaticLinksInDropdown: true });
  });

  it("delegates to custom hub data when available", () => {
    const texts = buildTexts();
    const customLinks = [{ href: "/custom", text: "Custom" }];
    mockedGetCustomHubData.mockReturnValue({ headerLinks: customLinks } as any);

    const links = getLinks("/hubs/prio1", texts, false, true, false, "prio1", false);

    expect(links).toBe(customLinks);
    expect(mockedGetCustomHubData).toHaveBeenCalledWith({
      hubUrl: "prio1",
      texts,
      path_to_redirect: "/hubs/prio1",
      isAuthUnificationEnabled: false,
    });
  });

  it("uses custom navigation on the Wasseraktionswochen page", () => {
    const texts = buildTexts();
    const links = getLinks("/hubs/em/wasseraktionswochen", texts, true, false, true, "em", false);

    expect(links).toHaveLength(7);
    expect(links[0]).toMatchObject({ href: "/hubs/em/", text: texts.about_climatehub });
    expect(links[1]).toMatchObject({ href: "/donate", text: texts.donate });
    expect(links[2]).toMatchObject({ href: "/share", text: texts.share_a_project });
  });

  it("returns only login link when AUTH_UNIFICATION is enabled", () => {
    const texts = buildTexts();
    const links = getLinks("/projects", texts, false, false, false, undefined, true);

    const authLinks = links.filter((link) => link.onlyShowLoggedOut);
    expect(authLinks).toHaveLength(1);
    expect(authLinks[0]).toMatchObject({
      href: "/login?redirect=%2Fprojects",
      text: texts.log_in,
    });
  });

  it("returns login link with hub param for location hubs when AUTH_UNIFICATION is enabled", () => {
    const texts = buildTexts();
    const hubSlug = "erlangen";
    const links = getLinks(`/hubs/${hubSlug}/browse`, texts, true, false, true, hubSlug, true);

    const authLinks = links.filter((link) => link.onlyShowLoggedOut);
    expect(authLinks).toHaveLength(1);
    expect(authLinks[0]).toMatchObject({
      href: `/login?redirect=%2Fhubs%2Ferlangen%2Fbrowse&hub=erlangen`,
      text: texts.log_in,
    });
  });

  it("returns login and signup links with hub param for location hubs when AUTH_UNIFICATION is disabled", () => {
    const texts = buildTexts();
    const hubSlug = "erlangen";
    const links = getLinks(`/hubs/${hubSlug}/browse`, texts, true, false, true, hubSlug, false);

    const authLinks = links.filter((link) => link.onlyShowLoggedOut);
    expect(authLinks).toHaveLength(2);
    expect(authLinks[0]).toMatchObject({
      href: `/signin?redirect=%2Fhubs%2Ferlangen%2Fbrowse&hub=erlangen`,
      text: texts.log_in,
    });
    expect(authLinks[1]).toMatchObject({
      href: `/signup?hub=erlangen`,
      text: texts.sign_up,
    });
  });

  it("returns login and signup links without hub param for non-hub pages when AUTH_UNIFICATION is disabled", () => {
    const texts = buildTexts();
    const links = getLinks("/projects", texts, false, false, false, undefined, false);

    const authLinks = links.filter((link) => link.onlyShowLoggedOut);
    expect(authLinks).toHaveLength(2);
    expect(authLinks[0]).toMatchObject({
      href: "/signin?redirect=%2Fprojects",
      text: texts.log_in,
    });
    expect(authLinks[1]).toMatchObject({
      href: "/signup",
      text: texts.sign_up,
    });
  });
});
