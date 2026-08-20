/**
 * Provider routing for LocationSearchBar.
 *
 * The LOCATIONIQ_AUTOCOMPLETE toggle is a rollback switch: with it off the
 * component must behave exactly as master did (direct browser -> Nominatim),
 * with it on it must go through the backend proxy and never touch
 * nominatim.openstreetmap.org directly. See
 * doc/spec/20260804_1202_locationiq_feature_toggle_and_result_caching.md.
 */

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";

import theme from "../../themes/theme";

import axios from "axios";
import LocationSearchBar from "./LocationSearchBar";
import { apiRequest } from "../../../public/lib/apiOperations";
import { useFeatureToggles } from "../featureToggle";
import UserContext from "../context/UserContext";

jest.mock("axios");
jest.mock("../../../public/lib/apiOperations");
jest.mock("../featureToggle");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedApiRequest = apiRequest as jest.MockedFunction<any>;
const mockedUseFeatureToggles = useFeatureToggles as jest.MockedFunction<any>;

const NOMINATIM_HOST = "nominatim.openstreetmap.org";

const setToggle = ({ enabled, isLoading = false }: { enabled: boolean; isLoading?: boolean }) => {
  mockedUseFeatureToggles.mockReturnValue({
    toggles: { LOCATIONIQ_AUTOCOMPLETE: enabled },
    isEnabled: (feature: string, fallback = false) =>
      feature === "LOCATIONIQ_AUTOCOMPLETE" ? enabled : fallback,
    isLoading,
    error: null,
    environment: "development",
  });
};

/**
 * Enter a search term and let the 400ms input debounce elapse, which is what
 * actually triggers the request.
 */
const search = async (query: string) => {
  const { container } = render(
    <ThemeProvider theme={theme}>
      {/* The component reads locale and hubUrl from UserContext, whose default is null. */}
      <UserContext.Provider value={{ locale: "en", hubUrl: undefined } as any}>
        <LocationSearchBar label="Location" />
      </UserContext.Provider>
    </ThemeProvider>
  );
  const input = container.querySelector("input") as HTMLInputElement;
  fireEvent.change(input, { target: { value: query } });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
};

describe("LocationSearchBar provider routing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ advanceTimers: true });
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedApiRequest.mockResolvedValue({ status: 200, data: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls Nominatim directly when the toggle is off", async () => {
    setToggle({ enabled: false });

    await search("Berlin");

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());
    expect(mockedAxios.get.mock.calls[0][0]).toContain(NOMINATIM_HOST);
    // The proxy must not be involved at all.
    const proxyCalls = mockedApiRequest.mock.calls.filter((call) =>
      call[0]?.url?.includes("/api/location_autocomplete/")
    );
    expect(proxyCalls).toHaveLength(0);
  });

  it("tracks the request for rate monitoring when the toggle is off", async () => {
    setToggle({ enabled: false });

    await search("Berlin");

    await waitFor(() =>
      expect(
        mockedApiRequest.mock.calls.some((call) => call[0]?.url === "/api/nominatim_request_count/")
      ).toBe(true)
    );
  });

  it("uses the backend proxy and never calls Nominatim directly when the toggle is on", async () => {
    setToggle({ enabled: true });

    await search("Berlin");

    await waitFor(() =>
      expect(
        mockedApiRequest.mock.calls.some((call) =>
          call[0]?.url?.includes("/api/location_autocomplete/")
        )
      ).toBe(true)
    );
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("fires nothing while the toggles are still loading", async () => {
    // Guards against sending the very first query to the wrong provider.
    setToggle({ enabled: true, isLoading: true });

    await search("Berlin");

    expect(mockedAxios.get).not.toHaveBeenCalled();
    const autocompleteCalls = mockedApiRequest.mock.calls.filter((call) =>
      call[0]?.url?.includes("/api/location_autocomplete/")
    );
    expect(autocompleteCalls).toHaveLength(0);
  });
});
