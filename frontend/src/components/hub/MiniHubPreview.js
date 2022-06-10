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
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
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
import AutoCompleteSearchBar from "../search/AutoCompleteSearchBar";

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
  descriptionWrapper: {
    padding: theme.spacing(1),
  },
  leadingQuotationMark: {
    display: "block",
    color: "#66BCB5",
  },
  trailingQuotationMark: {
    display: "block",
    color: "#66BCB5",
    transform: "rotate(180deg)",
    float: "right",
  },
  descriptionText: {
    display: "block",
    float: "center",
    margin: "auto",
    width: "90%",
    textAlign: "center",
  },
}));

export default function MiniHubPreview({
  hub,
  hubsToSelectFrom,
  interestsInfo,
  editMode,
  createMode = false,
  allowDescription,
  onSelect,
  onClickRemoveHub,
  onInterestsInfoTextFieldChange,
}) {
  const classes = useStyles({ createMode: createMode, thumbnail_image: hub?.thumbnail_image });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const showDescription = !createMode && allowDescription;
  const [expanded, setExpanded] = React.useState(showDescription ? true : false);

  const handleRemoveHub = (event) => {
    event.preventDefault();
    onClickRemoveHub(hub);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={classes.root}>
      <Link
        className={classes.link}
        {...(showDescription
          ? { onClick: handleExpandClick }
          : { href: hub && getLocalePrefix(locale) + `/hubs/` + hub.url_slug, target: "_blank" })}
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
          <>
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
          </>
          <>
            {showDescription && (
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </>
        </CardActions>
      </Link>

      {showDescription && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {/* <InterestDescription
            interestsInfo={interestsInfo}
            hubUrlSlug={hub.url_slug}
            editMode={editMode}
            onInterestsInfoTextFieldChange={onInterestsInfoTextFieldChange}
          /> */}
          {editMode ? (
            <TextField
              className={classes.collapsedTextfield}
              value={hub && allowDescription && interestsInfo[hub.url_slug]}
              onChange={(event) => onInterestsInfoTextFieldChange(hub.url_slug, event.target.value)}
              label="Description"
              placeholder={texts.you_can_describe_why_you_are_interested}
              multiline
              rows={7}
              size="small"
              variant="outlined"
            />
          ) : (
            <div className={classes.descriptionWrapper}>
              <FormatQuoteIcon className={classes.leadingQuotationMark} />
              <Typography className={classes.descriptionText}>
                {hub && allowDescription && interestsInfo[hub.url_slug]}
              </Typography>
              <FormatQuoteIcon className={classes.trailingQuotationMark} />
            </div>
          )}
        </Collapse>
      )}

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

// function InterestDescription({
//   interestsInfo,
//   hubUrlSlug,
//   editMode,
//   onInterestsInfoTextFieldChange,
// }) {
//   const createMode = false;
//   const hub = false;
//   const classes = useStyles({ createMode: createMode, thumbnail_image: hub?.thumbnail_image });
//   const { locale } = useContext(UserContext);
//   const texts = getTexts({ page: "hub", locale: locale });

//   return (
//     <>
//       {editMode ? (
//         <TextField
//           className={classes.collapsedTextfield}
//           value={hubUrlSlug && interestsInfo[hubUrlSlug]}
//           onChange={(event) => onInterestsInfoTextFieldChange(hubUrlSlug, event.target.value)}
//           label="Description"
//           placeholder={texts.you_can_describe_why_you_are_interested}
//           multiline
//           rows={7}
//           size="small"
//           variant="outlined"
//         />
//       ) : (
//         <>
//           <FormatQuoteIcon />
//           <Typography>{hubUrlSlug && interestsInfo[hubUrlSlug]}</Typography>
//           <FormatQuoteIcon />
//         </>
//       )}
//     </>
//   );
// }
