import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import MiniSectorPreview from "./MiniSectorPreview";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";

const useStyles = makeStyles((theme) => ({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
  root: {
    marginLeft: theme.spacing(-1),
  },
}));

export default function SectorsPreview({
  sectors,
  sectorsToSelectFrom,
  allowCreate,
  maxSelectedNumber = -1,
  editMode,
  onSelectNewSector,
  onClickRemoveSector,
}) {
  const classes = useStyles();
  return (
    <Grid container component="ul" spacing={2} className={`${classes.reset} ${classes.root}`}>
      {sectors.map((sector) => (
        <GridItem
          sector={sector}
          key={sector.key}
          editMode={editMode}
          onClickRemoveSector={onClickRemoveSector}
        />
      ))}
      {allowCreate && (maxSelectedNumber == -1 || sectors.length < maxSelectedNumber) && (
        <GridItem
          createMode
          sectorsToSelectFrom={sectorsToSelectFrom}
          onSelectNewSector={onSelectNewSector}
        />
      )}
    </Grid>
  );
}

function GridItem({
  sector,
  createMode,
  editMode,
  sectorsToSelectFrom,
  onSelectNewSector,
  onClickRemoveSector,
}: any) {
  return (
    <Grid
      key={sector ? sector.url_slug : "create"}
      xs={12}
      sm={editMode ? 6 : 12}
      md={8}
      lg={6}
      component="li"
    >
      <MiniSectorPreview
        sector={sector}
        createMode={createMode}
        editMode={editMode}
        sectorsToSelectFrom={sectorsToSelectFrom}
        onSelect={onSelectNewSector}
        onClickRemoveSector={onClickRemoveSector}
      />
    </Grid>
  );
}
