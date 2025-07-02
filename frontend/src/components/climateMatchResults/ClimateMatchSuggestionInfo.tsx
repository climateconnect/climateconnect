import { Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import IdeaHubIcon from "../ideas/IdeaHubIcon";
import IdeaRatingIcon from "../ideas/IdeaRatingIcon";
import ContactCreatorButton from "../project/Buttons/ContactCreatorButton";
import LocationDisplay from "../project/LocationDisplay";
import ProjectSectorsDisplay from "../project/ProjectSectorsDisplay";
import ClimateMatchResultImage from "./ClimateMatchResultImage";
import IconNumberDisplay from "./IconNumberDisplay";

const useStyles = makeStyles<Theme, { displayContactButton?: boolean }>((theme) => ({
  wrapper: (props) => ({
    width: props.displayContactButton ? "100%" : "default",
  }),
  root: {
    display: "flex",
  },
  suggestionInfoContainer: {
    maxWidth: 650,
    marginLeft: theme.spacing(2),
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: 700,
    overflowWrap: "anywhere",
    display: "flex",
    justifyContent: "space-between",
  },
  shortDescription: {
    marginTop: theme.spacing(1),
  },
  lowerBar: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  lowerBarIdeas: {
    alignItems: "center",
    paddingTop: theme.spacing(1),
  },
  lowerBarLeftSide: {
    display: "flex",
    ["@media(max-width: 500px)"]: {
      flexDirection: "column",
    },
  },
  lowerBarRightSide: {
    display: "flex",
    marginLeft: theme.spacing(2),
    ["@media(max-width: 500px)"]: {
      marginLeft: 0,
      flexDirection: "column",
    },
  },
  infoOverview: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  iconNumberDisplay: {
    marginRight: theme.spacing(2),
  },
  locationText: {
    fontSize: 15,
    maxWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  locationIcon: {
    fontSize: 19,
  },
  locationDisplay: {
    marginRight: theme.spacing(2),
    cursor: "default",
  },
  projectCategories: {
    cursor: "default",
  },
  smallLocationIcon: {
    fontSize: 15,
  },
  smallTextIcon: {
    fontSize: 12,
  },
  smalLocationDisplay: {
    marginTop: theme.spacing(0.5),
    display: "flex",
    justifyContent: "center",
  },
  spaceBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  flexEnd: {
    display: "flex",
    justifyContent: "flex-end",
  },
  contactCreatorButton: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
  contactCreatorBelowContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  centerImageContainer: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function ClimateMatchSuggestionInfo({
  suggestion,
  className,
  displayContactButton,
  creator,
  handleClickContact,
  background,
  isInSlider,
}: any) {
  const classes = useStyles({ displayContactButton: displayContactButton });
  const suggestionInfoUnderImage = isInSlider || useMediaQuery<Theme>("(max-width:1525px)");
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  return (
    <div className={classes.wrapper}>
      <div className={`${className} ${classes.root}`}>
        <div className={isInSlider && classes.centerImageContainer}>
          {!isNarrowScreen && <ClimateMatchResultImage suggestion={suggestion} />}
          {!isNarrowScreen &&
            suggestionInfoUnderImage &&
            suggestion.ressource_type === "organization" && (
              <LocationDisplay
                location={suggestion.location}
                color="primary"
                className={classes.smalLocationDisplay}
                iconClassName={classes.smallLocationIcon}
                textClassName={classes.smallTextIcon}
              />
            )}
        </div>
        <div className={classes.suggestionInfoContainer}>
          <div className={classes.infoOverview}>
            <SuggestionContent
              name={suggestion.name}
              description={suggestion.short_description}
              isNarrowScreen={isNarrowScreen}
              location={
                suggestion.ressource_type === "organization" &&
                !suggestionInfoUnderImage &&
                suggestion.location
              }
            />
            {!suggestionInfoUnderImage && <SuggestionBottomBar suggestion={suggestion} />}
          </div>
        </div>
      </div>
      <div className={classes.contactCreatorBelowContainer}>
        {displayContactButton && (
          <ContactCreatorButton
            creator={creator}
            contentType={suggestion.ressource_type}
            handleClickContact={handleClickContact}
            explanationBackground={background}
            className={classes.contactCreatorButton}
            withIcons={!isNarrowScreen}
            customCardWidth={!isNarrowScreen ? 220 : 300}
            withInfoCard={true}
            collapsable={!isNarrowScreen}
          />
        )}
      </div>
      <div>{suggestionInfoUnderImage && <SuggestionBottomBar suggestion={suggestion} />}</div>
    </div>
  );
}

const SuggestionBottomBar = ({ suggestion }) => (
  <>
    {suggestion.ressource_type === "project" && <ProjectBottomBar project={suggestion} />}
    {suggestion.ressource_type === "idea" && <IdeaBottomBar idea={suggestion} />}
  </>
);

const SuggestionContent = ({ name, description, location, isNarrowScreen }) => {
  const classes = useStyles({});
  return (
    <div>
      {!isNarrowScreen && (
        <Typography component="h2" color="secondary" className={classes.suggestionTitle}>
          {name}
          {location && <LocationDisplay location={location} color="primary" />}
        </Typography>
      )}
      <Typography className={classes.shortDescription}>{description}</Typography>
    </div>
  );
};

const IdeaBottomBar = ({ idea }) => {
  const classes = useStyles({});
  return (
    <div className={`${classes.lowerBar} ${classes.lowerBarIdeas}`}>
      <div className={classes.lowerBarLeftSide}>
        <IdeaHubIcon idea={idea} />
        <IdeaRatingIcon
          rating={idea.rating.rating_score}
          number_of_ratings={idea.rating.number_of_ratings}
        />
      </div>
      <div className={classes.lowerBarRightSide}>
        <LocationDisplay
          location={idea.location}
          color="primary"
          textClassName={classes.locationText}
          iconClassName={classes.locationIcon}
          className={classes.locationDisplay}
        />
      </div>
    </div>
  );
};

const ProjectBottomBar = ({ project }) => {
  const classes = useStyles({});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  return (
    <div className={classes.lowerBar}>
      <div className={classes.lowerBarLeftSide}>
        <LocationDisplay
          location={project.location}
          color="primary"
          textClassName={classes.locationText}
          iconClassName={classes.locationIcon}
          className={classes.locationDisplay}
        />
        <ProjectSectorsDisplay
          className={classes.projectCategories}
          main_project_sector={project.tags[0]?.project_tag?.name}
          color="primary"
        />
      </div>
      <div className={classes.lowerBarRightSide}>
        <IconNumberDisplay
          icon={{ icon: ModeCommentIcon }}
          number={project.number_of_comments}
          name={texts.number_of_comments}
          className={classes.iconNumberDisplay}
        />
        <IconNumberDisplay
          icon={{ icon: FavoriteIcon }}
          number={project.number_of_likes}
          name={texts.number_of_likes}
          className={classes.iconNumberDisplay}
        />
      </div>
    </div>
  );
};
