import React from "react";
import { Grid, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) => ({
  container: (props: ContentImageSplitViewProps) => ({
    alignContent: "center",
    justifyContent: "center",
    ...(props.minHeight ? { minHeight: props.minHeight } : {}),
  }),
  flex: {
    display: "flex",
  },
  centerItems: {
    margin: "auto 0",
    placeItems: "center",
  },
  rightPadding: {
    paddingRight: theme.spacing(6),
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

const ContentImageSplitView: React.FC<ContentImageSplitViewProps> = (props) => {
  const { content, image, leftGridSizes, rightGridSizes, minHeight, direction } = props;
  // check the breakpoint for the right pane
  // if the breakpoint is not satisfied, the right pane will be hidden
  const rightPaneHidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const classes = useStyles(props);

  return (
    <Grid
      container
      spacing={2}
      className={classes.container}
      direction={direction ? direction : "row"}
    >
      {/* content pane */}
      <Grid
        item
        xs={12}
        md={7}
        {...leftGridSizes}
        className={`${classes.centerItems} ${!rightPaneHidden && classes.rightPadding}`}
      >
        {content}
      </Grid>

      {/* image pane */}
      {!rightPaneHidden && (
        <Grid item md={5} {...rightGridSizes} className={classes.flex}>
          {image}
        </Grid>
      )}
    </Grid>
  );
};

export default ContentImageSplitView;
