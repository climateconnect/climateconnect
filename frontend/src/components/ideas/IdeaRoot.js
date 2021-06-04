import { Card, makeStyles, Tooltip, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import React, { useContext, useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { apiRequest } from '../../../public/lib/apiOperations';
import getTexts from '../../../public/texts/texts';
import theme from '../../themes/theme';
import UserContext from '../context/UserContext';
import LoadingSpinner from '../general/LoadingSpinner';
import MiniProfilePreview from '../profile/MiniProfilePreview';
import IdeaHubIcon from './IdeaHubIcon';
import IdeaRatingSlider from './IdeaRatingSlider';

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
  },
  ratingSlider: {
    height: 10
  },
  loadingSpinner: {
    width: 40,
    height: 40
  },
  loadingSpinnerContainer: {
    height: "50vh",
    display: "flex",
    justifyContent: "center"
  }
})

export default function IdeaRoot({idea, onIdeaClose}) {
  const classes = useStyles();
  const token = new Cookies().get("token")

  const handleIdeaEditClose = (e) => {
    onIdeaClose(e)
  }

  const [loading, setLoading] = useState(!!token)
  const [userRating, setUserRating] = useState({
    rating_score: 0,
    has_rated: idea.rating?.has_rated
  })

  useEffect(async function(){
    if(token){
      setLoading(true)
      setUserRating(await getUserRatingFromServer(idea, token, locale))
      setLoading(false)
    }
    setAverageRating({
      rating_score: idea.rating?.rating_score,
      number_of_ratings: idea.rating?.number_of_ratings
    })
  }, [idea])

  const [averageRating, setAverageRating] = useState({
    rating_score: idea.rating?.rating_score,
    number_of_ratings: idea.rating?.number_of_ratings
  })
  const handleRatingChange = (event, newRating) => {
    event.preventDefault();
    setUserRating({...userRating, rating_score: newRating})
  } 

  const calculateNewAverageRatingLocally = (newRating) => {
    return (idea.rating?.rating_score * idea.rating?.number_of_ratings + newRating) / (idea.rating?.number_of_ratings + 1)
  }

  const handleRateProject = async (event, newRating) => {
    console.log("setting average rating!")
    //calculating new rating locally so we can give instant feedback to the user
    setAverageRating({
      rating_score: calculateNewAverageRatingLocally(newRating),
      number_of_ratings: userRating.has_rated ? averageRating.number_of_ratings : averageRating.number_of_ratings + 1
    })
    const payload = {
      rating: newRating
    }
    console.log(`/api/ideas/${idea.url_slug}/ratings/`)
    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/ideas/${idea.url_slug}/ratings/`,
        payload: payload,
        token: token,
        locale: locale
      })
      console.log(response.data)
      setAverageRating(response.data.average_rating)
    } catch(err) {
      console.log(err);
    }
  }

  const { locale } = useContext(UserContext)
  const texts = getTexts({page: "idea", locale: locale})
  return (
    <Card variant="outlined" className={classes.root}>
      {loading ? 
        <div className={classes.loadingSpinnerContainer}>
          <LoadingSpinner isLoading className={classes.loadingSpinner}/>
        </div> 
      :
        <>
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
            <div className={classes.topItem}>
              <IdeaRatingSlider 
                value={userRating.rating_score} 
                averageRating={averageRating?.rating_score}
                onChange={handleRatingChange}
                onChangeCommitted={handleRateProject}
                aria-labelledby="continuous-slider"
                valueLabelDisplay="auto"
                track={false}
              />
            </div>
          </div>
        </>
      }
    </Card>
  )
}

const getUserRatingFromServer = async(idea, token, locale) => {
  try {
    console.log(idea)
    console.log(token)
    const response = await apiRequest({
      method: "get",
      url: `/api/ideas/${idea.url_slug}/my_rating/`,
      token: token,
      locale: locale
    })
    return {
      rating_score: response.data.user_rating,
      has_rated: response.data.has_user_rated
    }
  } catch(err) {
    console.log(err);
  }
}