import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import WasseraktionswochenEvents, { sortProjectsByStartDate } from "./WasseraktionswochenEvents";

const projectPreviewsMock = jest.fn(({ projects }: { projects: any[] }) => (
  <div data-testid="project-previews">
    {projects.map((project) => (
      <span key={project.url_slug} data-testid="project-slug">
        {project.url_slug}
      </span>
    ))}
  </div>
));

jest.mock("../project/ProjectPreviews", () => ({
  __esModule: true,
  default: (props: any) => projectPreviewsMock(props),
}));

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe("sortProjectsByStartDate", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date("2024-01-10T08:00:00Z"));
  });

  it("prioritizes upcoming projects and sorts within each group", () => {
    const projects = [
      { url_slug: "past-2", start_date: "2024-01-09T09:00:00Z" },
      { url_slug: "upcoming-1", start_date: "2024-01-10T12:00:00Z" },
      { url_slug: "no-date", start_date: null },
      { url_slug: "upcoming-2", start_date: "2024-01-11T09:00:00Z" },
      { url_slug: "past-1", start_date: "2024-01-08T09:00:00Z" },
    ];

    const sorted = sortProjectsByStartDate(projects);

    expect(sorted.map((p) => p.url_slug)).toEqual([
      "upcoming-1",
      "upcoming-2",
      "no-date",
      "past-1",
      "past-2",
    ]);
  });
});

describe("WasseraktionswochenEvents", () => {
  beforeEach(() => {
    projectPreviewsMock.mockClear();
    jest.setSystemTime(new Date("2024-01-10T08:00:00Z"));
  });

  it("renders localized heading and passes sorted projects to ProjectPreviews", () => {
    const projects = [
      { url_slug: "past", start_date: "2024-01-08T00:00:00Z" },
      { url_slug: "upcoming", start_date: "2024-01-11T00:00:00Z" },
    ];

    render(<WasseraktionswochenEvents projects={projects} isGerman />);

    expect(screen.getByText("Veranstaltungen")).toBeInTheDocument();

    const renderedOrder = screen.getAllByTestId("project-slug").map((node) => node.textContent);
    expect(renderedOrder).toEqual(["upcoming", "past"]);

    expect(projectPreviewsMock).toHaveBeenCalledTimes(1);
    const { projects: passedProjects } = projectPreviewsMock.mock.calls[0][0];
    expect(passedProjects.map((p: any) => p.url_slug)).toEqual(["upcoming", "past"]);
  });
});
