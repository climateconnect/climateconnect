import { useFeatureToggles } from "../../src/components/featureToggle";

// Demo page to showcase the Feature Toggle System
// This demonstrates both server-side and client-side toggle checking

// Note: The FeatureToggleProvider is already set up in _app.tsx, so you can just
// use the useFeatureToggles hook anywhere in your app without any setup!

// Component that demonstrates client-side toggle checking
function ClientSideDemo() {
  // This hook works on any page because FeatureToggleProvider is in _app.tsx
  const { isEnabled, toggles, environment } = useFeatureToggles();

  return (
    <div
      style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h3>Client-Side Toggle Check</h3>
      <p>
        <strong>Current Environment (client):</strong> {environment}
      </p>
      <p>
        <strong>DEMO_CLIENT enabled:</strong> {isEnabled("DEMO_CLIENT") ? "✅ Yes" : "❌ No"}
      </p>
      <p>
        <strong>All toggles:</strong> {JSON.stringify(toggles)}
      </p>
    </div>
  );
}

// The main page component
function FeatureToggleDemoPage() {
  const { isEnabled } = useFeatureToggles();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Feature Toggle System Demo</h1>

      <p>
        This page demonstrates the Climate Connect Feature Toggle System. The FeatureToggleProvider
        is already set up in <code>_app.tsx</code>, so you can just use the{" "}
        <code>useFeatureToggles</code> hook on any page!
      </p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #666",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Current Toggle Values</h3>
        <ul>
          <li>
            <strong>DEMO_SERVER:</strong> {isEnabled("DEMO_SERVER") ? "✅ Enabled" : "❌ Disabled"}{" "}
            (from database)
          </li>
          <li>
            <strong>DEMO_CLIENT:</strong> {isEnabled("DEMO_CLIENT") ? "✅ Enabled" : "❌ Disabled"}{" "}
            (from database)
          </li>
        </ul>
        <p>
          <em>Set these values in Django Admin → Feature Toggles</em>
        </p>
      </div>

      {/* Client-side demo - shows live context values */}
      <ClientSideDemo />

      <div style={{ marginTop: "2rem" }}>
        <h3>How to use feature toggles</h3>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`// In any component (no setup needed - provider is in _app.tsx)
import { useFeatureToggles } from '@/components/featureToggle';

function MyComponent() {
  const { isEnabled } = useFeatureToggles();

  if (isEnabled('MY_FEATURE')) {
    return <NewFeature />;
  }
  return <OldFeature />;
}

// With fallback (if toggle doesn't exist or API fails)
if (isEnabled('MY_FEATURE', true)) {
  // defaults to true if toggle not found
}`}
        </pre>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Setting up toggles in Django Admin</h3>
        <ol>
          <li>Go to Django Admin → Feature Toggles</li>
          <li>
            Create a new toggle with name: <code>DEMO_CLIENT</code> or <code>DEMO_SERVER</code>
          </li>
          <li>Enable/disable for different environments</li>
          <li>Refresh this page to see changes</li>
        </ol>
      </div>
    </div>
  );
}

export default FeatureToggleDemoPage;
