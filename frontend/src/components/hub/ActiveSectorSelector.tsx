import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SectorsPreview from "./SectorsPreview";

type SelectedHubs = {
  hub_type: string;
  icon?: string;
  landing_page_component?: string;
  name: string;
  quick_info?: string;
  thumbnail_image?: string;
  url_slug: string;
};

type ActiveSectorSelectorProps = {
  selectedHubs: SelectedHubs[];
  hubsToSelectFrom: SelectedHubs[];
  onSelectNewHub: (hub: SelectedHubs) => void;
  onClickRemoveHub: (hub: SelectedHubs) => void;
};

const useStyles = makeStyles(() => ({
  headline: {
    fontWeight: 700,
  },
}));

export default function ActiveSectorSelector({
  selectedHubs,
  hubsToSelectFrom,
  onSelectNewHub,
  onClickRemoveHub,
}: ActiveSectorSelectorProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <div>
      <Typography color="text" className={classes.headline}>
        {texts.add_hubs_in_which_your_organization_is_active}
      </Typography>
      <SectorsPreview
        allowCreate
        editMode
        allHubs={hubsToSelectFrom}
        hubs={selectedHubs}
        onSelectNewHub={onSelectNewHub}
        onClickRemoveHub={onClickRemoveHub}
      />
    </div>
  );
}
