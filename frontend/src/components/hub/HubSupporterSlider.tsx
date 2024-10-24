import React, { useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Image from "next/image";
import Carousel from "react-multi-carousel";
import { Link, Theme, useMediaQuery } from "@mui/material";
import UserContext from "../context/UserContext";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    // position: "absolute",
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
    width: 320,
    // flexGrow: 1,
    // maxWidth: 320
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

const CarouselItem = ({ supporter }) => {
  const { locale } = useContext(UserContext);
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const classes = useStyles();
  return (
    <div className={classes.carouselEntry}>
      {isSmallOrMediumScreen ? (
        <Image src={getImageUrl(supporter?.logo)} />
      ) : (
        <img src={getImageUrl(supporter?.logo)} width={50} height={50} />
      )}
    </div>
  );
};

const HubSupporterSlider = ({ supportersList }) => {
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
      <Carousel responsive={responsive} infinite={supportersList?.length > 1} arrows={!under500}>
        {supportersList?.length > 0 &&
          supportersList.map((data, index) => <CarouselItem key={index} supporter={data} />)}
      </Carousel>
    </div>
  );
};

export default HubSupporterSlider;
