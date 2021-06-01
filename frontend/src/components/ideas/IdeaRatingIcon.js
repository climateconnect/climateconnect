import { makeStyles } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(theme=> ({
  heartContainer: {
    height: 40,
    position: "relative",
    width: 47,
    marginLeft: theme.spacing(1.5)
  },
  heartIconContainer: {
    position: "absolute",
    left: 0,
    height: 40,
  },
  heartIcon: {
    height: "100%",
    visibility: "hidden"
  },
  coloredHeartIconDisplayBox: props => ({
    background: "url('/images/planet-earth-heart.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% auto",
    backgroundPosition: "center bottom",
    width: "100%",
    height: `${props.rating}%`,
    position: "absolute",
    bottom: 0
  }),
  greyHeartIconDisplayBox: props => ({
    background: "url('/images/planet-earth-grey.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% auto",
    backgroundPosition: "center top",
    width: "100%",
    height: `${100-props.rating}%`,
    position: "absolute",
    top: 0
  })
}))

export default function IdeaRatingIcon({rating}) {
  const classes = useStyles({rating: rating})
  return (
    <div className={classes.heartContainer}>
      <div className={`${classes.heartIconContainer} ${classes.greyHeartIconContainer}`}>
      <div className={classes.greyHeartIconDisplayBox} />
        <img src={"/images/planet-earth-grey.svg"} className={`${classes.heartIcon} ${classes.greyHeartIcon}`}/>
      </div>
      <div className={`${classes.heartIconContainer} ${classes.coloredHeartIconContainer}`}>
        <div className={classes.coloredHeartIconDisplayBox} />
        <img src={"/images/planet-earth-heart.svg"} className={`${classes.heartIcon} ${classes.coloredHeartIcon}`}/>
      </div>
    </div>
  )
}