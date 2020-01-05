import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: "center",
    borderTop: `1px solid ${theme.palette.grey[300]}`
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box component="footer" className={classes.root}>
      © ClimateConnect {new Date().getFullYear()}
    </Box>
  );
}
