import React from "react";
import { Grid, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  centerItems: {
    margin: "auto 0",
  },
}));

interface ContentImageSplitViewProps {
  content: React.ReactNode;
  image: React.ReactNode;
  leftGridSizes?: {
    xs?: "auto" | number;
    md?: "auto" | number;
    lg?: "auto" | number;
  };
  rightGridSizes?: {
    xs?: "auto" | number;
    md?: "auto" | number;
    lg?: "auto" | number;
  };
  minHeight?: string;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
}

const ContentImageSplitView: React.FC<ContentImageSplitViewProps> = ({
  content,
  image,
  leftGridSizes,
  rightGridSizes,
  minHeight,
  direction,
}) => {
  // check the breakpoint for the right pane
  // if the breakpoint is not satisfied, the right pane will be hidden
  const rightPaneHidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const classes = useStyles();

  return (
    <Grid
      container
      spacing={2}
      style={{
        alignContent: "center",
        justifyContent: "center",
        minHeight: minHeight ? minHeight : "",
      }}
      direction={direction ? direction : "row"}
    >
      {/* content pane */}
      <Grid item xs={12} md={7} {...leftGridSizes} className={classes.centerItems}>
        {content}
      </Grid>

      {/* image pane */}
      {!rightPaneHidden && (
        <Grid item md={5} {...rightGridSizes} style={{ display: "flex" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>{image}</div>
        </Grid>
      )}
    </Grid>
  );
};

export default ContentImageSplitView;
