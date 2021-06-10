import { Button, IconButton, makeStyles } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import React, { useContext } from "react";
import { redirect } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(theme => ({
  signUpButton: {
    color: theme.palette.primary.main,
    background: "white"
  }
}))

export default function SignUpAction({onClose}) {
  const classes = useStyles()
  const { locale } = useContext(UserContext)
  const texts = getTexts({page: "general", locale: locale})

  const onClickSignUp = () => {
    let redirectUrl = window.location.href.replace(window.location.origin, "").replace(`/${locale}/`, "")
    if(redirectUrl[0] === "/") {
      redirectUrl = redirectUrl.slice(1, redirectUrl.length)
    }
    console.log(redirectUrl)
    redirect("/signin", {redirect: redirectUrl})
  }
  
  return (
    <>
      <Button className={classes.signUpButton} variant="contained" onClick={onClickSignUp} >
        {texts.log_in}
      </Button>
      <IconButton aria-label="close" color="inherit" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>  
  )
}