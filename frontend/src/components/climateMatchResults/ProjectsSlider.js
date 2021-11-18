import { Link, makeStyles } from "@material-ui/core";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import UserContext from "../context/UserContext";
import ClimateMatchSuggestionInfo from "./ClimateMatchSuggestionInfo";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "absolute",
    left: 50,
    right: 50,
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 20,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  projectImage: {
    height: 150,
    paddingRight: theme.spacing(2),
  },
  carouselEntry: {
    paddingLeft: theme.spacing(16),
    paddingRight: theme.spacing(16),
    display: "flex",
    justifyContent: "center",
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit",
  },
}));

export default function ProjectsSlider({ projects }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };
  return (
    <div className={classes.root}>
      <Carousel responsive={responsive} infinite>
        {projects.map((p, index) => (
          <Link
            key={index}
            href={`${getLocalePrefix(locale)}/projects/${p.url_slug}`}
            target="_blank"
            className={classes.noUnderline}
          >
            <div key={index} className={classes.carouselEntry}>
              <img src={getImageUrl(p?.image)} className={classes.projectImage} />
              <ClimateMatchSuggestionInfo suggestion={{ ...p, ressource_type: "project" }} />
            </div>
          </Link>
        ))}
      </Carousel>
    </div>
  );
}
