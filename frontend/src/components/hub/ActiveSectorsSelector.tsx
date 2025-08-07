import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SectorsPreview from "./SectorsPreview";

type selectedSector = {
  hub_type?: string;
  icon?: string;
  landing_page_component?: string;
  name: string;
  quick_info?: string;
  thumbnail_image?: string;
  url_slug?: string;
};

type ActiveSectorsSelectorProps = {
  selectedSectors: selectedSector[];
  sectorsToSelectFrom: selectedSector[];
  maxSelectedNumber?: number;
  onSelectNewSector: (event: any) => void;
  onClickRemoveSector: (sector: selectedSector) => void;
};

const useStyles = makeStyles(() => ({
  headline: {
    fontWeight: 700,
  },
}));

export default function ActiveSectorsSelector({
  selectedSectors,
  sectorsToSelectFrom,
  maxSelectedNumber = 3,
  onSelectNewSector,
  onClickRemoveSector,
}: ActiveSectorsSelectorProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <div>
      <Typography color="text" className={classes.headline}>
        {texts.add_sectors_that_fit}
      </Typography>
      <SectorsPreview
        allowCreate={true}
        editMode={true}
        maxSelectedNumber={maxSelectedNumber}
        sectorsToSelectFrom={sectorsToSelectFrom}
        sectors={selectedSectors}
        onSelectNewSector={onSelectNewSector}
        onClickRemoveSector={onClickRemoveSector}
      />
    </div>
  );
}
