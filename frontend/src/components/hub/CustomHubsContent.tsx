import React from "react";

interface CustomHubsContentProps {
  hubUrl?: string;
  Component: React.ComponentType<any>;
  DefaultComponent?: React.ComponentType<any> | null;
  componentProps?: Record<string, any>;
  defaultComponentProps?: Record<string, any>;
}

const CustomHubsContent: React.FC<CustomHubsContentProps> = ({
  hubUrl,
  Component,
  DefaultComponent = null,
  componentProps = {},
  defaultComponentProps = {},
}) => {
  return hubUrl === "prio1" ? (
    <Component {...componentProps} />
  ) : DefaultComponent ? (
    <DefaultComponent {...defaultComponentProps} />
  ) : null;
};
export default CustomHubsContent;
