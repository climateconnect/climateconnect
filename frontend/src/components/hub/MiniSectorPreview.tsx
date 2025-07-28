import { Card, IconButton, Link, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SelectField from "../general/SelectField";

const useStyles = makeStyles<Theme, any>((theme) => ({
  link: {
    ["&:hover"]: {
      textDecoration: "none",
    },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    cursor: (props) => (props.sector?.url_slug ? "pointer" : "default"),
    "-webkit-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    userSelect: "none",
    position: "relative",
  },
  textContainer: {
    boxShadow: "3px 3px 6px #00000017",
    border: "1px solid #E0E0E0",
    padding: theme.spacing(1),
    height: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderImage: {
    visibility: "hidden",
    width: "100%",
  },
  placeholderImageContainer: (props) => ({
    background: props.createMode
      ? `url(/images/mini_hub_preview_background.jpg)`
      : `url(${getImageUrl(props.image)})`,
    backgroundSize: "cover",
    width: "100%",
    height: 60,
    backgroundPosition: "center",
  }),
  sectorName: {
    fontSize: 19,
    fontWeight: 600,
  },
  sectorIcon: {
    height: 26,
    marginBottom: -3,
    marginRight: theme.spacing(0.25),
  },
  closeIconButton: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    color: "red",
    background: "rgba(255, 255, 255, 0.9)",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.98)",
    },
  },
}));

export default function MiniSectorPreview({
  sector,
  sectorsToSelectFrom,
  editMode,
  createMode = false,
  onSelect,
  onClickRemoveSector,
}) {
  const classes = useStyles({
    createMode: createMode,
    sector: sector,
    image: sector?.image,
  });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const handleRemoveHub = (event) => {
    event.preventDefault();
    onClickRemoveSector(sector);
  };
  // TODO: Link to filtered projects instead to hub
  //  Case 1: Location hub (?hub=erlangen) -> link to hub page filtered by this sector
  //  Case 2: General platform -> link to browse page filtered by this sector

  return (
<<<<<<< HEAD
    <Link
      href={sector && getLocalePrefix(locale) + `/hubs/${sector.url_slug}/browse`}
      target="_blank"
      className={classes.link}
      underline="hover"
    >
      <Card className={classes.root}>
        {editMode && (
          <IconButton className={classes.closeIconButton} size="small" onClick={handleRemoveHub}>
            <CloseIcon />
          </IconButton>
        )}
        <div className={classes.placeholderImageContainer}>
          <img
            src={
              createMode
                ? "/images/mini_hub_preview_background.jpg"
                : getImageUrl(sector?.thumbnail_image)
            }
            className={classes.placeholderImage}
          />
        </div>
        <div className={classes.textContainer}>
          {createMode ? (
            <SelectField
              label={texts.add_a_hub_where_you_are_active}
              size="small"
              color="contrast"
              options={sectorsToSelectFrom}
              onChange={(event) => event.target.value && onSelect(event)}
            />
          ) : (
            <Typography color="text" className={classes.sectorName}>
              {sector.icon && <img src={getImageUrl(sector.icon)} className={classes.sectorIcon} />}
              {sector?.name}
            </Typography>
          )}
        </div>
      </Card>
    </Link>
=======
    <Card className={classes.root}>
      {editMode && (
        <IconButton className={classes.closeIconButton} size="small" onClick={handleRemoveHub}>
          <CloseIcon />
        </IconButton>
      )}
      <div className={classes.placeholderImageContainer}>
        <img
          src={createMode ? "/images/mini_hub_preview_background.jpg" : getImageUrl(sector?.image)}
          className={classes.placeholderImage}
        />
      </div>
      <div className={classes.textContainer}>
        {createMode ? (
          <SelectField
            label={texts.add_a_sector_where_you_are_active}
            size="small"
            color="contrast"
            options={sectorsToSelectFrom}
            onChange={(event) => event.target.value && onSelect(event)}
          />
        ) : (
          <Typography color="text" className={classes.sectorName}>
            {sector.icon && <img src={getImageUrl(sector.icon)} className={classes.sectorIcon} />}
            {sector?.name}
          </Typography>
        )}
      </div>
    </Card>
>>>>>>> master
  );
}
