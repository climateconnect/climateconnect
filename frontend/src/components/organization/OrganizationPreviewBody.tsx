import { Box, CardContent, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import PlaceIcon from "@mui/icons-material/Place";

const useStyles = makeStyles((theme) => {
  return {
    locationName: {
      fontWeight: 600,
      whiteSpace: "nowrap",
      width: "100%",
      overflow: "hidden",
      OTextOverflow: "ellipsis",
      textOverflow: "ellipsis",
    },
    infoLink: {
      display: "flex",
    },
    cardIconBox: {
      width: 40,
      flex: "0 0 40px",
      display: "inline-block",
    },
    textContent: {
      fontSize: 14,
      whiteSpace: "normal",
    },
    locationBox: {
      display: "grid",
      gridTemplateColumns: "40px min-content",
      marginBottom: theme.spacing(0.5),
      justifyContent: "center",
    },
    locationNameBox: {
      maxWidth: "220px",
      overflow: "hidden",
    },
    shortenedSummary: {
      overflow: "hidden",
      WebkitBoxOrient: "vertical",
      display: "-webkit-box",
      lineHeight: 1.25,
    },
    summaryBox: {
      overflow: "hidden",
    },
    contentWrapper: {
      padding: 0,
      display: "grid",
      gridTemplateRows: "min-content",
    },
  };
});

export default function OrganizationPreviewBody({ organization }) {
  const classes = useStyles();
  const [linesOfText, setLinesOfText] = useState(5);

  return (
    <CardContent className={classes.contentWrapper}>
      <Box>
        {!!organization.info.location && (
          <span className={classes.locationBox}>
            <span className={classes.cardIconBox}>
              <Tooltip title="location">
                <PlaceIcon /*TODO(undefined) className={classes.placeIcon} */ color="primary" />
              </Tooltip>
            </span>
            <span className={classes.locationNameBox}>
              <Typography variant="subtitle1" component="h3" className={classes.locationName}>
                {organization.info.location}
              </Typography>
            </span>
          </span>
        )}
      </Box>
      <Box
        className={classes.summaryBox}
        /*TODO(unused) ref={(textBox) => {
          const linesEstimation = textBox?.clientHeight / 25;
          setLinesOfText(Math.floor(linesEstimation));
        }} */
      >
        <Typography className={classes.shortenedSummary} style={{ WebkitLineClamp: linesOfText }}>
          {organization.short_description ?? organization.description}
        </Typography>
      </Box>
    </CardContent>
  );
}
