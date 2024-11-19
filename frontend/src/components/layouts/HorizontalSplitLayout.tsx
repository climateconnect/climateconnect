import React from "react";
import { Grid, Theme, useMediaQuery } from "@mui/material";

const HorizontalSplitLayout = ({ left, right }) => {
  // check the breakpoint for the right pane
  // if the breakpoint is not satisfied, the right pane will be hidden
  const rightPaneHidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <Grid container spacing={2}>
      {/* left pane */}
      <Grid item xs={12} md={7}>
        {left}
      </Grid>
      {/* right pane */}
      {!rightPaneHidden && (
        <Grid item md={5}>
          {right}
        </Grid>
      )}
    </Grid>
  );
};

export default HorizontalSplitLayout;
