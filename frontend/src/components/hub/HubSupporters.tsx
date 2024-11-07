import React, { useContext, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import Carousel from "react-multi-carousel";
import { Theme, useMediaQuery, Link, Typography, Button } from "@mui/material";
import UserContext from "../context/UserContext";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import HubSupportersDialog from "../dialogs/HubSupportersDialog";
import { Supporter } from "../../types";

// type Supporter = {
//   name: string;
//   subtitle: string;
//   logo: string;
//   importance: number;
//   organization_url_slug: string;
// };

type HubSupporter = {
  supportersList: Supporter[];
  containerClass?: string;
  mobileVersion?: boolean;
  hubName: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#207178",
    borderRadius: 4,
    paddingBottom: "15px",
    paddingRight: "5px",
    paddingLeft: "5px",
    width: 320,
    [`@media (min-width: 900px) and (max-width: 1200px)`]: {
      marginLeft: "20px",
      alignSelf: "end",
    },
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
    width: containerClass ? "160px" : "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "black",
    margin: 0,
  }),
  supporterSubtitle: (containerClass) => ({
    margin: 0,
    fontSize: "12px",
    color: "#484848",
    whiteSpace: "nowrap",
    width: containerClass ? "160px" : "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [`@media (min-width: 1200px) and (max-width: 1370px)`]: {
      width: "150px",
    },
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
    textTransform: "none",
    [theme.breakpoints.down("sm")]: {
      fontSize: "15px",
    },
  },
  arrowIcon: {
    color: "#207178",
  },
}));

const HubSupporters = ({
  supportersList,
  containerClass,
  mobileVersion,
  hubName,
}: HubSupporter) => {
  const classes = useStyles({ containerClass: containerClass });
  const isSmallOrMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const [openSupportersDialog, setOpenSupportersDialog] = useState(false);
  const toggleOpenSupportersDialog = () => {
    setOpenSupportersDialog(!openSupportersDialog);
  };
  return (
    <>
      {!isSmallOrMediumScreen && !mobileVersion ? (
        <HubSupportersSlider
          classes={classes}
          texts={texts}
          containerClass={containerClass}
          supportersList={supportersList}
          locale={locale}
        />
      ) : (
        <>
          <HubSupportersInSmallDevice
            classes={classes}
            containerClass={containerClass}
            supportersList={supportersList}
            texts={texts}
            showAllSupporters={toggleOpenSupportersDialog}
          />
          <HubSupportersDialog
            supporters={supportersList}
            open={openSupportersDialog}
            onClose={toggleOpenSupportersDialog}
            hubName={hubName}
          />
        </>
      )}
    </>
  );
};

export default HubSupporters;

const CarouselItem = ({ supporter, classes, locale }) => {
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
          <p className={classes.supporterName}>
            {supporter?.organization_url_slug ? (
              <Link
                href={
                  getLocalePrefix(locale) + "/organizations/" + supporter?.organization_url_slug
                }
                underline="none"
                className={classes.supporterName}
              >
                {supporter?.name}
              </Link>
            ) : (
              supporter?.name
            )}
          </p>
          <p className={classes.supporterSubtitle}>{supporter.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const HubSupportersSlider = ({ classes, texts, containerClass, supportersList, locale }) => {
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
          autoPlay={true}
          autoPlaySpeed={10000}
        >
          {supportersList?.length > 0 &&
            supportersList.map((data) => (
              <CarouselItem supporter={data} classes={classes} locale={locale} />
            ))}
        </Carousel>
      </div>
    </div>
  );
};

const HubSupportersInSmallDevice = ({
  classes,
  containerClass,
  supportersList,
  texts,
  showAllSupporters,
}) => {
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
        <Button onClick={showAllSupporters} className={classes.allSupporters}>
          {texts.all_supporters} <ArrowRightIcon className={classes.arrowIcon} />{" "}
        </Button>
      </Typography>
    </div>
  );
};
