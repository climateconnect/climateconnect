import React from "react";
import { Grid, Theme, useMediaQuery } from "@mui/material";

interface HorizontalSplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftGridProps?: {
    xs?: boolean | "auto" | number;
    md?: boolean | "auto" | number;
    lg?: boolean | "auto" | number;
    [key: string]: any;
  };
  rightGridProps?: {
    xs?: boolean | "auto" | number;
    md?: boolean | "auto" | number;
    lg?: boolean | "auto" | number;
    [key: string]: any;
  };
  wrapperProps?: {
    [key: string]: any;
  };
}

const HorizontalSplitLayout: React.FC<HorizontalSplitLayoutProps> = ({
  left,
  right,
  leftGridProps,
  rightGridProps,
  wrapperProps,
}) => {
  // check the breakpoint for the right pane
  // if the breakpoint is not satisfied, the right pane will be hidden
  const rightPaneHidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <Grid container spacing={2} {...wrapperProps}>
      {/* left pane */}
      <Grid item xs={12} md={7} {...leftGridProps}>
        {left}
      </Grid>
      {/* right pane */}
      {!rightPaneHidden && (
        <Grid item md={5} {...rightGridProps}>
          {right}
        </Grid>
      )}
    </Grid>
  );
};

export default HorizontalSplitLayout;
