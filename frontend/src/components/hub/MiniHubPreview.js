import {
  Card,
  IconButton,
  Link,
  makeStyles,
  Typography,
  TextField,
  Collapse,
  CardMedia,
  CardActions,
} from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import clsx from "clsx";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SelectField from "../general/SelectField";

const useStyles = makeStyles((theme) => ({
  link: {
    ["&:hover"]: {
      textDecoration: "none",
    },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
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
    minheight: 60,
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
      : `url(${getImageUrl(props.thumbnail_image)})`,
    backgroundSize: "cover",
    width: "100%",
    height: 60,
    backgroundPosition: "center",
  }),
  hubName: {
    fontSize: 19,
    fontWeight: 600,
  },
  hubIcon: {
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
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  collapsedTextfield: {
    margin: theme.spacing(1),
    width: "calc(100% - " + theme.spacing(2) + "px)",
  },
}));

export default function MiniHubPreview({
  hub,
  hubsToSelectFrom,
  editMode,
  createMode = false,
  onSelect,
  onClickRemoveHub,
  isProfile,
}) {
  const classes = useStyles({ createMode: createMode, thumbnail_image: hub?.thumbnail_image });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const onClickExpandCard = !createMode && editMode && isProfile;

 

  const handleRemoveHub = (event) => {
    event.preventDefault();
    onClickRemoveHub(hub);
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };


  return (
    <Card className={classes.root}>
      <Link
        className={classes.link}
        {...(onClickExpandCard ? {onClick: handleExpandClick}: {href: hub && getLocalePrefix(locale) + `/hubs/` + hub.url_slug, target: "_blank"})}
      >
        <CardActionArea>
          <div className={classes.placeholderImageContainer}>
            {editMode && (
              <IconButton
                className={classes.closeIconButton}
                size="small"
                onClick={handleRemoveHub}
              >
                <CloseIcon />
              </IconButton>
            )}
            <img
              src={
                createMode
                  ? "/images/mini_hub_preview_background.jpg"
                  : getImageUrl(hub?.thumbnail_image)
              }
              className={classes.placeholderImage}
            />
          </div>
        </CardActionArea>

        <CardActions disableSpacing>
          {createMode ? (
            <SelectField
              label={texts.add_a_hub_where_you_are_active}
              size="small"
              options={hubsToSelectFrom}
              onChange={(event) => event.target.value && onSelect(event)}
            />
          ) : (
            <CardActionArea
              className={clsx(classes.expand)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <Typography color="secondary" className={classes.hubName}>
                {hub.icon && <img src={getImageUrl(hub.icon)} className={classes.hubIcon} />}
                {hub?.name}
              </Typography>
            </CardActionArea>
          )}
          {!createMode && isProfile && (
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              // onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
        </CardActions>
      </Link>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TextField
          className={classes.collapsedTextfield}
          // fullWidth
          //value={editedAccount.name}
          //onChange={(event) => handleTextFieldChange("name", event.target.value)}
          label="Description"
          placeholder={texts.you_can_describe_why_you_are_interested}
          multiline
          rows={7}
          size="small"
          // variant="outlined"
        />
      </Collapse>

      {/* <div className={classes.textContainer}>
        {createMode ? (
          <SelectField
            label={texts.add_a_hub_where_you_are_active}
            size="small"
            options={hubsToSelectFrom}
            onChange={(event) => event.target.value && onSelect(event)}
          />
        ) : (
          <CardActionArea
            className={clsx(classes.expand)}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <Typography color="secondary" className={classes.hubName}>
              {hub.icon && <img src={getImageUrl(hub.icon)} className={classes.hubIcon} />}
              {hub?.name}
            </Typography>
          </CardActionArea>
        )}
      </div> */}
    </Card>
  );
}
