import React from "react";
import { makeStyles, Link, Card, CardMedia, Typography } from "@material-ui/core";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: `3px 3px 3px #f8f8f8`,
  },
  placeholderImg: {
    visibility: "hidden",
    width: "100%",
  },
  title: {
    fontSize: 25,
    color: theme.palette.secondary.main,
    fontWeight: 600,
  },
  cardContentWrapper: {
    height: 120,
    background: "#f8f8f8",
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
  },
}));

export default function HubPreview({ hub }) {
  const classes = useStyles();

  return (
    <Link href={`/hubs/${hub.url_slug}`} className={classes.noUnderline}>
      <Card className={classes.root} variant="outlined">
        <CardMedia
          className={classes.media}
          title={hub.name}
          image={getImageUrl(hub.thumbnail_image)}
        >
          <img
            src={getImageUrl(hub.thumbnail_image)}
            className={classes.placeholderImg}
            alt={hub.name + "'s project image"}
          />
        </CardMedia>
        <div className={classes.cardContentWrapper}>
          <Typography className={classes.title}>{hub.name}</Typography>
        </div>
      </Card>
    </Link>
  );
}
