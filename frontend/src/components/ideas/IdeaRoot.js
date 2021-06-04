import { Card, makeStyles, Tooltip, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import React, { useContext } from 'react';
import getTexts from '../../../public/texts/texts';
import theme from '../../themes/theme';
import UserContext from '../context/UserContext';
import MiniProfilePreview from '../profile/MiniProfilePreview';
import IdeaHubIcon from './IdeaHubIcon';

const useStyles = makeStyles({
  root: {
    borderColor: theme.palette.primary.main,
    padding: theme.spacing(1)
  },
  closeStyle: {
    cursor: "pointer"
  },
  ideaInfo: {
    marginLeft: theme.spacing(4)
  },
  name: {
    fontWeight: "bold",
    fontSize: 22
  },
  topItem: {
    marginTop: theme.spacing(2)
  },
  location: {
    display: "flex",
    alignItems: "center"
  },
  locationText: {
    marginLeft: theme.spacing(0.5)
  },
  titleAndHubIconWrapper: {
    display: "flex",
    justifyContent: "space-between"
  },
  ideaHubIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
})

export default function IdeaRoot({idea, onIdeaClose}) {
  const classes = useStyles();
  const handleIdeaEditClose = (e) => {
    onIdeaClose(e)
  }
  const { locale } = useContext(UserContext)
  const texts = getTexts({page: "idea", locale: locale})
  return (
    <Card variant="outlined" className={classes.root}>
      <CloseIcon className={classes.closeStyle} onClick={handleIdeaEditClose}/>
      <div className={classes.ideaInfo}>
        <div className={classes.titleAndHubIconWrapper}>
          <Typography color="secondary" className={classes.name} component="h2">{idea.name}</Typography>
          <IdeaHubIcon idea={idea} className={classes.ideaHubIcon} />
        </div> 
        <Typography variant="body1" className={classes.topItem}>{idea.short_description}</Typography>
        <Tooltip title={texts.the_ideas_creator}>
          <MiniProfilePreview className={classes.topItem} profile={idea.user} size="medium"/>
        </Tooltip>
        <div className={`${classes.topItem} ${classes.location}`}>
          <Tooltip title={texts.location}><LocationOnIcon /></Tooltip>
          <Typography variant="body1" className={classes.locationText}>{idea.location}</Typography>
        </div>
      </div>
    </Card>
  )
}