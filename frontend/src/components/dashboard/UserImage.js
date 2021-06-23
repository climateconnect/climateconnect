import { Avatar, makeStyles } from "@material-ui/core"
import React from "react"
import { getImageUrl } from "../../../public/lib/imageOperations"

const useStyles = makeStyles(theme => ({

}))

export default function UserImage({user}) {
  const classes = useStyles()
  console.log(user)
  return (
    <Avatar 
      alt={user?.first_name + " " +  user?.last_name + "'s picture"}
      component="div"
      src={getImageUrl(user?.image)}
      className={classes.avatar}
    />
  )
}