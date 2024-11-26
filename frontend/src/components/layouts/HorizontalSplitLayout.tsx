import React from "react";
import { Grid, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  centerItems: {
    margin: "auto 0",
  },
}));

// rename to ContentImageSplitScreen
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
  const classes = useStyles();

  return (
    <Grid container spacing={2} {...wrapperProps}>
      {/* left pane */}
      <Grid item xs={12} md={7} {...leftGridProps} className={classes.centerItems}>
        {left}
      </Grid>
      {/* right pane */}
      {!rightPaneHidden && (
        <Grid item md={5} {...rightGridProps} style={{ minHeight: "50%", maxHeight: "80%" }}>
          {right}
        </Grid>
      )}
    </Grid>
  );
};

export default HorizontalSplitLayout;
