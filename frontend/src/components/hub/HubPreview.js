import { Card, CardMedia, Link, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    boxShadow: props.disableBoxShadow ? 0 : `3px 3px 3px #f8f8f8`,
    border: 0,
  }),
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

export default function HubPreview({ hub, disableBoxShadow }) {
  const classes = useStyles({ disableBoxShadow: disableBoxShadow });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });

  return (
    <Link href={getLocalePrefix(locale) + `/hubs/${hub.url_slug}`} className={classes.noUnderline}>
      <Card className={classes.root} variant="outlined">
        <CardMedia
          className={classes.media}
          title={hub.name}
          image={getImageUrl(hub.thumbnail_image)}
        >
          <img
            src={getImageUrl(hub.thumbnail_image)}
            className={classes.placeholderImg}
            alt={texts.image_for + " " + hub.name}
          />
        </CardMedia>
        <div className={classes.cardContentWrapper}>
          <Typography className={classes.title}>{hub.name}</Typography>
        </div>
      </Card>
    </Link>
  );
}
