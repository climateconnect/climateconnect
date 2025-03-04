import * as React from "react";
import * as Types from "./types";

declare function OrgCard(props: {
  as?: React.ElementType;
  orgType?: React.ReactNode;
  orgName?: React.ReactNode;
  orgSummary?: React.ReactNode;
  orgLogo?: Types.Asset.Image;
  orgMemberNumber?: React.ReactNode;
  orgProjectNumber?: React.ReactNode;
  orgCardLink?: Types.Basic.Link;
}): React.JSX.Element;
