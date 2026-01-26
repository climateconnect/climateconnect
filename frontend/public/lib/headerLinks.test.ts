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
    const links = getLinks(`/hubs/${hubSlug}`, texts, true, false, true, hubSlug);

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
    const links = getLinks(`/hubs/${hubSlug}/browse`, texts, true, false, true, hubSlug);

    expect(links[0]).toMatchObject({ text: texts.climate_connect });
    expect(links[1]).toMatchObject({
      href: `/hubs/${hubSlug}/`,
      text: texts.about_climatehub,
      showStaticLinksInDropdown: false,
    });
  });

  it("uses global About/Browse labels for non-hub pages", () => {
    const texts = buildTexts();
    const links = getLinks("/projects", texts, false, false, false, undefined);

    expect(links[0]).toMatchObject({ text: texts.browse, showStaticLinksInDropdown: false });
    expect(links[1]).toMatchObject({ text: texts.about, showStaticLinksInDropdown: true });
  });

  it("delegates to custom hub data when available", () => {
    const texts = buildTexts();
    const customLinks = [{ href: "/custom", text: "Custom" }];
    mockedGetCustomHubData.mockReturnValue({ headerLinks: customLinks } as any);

    const links = getLinks("/hubs/prio1", texts, false, true, false, "prio1");

    expect(links).toBe(customLinks);
    expect(mockedGetCustomHubData).toHaveBeenCalledWith({
      hubUrl: "prio1",
      texts,
      path_to_redirect: "/hubs/prio1",
    });
  });

  it("uses custom navigation on the Wasseraktionswochen page", () => {
    const texts = buildTexts();
    const links = getLinks(
      "/hubs/em/wasseraktionswochen",
      texts,
      true,
      false,
      true,
      "em"
    );

    expect(links).toHaveLength(6);
    expect(links[0]).toMatchObject({ href: "/hubs/em/", text: texts.about_climatehub });
    expect(links[1]).toMatchObject({ href: "/donate", text: texts.donate });
    expect(links.find((link) => link.text === texts.share_a_project)).toBeUndefined();
  });
});
