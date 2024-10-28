import React, { useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Carousel from "react-multi-carousel";
import { Theme, useMediaQuery, Link, Typography } from "@mui/material";
import UserContext from "../context/UserContext";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

type MakeStylesProps = {
  containerClass: string;
};

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
  supporterSubtitle: (props: MakeStylesProps) => ({
    margin: "0",
    fontSize: "12px",
    color: "#484848",
    // fontWeight: 600,
    whiteSpace: "nowrap",
    width: props.containerClass ? "170px" : "200px",
    overflow: "hidden",
    OTextOverflow: "ellipsis",
    textOverflow: "ellipsis",
  }),
  carouselEntry: {
    padding: " 8px 9px 15px 10px",
    display: "flex",
    justifyContent: "left",
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },
  containerInSmallDevices: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    backgroundColor: "#EEEFEEE8",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  supporterImgSmallDevice: {
    borderRadius: "50%",
  },
  textAlign: {
    marginLeft: "auto",
  },
  allSupporters: {
    display: "flex",
    alignItems: "center",
    color: "#484848",
    fontWeight: "600",
    fontSize: "17px",
  },
  arrowIcon: {
    color: "#207178",
  },
}));

const CarouselItem = ({ supporter }) => {
  const classes = useStyles();
  return (
    <div className={classes.carouselEntry}>
      <div className={classes.itemContainer}>
        <img
          src={getImageUrl(supporter?.logo)}
          width={76}
          height={76}
          alt={supporter.name}
          className={classes.supporterImg}
        />
        <div className={classes.supporterDetails}>
          <p className={classes.supporterName}>{supporter?.name}</p>
          <p className={classes.supporterSubtitle}>Unterstützer: {supporter.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const HubSupporterSlider = ({ classes, containerClass, supportersList }) => {
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };
  console.log("containerClass", containerClass);
  return (
    <div className={`${classes.root} ${containerClass}`}>
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

const HubSupporter = ({ supportersList, containerClass }) => {
  const classes = useStyles();
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const slicedSupporterForSmallDevice = supportersList.slice(0, 3);
  return (
    <>
      {!isSmallOrMediumScreen ? (
        <HubSupporterSlider
          classes={classes}
          containerClass={containerClass}
          supportersList={supportersList}
        />
      ) : (
        <div className={classes.containerInSmallDevices}>
          {supportersList?.length > 0 &&
            slicedSupporterForSmallDevice.map((supporter) => (
              <img
                src={getImageUrl(supporter?.logo)}
                width={45}
                height={45}
                alt={supporter.name}
                className={classes.supporterImgSmallDevice}
                key={supporter.name}
              />
            ))}
          {supportersList?.length > 3 && (
            <Typography className={classes.textAlign}>
              <Link href={"#"} className={classes.allSupporters}>
                {texts.all_supporters} <ArrowRightIcon className={classes.arrowIcon} />{" "}
              </Link>
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default HubSupporter;
