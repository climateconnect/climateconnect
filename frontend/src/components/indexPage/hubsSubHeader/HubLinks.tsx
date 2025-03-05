import { Link, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useState } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import HubsDropDown from "./HubsDropDown";
import { buildHubUrl } from "../../../../public/lib/urlBuilder";
import isLocationHubLikeHub from "../../../../public/lib/isLocationHubLikeHub";

const useStyles = makeStyles(() => ({
  spaceAround: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function HubLinks({
  hubs,
  locale,
  linkClassName,
  isNarrowScreen,
  showAllProjectsButton,
  onlyShowDropDown,
  isLocationHub,
}: any) {
  const classes = useStyles();
  const [open, setOpen] = useState({ sectorHubs: false, climateHubs: false });
  const texts = getTexts({ page: "navigation", locale: locale });
  const sectorHubs = hubs.filter((h) => h.hub_type === "sector hub");
  const locationHubs = hubs.filter((h) => isLocationHubLikeHub(h.hub_type));
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  const handleOpen = (e, type) => {
    e.preventDefault();
    const newOpen = {
      ...open,
      [type]: true,
    };
    for (const key of Object.keys(open)) {
      if (key !== type) {
        newOpen[key] = false;
      }
    }
    setOpen(newOpen);
  };

  const handleClose = (type) => {
    setOpen({ ...open, [type]: false });
  };

  const handleToggleOpen = (e, type) => {
    e.preventDefault();
    const newOpen = {
      ...open,
      [type]: !open[type],
    };
    if (!open[type]) {
      for (const key of Object.keys(open)) {
        if (key !== type) {
          newOpen[key] = false;
        }
      }
    }
    setOpen(newOpen);
  };
  return (
    <div className={`${isNarrowScreen && classes.spaceAround} ${classes.wrapper}`}>
      {!isMediumScreen &&
        !onlyShowDropDown &&
        (showAllProjectsButton ? (
          <Link
            className={linkClassName}
            href={getLocalePrefix(locale) + "/browse"}
            underline="hover"
          >
            {texts.all_projects}
          </Link>
        ) : (
          sectorHubs.slice(0, 3).map((hub) => (
            <Link
              className={linkClassName}
              key={hub.url_slug}
              // href={`${getLocalePrefix(locale)}/hubs/${hub.url_slug}`}
              href={buildHubUrl({
                hubUrlSlug: hub?.url_slug,
                locale: locale,
                pathType: "hubBrowse",
              })}
              underline="hover"
            >
              {hub.name}
            </Link>
          ))
        ))}
      {!(isLocationHub && isNarrowScreen) && sectorHubs?.length > (onlyShowDropDown ? 0 : 3) && (
        <HubsDropDown
          hubs={sectorHubs}
          label="SectorHubs"
          isNarrowScreen={isNarrowScreen}
          onToggleOpen={(e) => handleToggleOpen(e, "sectorHubs")}
          open={open["sectorHubs"]}
          onOpen={(e) => handleOpen(e, "sectorHubs")}
          onClose={() => handleClose("sectorHubs")}
        />
      )}
      {locationHubs?.length > 0 && (
        <HubsDropDown
          hubs={locationHubs}
          label="ClimateHubs"
          isNarrowScreen={isNarrowScreen}
          onToggleOpen={(e) => handleToggleOpen(e, "climateHubs")}
          open={open["climateHubs"]}
          onOpen={(e) => handleOpen(e, "climateHubs")}
          onClose={() => handleClose("climateHubs")}
          addLocationHubExplainerLink
        />
      )}
    </div>
  );
}
