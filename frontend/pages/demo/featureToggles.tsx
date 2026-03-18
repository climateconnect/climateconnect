import { GetServerSideProps } from "next";
import { useFeatureToggles } from "../../src/components/featureToggle";
import { getFeatureTogglesFromRequest } from "../../src/hooks/featureToggles";
import { FeatureToggles } from "../../src/hooks/types/featureToggle";
import type { CcEnvironment } from "../../public/lib/environmentOperations";

// Demo page to showcase the Feature Toggle System
// This demonstrates both server-side and client-side toggle checking.
//
// Server-side: feature toggles are fetched in getServerSideProps using
// getFeatureTogglesFromRequest, which reads the environment from the
// x-cc-environment header set by Next.js middleware (middleware.ts).
// The toggles are passed as pageProps to FeatureToggleProvider in _app.tsx.
//
// Client-side: the useFeatureToggles hook reads from the same FeatureToggleProvider.

type Props = {
  featureToggles: FeatureToggles;
  environment: CcEnvironment;
  serverRenderedAt: string;
  serverDemoEnabled: boolean;
};

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
function FeatureToggleDemoPage({ serverRenderedAt, serverDemoEnabled }: Props) {
  const { isEnabled } = useFeatureToggles();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Feature Toggle System Demo</h1>

      <p>
        This page demonstrates the Climate Connect Feature Toggle System. The FeatureToggleProvider
        is set up in <code>_app.tsx</code> and receives initial toggle values from{" "}
        <code>getServerSideProps</code> on pages that opt-in. You can use the{" "}
        <code>useFeatureToggles</code> hook on any page.
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
        <h3>Server-Side Toggle Values (from getServerSideProps)</h3>
        <p>
          <em>Rendered at: {serverRenderedAt}</em>
        </p>
        <ul>
          <li>
            <strong>DEMO_SERVER:</strong> {serverDemoEnabled ? "✅ Enabled" : "❌ Disabled"}{" "}
            (resolved on server)
          </li>
          <li>
            <strong>DEMO_CLIENT:</strong> {isEnabled("DEMO_CLIENT") ? "✅ Enabled" : "❌ Disabled"}{" "}
            (from provider)
          </li>
        </ul>
        <p>
          <em>Set these values in Django Admin → Feature Toggles</em>
        </p>
      </div>

      {/* Client-side demo - shows live context values */}
      <ClientSideDemo />

      <div style={{ marginTop: "2rem" }}>
        <h3>How to use feature toggles on a page with SSR</h3>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "1rem",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`import { GetServerSideProps } from 'next';
import { getFeatureTogglesFromRequest } from '@/hooks/featureToggles';
import { useFeatureToggles } from '@/components/featureToggle';

// 1. Fetch toggles in getServerSideProps (opt-in per page)
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { featureToggles, environment } = await getFeatureTogglesFromRequest(req);
  return { props: { featureToggles, environment } };
};

// 2. Use the hook in your component (reads from FeatureToggleProvider in _app.tsx)
function MyPage() {
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

// Opt-in to SSR feature toggles for this page.
// The featureToggles and environment props are picked up by
// FeatureToggleProvider in _app.tsx via pageProps.
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const { featureToggles, environment } = await getFeatureTogglesFromRequest(req);

  return {
    props: {
      featureToggles,
      environment,
      serverRenderedAt: new Date().toISOString(),
      serverDemoEnabled: featureToggles["DEMO_SERVER"] ?? false,
    },
  };
};

export default FeatureToggleDemoPage;
