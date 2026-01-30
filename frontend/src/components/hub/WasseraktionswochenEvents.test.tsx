import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
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

  it("renders two separate sections with German headings for upcoming and past events", () => {
    const projects = [
      { url_slug: "past", start_date: "2024-01-08T00:00:00Z" },
      { url_slug: "upcoming", start_date: "2024-01-11T00:00:00Z" },
    ];

    render(<WasseraktionswochenEvents projects={projects} isGerman />);

    // Check for German headings
    expect(screen.getByText("Diese Events erwarten Euch")).toBeInTheDocument();
    expect(screen.getByText("Vergangene Veranstaltungen")).toBeInTheDocument();

    // ProjectPreviews should be called twice (once for upcoming, once for past)
    expect(projectPreviewsMock).toHaveBeenCalledTimes(2);

    // First call should be for upcoming events
    const { projects: upcomingProjects } = projectPreviewsMock.mock.calls[0][0];
    expect(upcomingProjects.map((p: any) => p.url_slug)).toEqual(["upcoming"]);

    // Second call should be for past events
    const { projects: pastProjects } = projectPreviewsMock.mock.calls[1][0];
    expect(pastProjects.map((p: any) => p.url_slug)).toEqual(["past"]);
  });

  it("renders two separate sections with English headings for upcoming and past events", () => {
    const projects = [
      { url_slug: "past", start_date: "2024-01-08T00:00:00Z" },
      { url_slug: "upcoming", start_date: "2024-01-11T00:00:00Z" },
    ];

    render(<WasseraktionswochenEvents projects={projects} isGerman={false} />);

    // Check for English headings
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
    expect(screen.getByText("Past Events")).toBeInTheDocument();
  });

  it("only renders upcoming section when there are no past events", () => {
    const projects = [
      { url_slug: "upcoming-1", start_date: "2024-01-11T00:00:00Z" },
      { url_slug: "upcoming-2", start_date: "2024-01-12T00:00:00Z" },
    ];

    render(<WasseraktionswochenEvents projects={projects} isGerman />);

    expect(screen.getByText("Diese Events erwarten Euch")).toBeInTheDocument();
    expect(screen.queryByText("Vergangene Veranstaltungen")).not.toBeInTheDocument();

    // ProjectPreviews should only be called once
    expect(projectPreviewsMock).toHaveBeenCalledTimes(1);
  });

  it("only renders past section when there are no upcoming events", () => {
    const projects = [
      { url_slug: "past-1", start_date: "2024-01-08T00:00:00Z" },
      { url_slug: "past-2", start_date: "2024-01-09T00:00:00Z" },
    ];

    render(<WasseraktionswochenEvents projects={projects} isGerman />);

    expect(screen.queryByText("Diese Events erwarten Euch")).not.toBeInTheDocument();
    expect(screen.getByText("Vergangene Veranstaltungen")).toBeInTheDocument();

    // ProjectPreviews should only be called once
    expect(projectPreviewsMock).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when there are no events", () => {
    render(<WasseraktionswochenEvents projects={[]} isGerman />);

    expect(screen.queryByText("Diese Events erwarten Euch")).not.toBeInTheDocument();
    expect(screen.queryByText("Vergangene Veranstaltungen")).not.toBeInTheDocument();

    // ProjectPreviews should not be called
    expect(projectPreviewsMock).not.toHaveBeenCalled();
  });
});
