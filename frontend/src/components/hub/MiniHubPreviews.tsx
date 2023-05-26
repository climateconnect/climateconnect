import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import MiniHubPreview from "./MiniHubPreview";

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

export default function MiniHubPreviews({
  hubs,
  allHubs,
  allowCreate,
  editMode,
  onSelectNewHub,
  onClickRemoveHub,
}) {
  const classes = useStyles();
  return (
    <Grid container component="ul" spacing={2} className={`${classes.reset} ${classes.root}`}>
      {hubs
        .filter((hub) => hub.hub_type !== "location hub")
        .map((hub, index) => (
          <GridItem
            hub={hub}
            key={hub.url_slug}
            editMode={editMode}
            onClickRemoveHub={onClickRemoveHub}
          />
        ))}
      {allowCreate && (
        <GridItem createMode hubsToSelectFrom={allHubs} onSelectNewHub={onSelectNewHub} />
      )}
    </Grid>
  );
}

function GridItem({
  hub,
  createMode,
  editMode,
  hubsToSelectFrom,
  onSelectNewHub,
  onClickRemoveHub,
}: any) {
  return (
    <Grid
      key={hub ? hub.url_slug : "create"}
      xs={12}
      sm={editMode ? 6 : 12}
      md={8}
      lg={6}
      component="li"
    >
      <MiniHubPreview
        hub={hub}
        createMode={createMode}
        editMode={editMode}
        hubsToSelectFrom={hubsToSelectFrom}
        onSelect={onSelectNewHub}
        onClickRemoveHub={onClickRemoveHub}
      />
    </Grid>
  );
}
