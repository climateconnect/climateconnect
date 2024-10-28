import React, { useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Carousel from "react-multi-carousel";
import { Theme, useMediaQuery } from "@mui/material";
import UserContext from "../context/UserContext";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#207178",
    borderRadius: 4,
    paddingBottom: "15px",
    paddingRight: "5px",
    paddingLeft: "5px",
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
    //instead of width we can use flexGrow && maxWidth
    // flexGrow: 1,
    // maxWidth: 320
  },
  carouseltitle: {
    color: "#FFFFFF",
    fontSize: "13px",
    margin: "2px",
    textAlign: "center",
  },
  carouselContainer: {
    backgroundColor: "#F0F2F5",
    borderRadius: "4px",
    position: "relative",
  },
  customDot: {
    bottom: "-16px",
    "& .react-multi-carousel-dot--active button": {
      background: "white",
    },
    "& li button": {
      width: "7px",
      height: "7px",
      border: "none",
      background: "#66BCB5",
    },
  },

  itemContainer: {
    display: "flex",
    alignItems: "center",
  },
  supporterImg: {
    borderRadius: "50%",
  },
  supporterDetails: {
    paddingLeft: "15px",
  },
  supporterName: {
    fontSize: "17px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  supporterSubtitle: {
    margin: "0",
    fontSize: "12px",
    color: "#484848",
  },
  carouselEntry: {
    padding: " 8px 9px 15px 16px",
    display: "flex",
    justifyContent: "left",
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },
}));

const CarouselItem = ({ supporter }) => {
  const { locale } = useContext(UserContext);
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const classes = useStyles();
  return (
    <div className={classes.carouselEntry}>
      {isSmallOrMediumScreen ? (
        <img src={getImageUrl(supporter?.logo)} />
      ) : (
        <div className={classes.itemContainer}>
          <img
            src={getImageUrl(supporter?.logo)}
            width={76}
            height={76}
            className={classes.supporterImg}
          />
          <div className={classes.supporterDetails}>
            <p className={classes.supporterName}>{supporter?.name}</p>
            <p className={classes.supporterSubtitle}>Unterstützer: {supporter.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const HubSupporterSlider = ({ supportersList }) => {
  const classes = useStyles();
  // const under500 = useMediaQuery<Theme>("(max-width: 500px)");
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };

  return (
    <div className={classes.root}>
      <p className={classes.carouseltitle}>Der ClimateHub wird unterstützt durch:</p>
      <div className={classes.carouselContainer}>
        <Carousel
          responsive={responsive}
          infinite={supportersList?.length > 1}
          arrows={false}
          showDots={true}
          renderDotsOutside={true}
          dotListClass={classes.customDot}
          autoPlay={true}
          autoPlaySpeed={10000}
        >
          {supportersList?.length > 0 &&
            supportersList.map((data, index) => <CarouselItem key={index} supporter={data} />)}
        </Carousel>
      </div>
    </div>
  );
};

export default HubSupporterSlider;
