import { Grid, makeStyles, Button } from "@material-ui/core";
import React, { useState } from "react";
import MiniHubPreview from "./MiniHubPreview";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
  firstItem: {
    marginLeft: theme.spacing(-1),
  },
  lastItem: {
    marginRight: theme.spacing(-1),
  },
  hubButtonsContainer: {
    display: "flex",
    justifyContent: "center",
    marginLeft: "-35%",
  },
}));

export default function MiniHubPreviews({
  hubs,
  allHubs,
  allowCreate,
  editMode,
  onSelectNewHub,
  onClickRemoveHub,
  maxHubsToShow,
  texts,
}) {
  const classes = useStyles();
  const [showMoreSectors, setShowMoreSectors] = useState(false);
  const handleShowMoreSectors = () => {
    setShowMoreSectors(!showMoreSectors);
  };
  const hubsToDisplay = showMoreSectors ? hubs : hubs.slice(0, maxHubsToShow);

  return (
    <>
      <Grid container component="ul" spacing={2} className={`${classes.reset} ${classes.root}`}>
        {hubsToDisplay
          .filter((hub) => hub.hub_type !== "location hub")
          .map((hub, index) => (
            <GridItem
              hub={hub}
              key={hub.url_slug}
              editMode={editMode}
              isFirstItem={index === 0}
              onClickRemoveHub={onClickRemoveHub}
            />
          ))}
        {allowCreate && (
          <GridItem
            createMode
            isFirstItem={hubs.length === 0}
            isLastItem
            hubsToSelectFrom={allHubs}
            onSelectNewHub={onSelectNewHub}
          />
        )}
      </Grid>
      {!editMode && hubs.length > maxHubsToShow && (
        <div className={classes.hubButtonsContainer}>
          <Button onClick={handleShowMoreSectors}>
            {showMoreSectors ? (
              <>
                <ExpandLessIcon />
                {texts.show_less}
              </>
            ) : (
              <>
                <ExpandMoreIcon />
                {texts.show_more}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

function GridItem({
  hub,
  createMode,
  editMode,
  hubsToSelectFrom,
  onSelectNewHub,
  onClickRemoveHub,
}) {
  return (
    <Grid
      key={hub ? hub.url_slug : "create"}
      item
      xs={12}
      sm={editMode ? 6 : 12}
      md={editMode ? 6 : 12}
      lg={editMode ? 6 : 12}
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
