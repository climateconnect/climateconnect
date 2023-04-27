import { Link, List, ListItem, ListItemIcon, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles(() => ({
  suggestionsOverviewContainer: {
    maxWidth: 300,
    minWidth: 230,
    paddingTop: 0,
  },
  suggestionOverviewNumber: {
    fontFamily: "flood-std, sans-serif",
    fontSize: 22,
  },
  suggestionOverviewName: {
    fontWeight: 600,
  },
  suggestionOverviewItem: {
    display: "flex",
    alignItems: "flex-start",
  },
  suggestionsOverViewItemIcon: {
    minWidth: 30,
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit",
  },
}));

export default function ClimateMatchResultsOverviewBar({ suggestions }) {
  const classes = useStyles();

  return (
    <div>
      <List className={classes.suggestionsOverviewContainer}>
        {suggestions?.map((suggestion, index) => (
          <Link
            href={`#${suggestion.url_slug}`}
            className={classes.noUnderline}
            key={index}
            underline="hover"
          >
            <ListItem button className={classes.suggestionOverviewItem}>
              <ListItemIcon className={classes.suggestionsOverViewItemIcon}>
                <Typography color="primary" className={classes.suggestionOverviewNumber}>
                  {index + 1}.
                </Typography>
              </ListItemIcon>
              <Typography className={classes.suggestionOverviewName}>{suggestion.name}</Typography>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );
}
