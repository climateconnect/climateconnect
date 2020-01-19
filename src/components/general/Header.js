import React from "react";
import Link from "next/link";
import { Box, Container, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.grey[300]}`
    },
    container: {
      padding: theme.spacing(1),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      height: 60
    },
    buttonMarginRight: {
      marginRight: theme.spacing(1)
    }
  };
});

export default function Header() {
  const classes = useStyles();

  return (
    <Box component="header" className={classes.root}>
      <Container className={classes.container}>
        <Link href="/">
          <a>
            <img
              src="https://climateconnect.earth/images/logo.png"
              alt="Climate Connect"
              className={classes.logo}
            />
          </a>
        </Link>

        <Box>
          <Link href="/about">
            <Button color="primary" className={classes.buttonMarginRight}>
              About
            </Button>
          </Link>
          <Link href="/create">
            <Button color="primary" className={classes.buttonMarginRight}>
              Create a project
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="outlined" color="primary">
              Sign in
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
