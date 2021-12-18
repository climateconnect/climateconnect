import { Link, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import HubsDropDown from "./HubsDropDown";

const useStyles = makeStyles(() => ({
  spaceAround: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
}));

export default function HubLinks({
  hubs,
  locale,
  linkClassName,
  isNarrowScreen,
  showAllProjectsButton,
  onlyShowDropDown,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState({ sectorHubs: false, cityHubs: false });
  const texts = getTexts({ page: "navigation", locale: locale });
  const sectorHubs = hubs.filter((h) => h.hub_type === "sector hub");
  const locationHubs = hubs.filter((h) => h.hub_type === "location hub");
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
    <div className={isNarrowScreen && classes.spaceAround}>
      {!isMediumScreen &&
        !onlyShowDropDown &&
        (showAllProjectsButton ? (
          <Link
            className={`${classes.link} ${classes.allProjectsLink}`}
            href={getLocalePrefix(locale) + "/browse"}
          >
            {texts.all_projects}
          </Link>
        ) : (
          sectorHubs.slice(0, 3).map((hub) => (
            <Link
              className={linkClassName}
              key={hub.url_slug}
              href={`${getLocalePrefix(locale)}/hubs/${hub.url_slug}`}
            >
              {hub.name}
            </Link>
          ))
        ))}
      {sectorHubs?.length > (onlyShowDropDown ? 0 : 3) && (
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
          label="CityHubs"
          isNarrowScreen={isNarrowScreen}
          onToggleOpen={(e) => handleToggleOpen(e, "cityHubs")}
          open={open["cityHubs"]}
          onOpen={(e) => handleOpen(e, "cityHubs")}
          onClose={() => handleClose("cityHubs")}
        />
      )}
    </div>
  );
}
