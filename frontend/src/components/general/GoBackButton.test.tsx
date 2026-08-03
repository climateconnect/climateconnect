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

function setHistoryLength(length: number) {
  jest.spyOn(window.history, "length", "get").mockReturnValue(length);
}

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
  });

  it("renders the go back label", () => {
    renderButton();
    expect(screen.getByText("Go back")).toBeInTheDocument();
  });

  it("navigates back in history when there is a previous page", () => {
    setHistoryLength(3);
    renderButton();
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("falls back to the browse page when there is no history", () => {
    setHistoryLength(1);
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/en/browse");
  });

  it("falls back to the hub browse page when a hub parameter is present", () => {
    setHistoryLength(1);
    setLocationSearch("?hub=em");
    renderButton({ locale: "en" });
    fireEvent.click(screen.getByText("Go back"));
    expect(mockPush).toHaveBeenCalledWith("/en/hubs/em/browse");
  });

  it("uses the provided defaultBackUrl when there is no history", () => {
    setHistoryLength(1);
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
    setHistoryLength(2);
    renderButton({ tinyScreen: true });
    fireEvent.click(screen.getByRole("button"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
