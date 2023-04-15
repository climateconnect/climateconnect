import { Link, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import Carousel from "react-multi-carousel";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import ProjectPreview from "../project/ProjectPreview";
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
    [theme.breakpoints.down("xl")]: {
      left: theme.spacing(1),
      right: theme.spacing(1),
    },
    [theme.breakpoints.down("md")]: {
      border: "none",
      left: 0,
      right: 0,
    },
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
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit",
  },
  projectCard: {
    width: 290,
  },
}));

export default function ProjectsSlider({ projects }) {
  const classes = useStyles();
  const under500 = useMediaQuery<Theme>("(max-width: 500px)");
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };
  return (
    <div className={classes.root}>
      <Carousel responsive={responsive} infinite={projects?.length > 1} arrows={!under500}>
        {projects.map((p, index) => (
          <CarouselItem key={index} project={p} />
        ))}
      </Carousel>
    </div>
  );
}

const CarouselItem = ({ project }) => {
  const { locale } = useContext(UserContext);
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const classes = useStyles();
  return (
    <Link
      href={`${getLocalePrefix(locale)}/projects/${project.url_slug}`}
      target="_blank"
      className={classes.noUnderline}
      underline="hover"
    >
      <div className={classes.carouselEntry}>
        {isSmallOrMediumScreen ? (
          <ProjectPreview project={project} className={classes.projectCard} />
        ) : (
          <ClimateMatchSuggestionInfo
            suggestion={{ ...project, ressource_type: "project" }}
            isInSlider
          />
        )}
      </div>
    </Link>
  );
};
