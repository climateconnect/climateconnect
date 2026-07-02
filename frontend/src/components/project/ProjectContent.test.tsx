import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import ProjectContent from "./ProjectContent";

const defaultContext = {
  locale: "en" as any,
  user: null,
  locales: [],
  pathName: "/",
  donationGoals: [],
  CUSTOM_HUB_URLS: [],
};

const mockCreator = {
  id: 1,
  name: "Test Org",
  url_slug: "test-org",
  thumbnail_image: null,
  image: null,
  biography: "",
};

const baseProject = {
  isPersonalProject: false,
  description_html: null as string | null,
  description: null as string | null,
  project_type: { type_id: "project", name: "Project" },
  collaborating_organizations: [],
  parent_project_id: null,
  creation_date: "2024-01-01T00:00:00Z",
  start_date: "2024-01-01T00:00:00Z",
  end_date: null,
  timeline_posts: [],
  devlink_component: null,
  url_slug: "test-project",
  is_online: false,
  creator: mockCreator,
};

function renderProjectContent(projectOverrides = {}) {
  const project = { ...baseProject, ...projectOverrides };
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={defaultContext as any}>
        <ProjectContent
          discussionTabLabel=""
          handleTabChange={jest.fn()}
          latestParentComment={[]}
          leaveProject={jest.fn()}
          project={project}
          projectTabsRef={{ current: null }}
          typesByTabValue={{}}
          showRequesters={false}
          toggleShowRequests={jest.fn()}
          handleSendProjectJoinRequest={jest.fn()}
          requestedToJoinProject={false}
          hubUrl={undefined}
          eventRegistration={null}
          onEventRegistrationUpdated={jest.fn()}
          onMembersRefreshed={jest.fn()}
        />
      </UserContext.Provider>
    </ThemeProvider>
  );
}

describe("ProjectContent", () => {
  describe("description rendering", () => {
    it('shows "no description" placeholder when description_html is null', () => {
      renderProjectContent({ description_html: null });
      expect(screen.getByText(/hasn't added a description yet/)).toBeInTheDocument();
    });

    it('shows "no description" placeholder when description_html is empty', () => {
      renderProjectContent({ description_html: "" });
      expect(screen.getByText(/hasn't added a description yet/)).toBeInTheDocument();
    });

    it("renders description_html content directly", () => {
      renderProjectContent({
        description_html: "<p>Hello <strong>world</strong></p>",
      });
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("renders YouTube iframe from description_html", () => {
      const html =
        '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="480"></iframe></div>';
      renderProjectContent({ description_html: html });
      const iframe = document.querySelector("iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe?.src).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    });
  });

  describe("show more / show less", () => {
    it('shows "show more" button when description is present', () => {
      renderProjectContent({
        description_html: "<p>" + "a".repeat(1000) + "</p>",
      });
      expect(screen.getByText(/show more/i)).toBeInTheDocument();
    });

    it('toggles to "show less" after clicking "show more"', () => {
      renderProjectContent({
        description_html: "<p>" + "a".repeat(1000) + "</p>",
      });
      fireEvent.click(screen.getByText(/show more/i));
      expect(screen.getByText(/show less/i)).toBeInTheDocument();
    });

    it("shows toggle for any description present", () => {
      renderProjectContent({
        description_html: "<p>Short</p>",
      });
      expect(screen.queryByText(/show more/i)).toBeInTheDocument();
    });
  });
});
