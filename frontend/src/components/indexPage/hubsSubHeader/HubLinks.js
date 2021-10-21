import { Link, makeStyles, useMediaQuery } from "@material-ui/core";
import React from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import theme from "../../../themes/theme";
import HubsDropDown from "./HubsDropDown";

const useStyles = makeStyles(() => ({
  spaceAround: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
}));

export default function HubLinks({ hubs, locale, linkClassName, isNarrowScreen }) {
  const classes = useStyles();
  const sectorHubs = hubs.filter((h) => h.hub_type === "sector hub");
  const locationHubs = hubs.filter((h) => h.hub_type === "location hub");
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div className={isNarrowScreen && classes.spaceAround}>
      {!isMediumScreen &&
        sectorHubs.slice(0, 3).map((hub) => (
          <Link
            className={linkClassName}
            key={hub.url_slug}
            href={`${getLocalePrefix(locale)}/hubs/${hub.url_slug}`}
          >
            {hub.name}
          </Link>
        ))}
      {sectorHubs?.length > 3 && (
        <HubsDropDown hubs={sectorHubs} label="SectorHubs" isNarrowScreen={isNarrowScreen} />
      )}
      {locationHubs?.length > 0 && (
        <HubsDropDown hubs={locationHubs} label="CityHubs" isNarrowScreen={isNarrowScreen} />
      )}
    </div>
  );
}
