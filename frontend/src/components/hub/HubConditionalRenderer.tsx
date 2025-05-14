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
