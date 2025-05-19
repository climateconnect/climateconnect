/**
 * HubConditionalRenderer
 *
 * Renders a specific component based on the given `hubUrl`.
 * - If `hubUrl` matches one of the values in `HUBS_NAME`, it renders the `Component`.
 * - Otherwise, it renders the `DefaultComponent` (if provided).
 * - If neither condition is met, it returns null.
 *
 * Useful for conditionally displaying custom UI for specific hub environments (e.g., "prio1").
 *
 * Example:
 *  <HubConditionalRenderer
      hubUrl={hubUrl}
      Component={EnPrio1Welcome}
      DefaultComponent={LoggedOutLocationHubBox}
      defaultComponentProps={{
        headline: headline,
        isLocationHub: isLocationHub,
        location: hubData.name,
      }}
    />
 */

import React from "react";

interface HubConditionalRendererProps {
  hubUrl?: string;
  Component: React.ComponentType<any>;
  DefaultComponent?: React.ComponentType<any> | null;
  componentProps?: Record<string, any>;
  defaultComponentProps?: Record<string, any>;
}

const HUBS_NAME = ["prio1"]

const HubConditionalRenderer: React.FC<HubConditionalRendererProps> = ({
  hubUrl,
  Component,
  DefaultComponent = null,
  componentProps = {},
  defaultComponentProps = {},
}) => {
  return hubUrl && HUBS_NAME.includes(hubUrl) ? (
    <Component {...componentProps} />
  ) : DefaultComponent ? (
    <DefaultComponent {...defaultComponentProps} />
  ) : null;
};
export default HubConditionalRenderer;
