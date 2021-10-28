import { Button, makeStyles } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React, { useRef, useState } from "react";
import DropDownList from "../header/DropDownList";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  }
}))

export default function DropDownButton({buttonProps, options, children}) {
  const classes = useStyles()
  const [showOptions, setShowOptions] = useState(false)
  const buttonRef = useRef(null)
  
  const handleShowOptions = (e) => {
    e.preventDefault()
    setShowOptions(true)
  }

  const handleHideOptions = () => {
    setShowOptions(false)
  }
  
  return (
    <div 
      className={classes.root}
    >
      <Button 
        color="primary" 
        ref={buttonRef}
        onMouseEnter={handleShowOptions}
        onMouseLeave={handleHideOptions}
        {...buttonProps} 
      >
        {children}
        <ArrowDropDownIcon />
      </Button>
      <DropDownList
        buttonRef={buttonRef}
        handleClose={handleHideOptions}
        handleOpen={handleShowOptions}
        items={options}
        open={showOptions}
      />
    </div>
  )
}