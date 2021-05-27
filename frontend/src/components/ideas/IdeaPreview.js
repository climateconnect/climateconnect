import { Card, CardMedia, makeStyles, Typography, Grid } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import CreateIdeaDialog from "./createIdea/CreateIdeaDialog";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    border: `3px solid ${props.borderColor}`,
    padding: theme.spacing(1.5),
    textAlign: "center",
    borderRadius: theme.spacing(2),
    background: "#F8F8F8",
    position: "relative",
    cursor: "pointer",
  }),
  createCardHeadline: {
    fontWeight: 600,
    fontSize: 18,
  },
  link: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    cursor: "pointer",
  },
  plusIconContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4.5),
  },
  addIcon: {
    fontSize: 40,
    background: theme.palette.primary.main,
    color: "white",
    borderRadius: 20,
  },
  shareIdeaBottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: theme.palette.primary.main,
    color: "white",
    fontSize: 20,
    fontWeight: 600,
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ideaIcon: {
    fontSize: 23,
    marginTop: -3,
  },
  ratingIcon: {
    width: '50px',
    height: '50px',
    opacity: 1
  }
}));

//This component is currently only capable of displaying the "add new idea" card and not a real idea preview card
export default function IdeaPreview({ idea, isCreateCard, allHubs, userOrganizations }) {
  const colors = [
    theme.palette.primary.main, theme.palette.primary.light,
    theme.palette.secondary.main, theme.palette.secondary.light
  ]
  const color = colors[Math.floor(Math.random() * colors.length)];
  const classes = useStyles({ borderColor: !isCreateCard && color});
  const [open, setOpen] = useState(false);
  const handleCardClick = (e) => {
    e.preventDefault();
    if (isCreateCard) {
      setOpen(true);
    }
  };
  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Card
        className={`${classes.root} ${isCreateCard}`}
        variant="outlined"
        onClick={handleCardClick}
      >
        {isCreateCard ? <CreateCardContent /> : <IdeaCardContent idea={idea} />}
      </Card>
      {isCreateCard && (
        <CreateIdeaDialog
          open={open}
          onClose={onClose}
          allHubs={allHubs}
          userOrganizations={userOrganizations}
        />
      )}
    </>
  );
}

function CreateCardContent() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const classes = useStyles();
  return (
    <div>
      <Typography color="primary" component="h2" className={classes.createCardHeadline}>
        {texts.share_your_idea_and_find_the_right_collaborators}
      </Typography>
      <div className={classes.plusIconContainer}>
        <AddIcon className={classes.addIcon} />
      </div>
      <div className={classes.shareIdeaBottomSection}>
        <EmojiObjectsIcon className={classes.ideaIcon} />
        {texts.share_idea}
      </div>
    </div>
  );
}

function IdeaCardContent(idea) {
  const classes = useStyles();
  return (
    <div>
      <Typography color="primary" component="h2" className={classes.createCardHeadline}>
        {idea.idea.name}
      </Typography>
      <Grid container>
        <Grid item xs={6}>
          <CardMedia 
            className={classes.media} 
            title={idea.idea.url_slug}
          >
            <img src={idea.idea.hub_image} alt={idea.idea.name}/>
          </CardMedia>
        </Grid>
        <Grid item xs={6}>
          <FavoriteBorderIcon className={classes.ratingIcon}/>
        </Grid>
      </Grid>
      <div>
        {idea.idea.image === undefined || idea.idea.image === null ? (
          <Typography color="secondary" component="h4">
            {idea.idea.short_description}
          </Typography>
        ) : (
          <CardMedia
            className={classes.media}
            title={idea.idea.url_slug}
            image={getImageUrl(idea.idea.image)}
          >
            <img src={getImageUrl(idea.idea.image)} alt={idea.idea.name}/>
          </CardMedia>
        )}
      </div>
    </div>
  );
}
