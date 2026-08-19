import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../themes/theme";
import GoBackButton from "./GoBackButton";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const baseTexts = {
  go_back: "Go back",
  back_to_parent: "Back to {parent_name}",
};

function setLocationSearch(search: string) {
  window.history.pushState({}, "", "/" + search);
}

function setReferrer(referrer: string) {
  jest.spyOn(document, "referrer", "get").mockReturnValue(referrer);
}

function renderButton(props: any = {}) {
  const merged = {
    texts: baseTexts,
    locale: "en",
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <GoBackButton {...merged} />
    </ThemeProvider>
  );
}

describe("GoBackButton", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockBack.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Reset the search string set by setLocationSearch so it doesn't leak
    // into other tests.
    window.history.pushState({}, "", "/");
  });

  it("renders the go back label", () => {
    renderButton();
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });

  it("navigates back in history when the referrer is internal", () => {
    setReferrer("http://localhost/en/projects");
    renderButton();
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("falls back to the browse page when there is no referrer", () => {
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/browse");
  });

  it("falls back to the hub browse page when a hub parameter is present", () => {
    setLocationSearch("?hub=em");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockPush).toHaveBeenCalledWith("/en/hubs/em/browse");
  });

  it("uses the provided defaultBackUrl when there is no referrer", () => {
    renderButton({ defaultBackUrl: "/en/some-page" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockPush).toHaveBeenCalledWith("/en/some-page");
  });

  it("returns to the special event page when the user came from there", () => {
    setReferrer("https://climateconnect/en/hubs/em/wasseraktionswochen");
    renderButton({
      locale: "en",
      project: {
        parent_project_slug: "wasseraktionswochen-143-2932026",
        parent_project_name: "Wasseraktionswochen",
      },
    });
    expect(screen.getByText("Back to Wasseraktionswochen")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Back to Wasseraktionswochen"));
    expect(mockPush).toHaveBeenCalledWith("/hubs/em/wasseraktionswochen");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("renders an icon-only button on tiny screens", () => {
    renderButton({ tinyScreen: true });
    expect(screen.queryByText("Go back")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("navigates back from the tiny screen button", () => {
    setReferrer("http://localhost/en/projects");
    renderButton({ tinyScreen: true });
    fireEvent.click(screen.getByRole("button"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("falls back to the browse page when referrer is an external site (e.g. Google)", () => {
    setReferrer("https://www.google.com/search?q=climate+hub");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/browse");
  });

  it("falls back to the browse page when referrer is empty (e.g. external link opened in new tab)", () => {
    setReferrer("");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/browse");
  });

  it("falls back to the browse page when referrer is on a different host", () => {
    setReferrer("http://example.com/en/browse");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/browse");
  });

  it("falls back to the hub browse page when referrer is external and a hub param is present", () => {
    setReferrer("https://www.google.com/search?q=climate+hub");
    setLocationSearch("?hub=em");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/hubs/em/browse");
  });
});
