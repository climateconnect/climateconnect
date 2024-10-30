import React, { useContext } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Carousel from "react-multi-carousel";
import { Theme, useMediaQuery, Link, Typography } from "@mui/material";
import UserContext from "../context/UserContext";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

type Supporter = {
  name: string;
  subtitle: string;
  logo: string;
  importance: number;
};

type HubSupporter = {
  supportersList: Supporter[];
  containerClass?: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#207178",
    borderRadius: 4,
    paddingBottom: "15px",
    paddingRight: "5px",
    paddingLeft: "5px",
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
    // access the class name of the react-multi-carousel to change the dot color
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
    gap: "15px",
  },
  supporterImg: {
    borderRadius: "50%",
  },
  supporterName: (containerClass) => ({
    fontSize: "17px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    width: containerClass ? "170px" : "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    margin: 0,
  }),
  supporterSubtitle: (containerClass) => ({
    margin: 0,
    fontSize: "12px",
    color: "#484848",
    whiteSpace: "nowrap",
    width: containerClass ? "170px" : "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  carouselEntry: {
    padding: " 8px",
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

const HubSupporters = ({ supportersList, containerClass }: HubSupporter) => {
  const classes = useStyles({ containerClass: containerClass });
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <>
      {!isSmallOrMediumScreen ? (
        <HubSupportersSlider
          classes={classes}
          texts={texts}
          containerClass={containerClass}
          supportersList={supportersList}
        />
      ) : (
        <HubSupportersInSmallDevice
          classes={classes}
          containerClass={containerClass}
          supportersList={supportersList}
          texts={texts}
        />
      )}
    </>
  );
};

export default HubSupporters;

const CarouselItem = ({ supporter, classes, texts }) => {
  return (
    <div className={classes.carouselEntry} key={supporter.name}>
      <div className={classes.itemContainer}>
        <img
          src={getImageUrl(supporter?.logo)}
          width={76}
          height={76}
          alt={supporter.name}
          className={classes.supporterImg}
        />
        <div>
          <p className={classes.supporterName}>{supporter?.name}</p>
          <p className={classes.supporterSubtitle}>
            {texts.supporter}: {supporter.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

const HubSupportersSlider = ({ classes, texts, containerClass, supportersList }) => {
  const responsive = {
    all: {
      breakpoint: { max: 10000, min: 0 },
      items: 1,
    },
  };
  return (
    <div className={`${classes.root} ${containerClass}`}>
      <p className={classes.carouseltitle}>{texts.the_climatehub_is_supported_by + " :"}</p>
      <div className={classes.carouselContainer}>
        <Carousel
          responsive={responsive}
          infinite={supportersList?.length > 1}
          arrows={false}
          showDots={true}
          renderDotsOutside={true}
          dotListClass={classes.customDot}
          // autoPlay={true}
          autoPlaySpeed={10000}
        >
          {supportersList?.length > 0 &&
            supportersList.map((data) => (
              <CarouselItem supporter={data} classes={classes} texts={texts} />
            ))}
        </Carousel>
      </div>
    </div>
  );
};

const HubSupportersInSmallDevice = ({ classes, containerClass, supportersList, texts }) => {
  const slicedSupporterForSmallDevice = supportersList.slice(0, 3);

  return (
    <div className={`${classes.containerInSmallDevices} ${containerClass}`}>
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
      <Typography className={classes.textAlign}>
        <Link href={"#"} className={classes.allSupporters}>
          {texts.all_supporters} <ArrowRightIcon className={classes.arrowIcon} />{" "}
        </Link>
      </Typography>
    </div>
  );
};
