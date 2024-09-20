import * as React from "react";
import * as Types from "./types";

declare function QuoteWOCms(props: {
  as?: React.ElementType;
  nameQuote?: React.ReactNode;
  bezeichnung?: React.ReactNode;
  quote?: React.ReactNode;
  pictureQuote?: Types.Asset.Image;
}): React.JSX.Element;
