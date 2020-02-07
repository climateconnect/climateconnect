import React from "react";
import Layout from "../src/components/layouts/layout";
import Link from "next/link";
import { TextField, Button, Card, Container, LinearProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    maxWidth: 350,
    margin: "0 auto"
  },
  blockElement: {
    display: "block",
    maxWidth: 250,
    height: 56,
    margin: "0 auto",
    marginTop: theme.spacing(2)
  },
  bottomMessages: {
    textAlign: "center",
    display: "block"
  },
  bottomMessageContainer: {
    marginTop: theme.spacing(2)
  },
  percentage: {
    textAlign: "center",
    color: `${theme.palette.primary.main}`,
    fontWeight: "bold"
  },
  progressBar: {
    height: 5,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1)
  },
  centerText: {
    textAlign: "center"
  }
}));

//TODO: check openstreetmaps api for useful commands to check citys
//TODO: build general "form" component, that can be reused

export default function Signup() {
  const classes = useStyles();
  const percentage = 20;

  return (
    <Layout title="Sign Up">
      <Card className={classes.root}>
        <Typography component="h2" variant="subtitle1" className={classes.centerText}>
          Step 2: A little bit about yourself
        </Typography>
        <LinearProgress value={percentage} variant="determinate" className={classes.progressBar} />
        <form action="/addinfo" method="GET">
          <div>
            <TextField
              required
              fullWidth
              autoFocus
              label="First Name"
              type="text"
              variant="outlined"
              className={classes.blockElement}
              onChange={() => console.log("it changed!")}
            />
          </div>
          <TextField
            required
            fullWidth
            label="Last Name"
            type="text"
            variant="outlined"
            className={classes.blockElement}
          />
          <TextField
            required
            fullWidth
            label="Country"
            type="text"
            variant="outlined"
            className={classes.blockElement}
          />
          <TextField
            required
            fullWidth
            label="City"
            type="text"
            variant="outlined"
            className={classes.blockElement}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            color="primary"
            className={classes.blockElement}
          >
            Next Step
          </Button>
        </form>
        <Container className={classes.bottomMessageContainer}>
          <div className={classes.bottomMessages}>Already have an account?</div>
          <Link href="/signin">
            <a className={classes.bottomMessages}>Sign in</a>
          </Link>
        </Container>
      </Card>
    </Layout>
  );
}
