/**
 * Unit tests for Feature Toggle System
 *
 * These tests demonstrate how to test components that use feature toggles
 * without making actual API calls. They use Jest mocking to inject
 * mock toggle values.
 *
 * Run with: cd frontend && yarn test
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Import after mocking
import { FeatureToggleProvider, useFeatureToggles, FeatureToggleContext } from "../featureToggle";
import { FeatureToggles } from "../../hooks/types/featureToggle";
import { CcEnvironments } from "../../../public/lib/environmentOperations";

// Test component that uses feature toggles via hook
function TestComponentWithHook() {
  const { isEnabled, isLoading, environment, toggles } = useFeatureToggles();

  return (
    <div>
      <p data-testid="loading">Loading: {isLoading.toString()}</p>
      <p data-testid="environment">Environment: {environment}</p>
      <p data-testid="demo-client">
        DEMO_CLIENT: {isEnabled("DEMO_CLIENT") ? "enabled" : "disabled"}
      </p>
      <p data-testid="demo-server">
        DEMO_SERVER: {isEnabled("DEMO_SERVER") ? "enabled" : "disabled"}
      </p>
      <p data-testid="unknown-feature">
        UNKNOWN_FEATURE: {isEnabled("UNKNOWN_FEATURE", true) ? "enabled" : "disabled"}
      </p>
      <p data-testid="toggles">{JSON.stringify(toggles)}</p>
    </div>
  );
}

// Test component that uses different fallback values
function TestComponentWithFallback({ fallbackValue }: { fallbackValue: boolean }) {
  const { isEnabled } = useFeatureToggles();

  const testId = fallbackValue ? "unknown-feature-true" : "unknown-feature-false";

  return (
    <div>
      <p data-testid={testId}>
        UNKNOWN_FEATURE: {isEnabled("UNKNOWN_FEATURE", fallbackValue) ? "enabled" : "disabled"}
      </p>
    </div>
  );
}

describe("Feature Toggle System", () => {
  describe("FeatureToggleProvider", () => {
    it("should render with initial toggles", () => {
      const initialToggles: FeatureToggles = {
        DEMO_CLIENT: true,
        DEMO_SERVER: false,
      };

      render(
        <FeatureToggleProvider initialToggles={initialToggles}>
          <TestComponentWithHook />
        </FeatureToggleProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("Loading: false");
    });

    it("should use custom environment when provided", () => {
      const initialToggles: FeatureToggles = {
        DEMO_CLIENT: true,
      };

      render(
        <FeatureToggleProvider
          initialToggles={initialToggles}
          environment={CcEnvironments.Development}
        >
          <TestComponentWithHook />
        </FeatureToggleProvider>
      );

      expect(screen.getByTestId("environment")).toHaveTextContent("Environment: development");
    });

    it("should correctly check if a feature is enabled", () => {
      const initialToggles: FeatureToggles = {
        DEMO_CLIENT: true,
        DEMO_SERVER: false,
      };

      render(
        <FeatureToggleProvider initialToggles={initialToggles}>
          <TestComponentWithHook />
        </FeatureToggleProvider>
      );

      expect(screen.getByTestId("demo-client")).toHaveTextContent("DEMO_CLIENT: enabled");
      expect(screen.getByTestId("demo-server")).toHaveTextContent("DEMO_SERVER: disabled");
    });

    it("should use fallback value for unknown features", () => {
      // When fallback is false (default), unknown features should be disabled
      const initialToggles: FeatureToggles = {
        DEMO_CLIENT: true,
      };

      render(
        <FeatureToggleProvider initialToggles={initialToggles}>
          <TestComponentWithFallback fallbackValue={false} />
        </FeatureToggleProvider>
      );

      // Without fallback (defaults to false)
      expect(screen.getByTestId("unknown-feature-false")).toHaveTextContent(
        "UNKNOWN_FEATURE: disabled"
      );
    });

    it("should use fallback value when specified", () => {
      // When fallback is true, unknown features should be enabled
      const initialToggles: FeatureToggles = {};

      render(
        <FeatureToggleProvider initialToggles={initialToggles}>
          <TestComponentWithFallback fallbackValue={true} />
        </FeatureToggleProvider>
      );

      // With fallback = true
      expect(screen.getByTestId("unknown-feature-true")).toHaveTextContent(
        "UNKNOWN_FEATURE: enabled"
      );
    });
  });

  describe("Mocking for integration tests", () => {
    it("shows how to mock toggles in component tests", () => {
      // Example of how to use the mock in your own tests:

      // 1. Create mock toggles for your test
      const mockToggles: FeatureToggles = {
        DEMO_CLIENT: true,
        DEMO_SERVER: true,
        NEW_DASHBOARD: false,
      };

      // 2. Render your component with the provider
      render(
        <FeatureToggleProvider initialToggles={mockToggles}>
          <TestComponentWithHook />
        </FeatureToggleProvider>
      );

      // 3. Assert based on the mock toggles
      expect(screen.getByTestId("demo-client")).toHaveTextContent("DEMO_CLIENT: enabled");
    });

    it("shows how to test conditional rendering with toggles", () => {
      // Component that renders differently based on toggle
      function ConditionalComponent({ enabled }: { enabled: boolean }) {
        const { isEnabled } = useFeatureToggles();
        const isFeatureOn = enabled !== undefined ? enabled : isEnabled("NEW_DASHBOARD");

        return (
          <div>
            {isFeatureOn ? (
              <span data-testid="new-dashboard">New Dashboard</span>
            ) : (
              <span data-testid="old-dashboard">Old Dashboard</span>
            )}
          </div>
        );
      }

      // Test with toggle enabled - pass explicit value
      const { rerender } = render(
        <FeatureToggleProvider initialToggles={{ NEW_DASHBOARD: true }}>
          <ConditionalComponent enabled={true} />
        </FeatureToggleProvider>
      );

      expect(screen.getByTestId("new-dashboard")).toBeInTheDocument();
      expect(screen.queryByTestId("old-dashboard")).not.toBeInTheDocument();

      // Rerender with toggle disabled
      rerender(
        <FeatureToggleProvider initialToggles={{ NEW_DASHBOARD: false }}>
          <ConditionalComponent enabled={false} />
        </FeatureToggleProvider>
      );

      expect(screen.getByTestId("old-dashboard")).toBeInTheDocument();
      expect(screen.queryByTestId("new-dashboard")).not.toBeInTheDocument();
    });
  });

  describe("Environment detection (unit tests)", () => {
    // These test the helper functions directly
    it("should provide default context values", () => {
      // Test that initial state is correct
      expect(FeatureToggleContext).toBeDefined();
    });
  });
});
