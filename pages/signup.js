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

export default function Signup() {
  const classes = useStyles();
  const percentage = 0;

  return (
    <Layout title="Sign Up">
      <Card className={classes.root}>
        <Typography component="h2" variant="subtitle1" className={classes.centerText}>
          Step 1: Basic Information
        </Typography>
        <LinearProgress value={percentage} variant="determinate" className={classes.progressBar} />
        <form action="/addinfo" method="GET">
          <div>
            <TextField
              required
              fullWidth
              autoFocus
              label="Email"
              type="email"
              variant="outlined"
              className={classes.blockElement}
              onChange={() => console.log("it changed!")}
            />
          </div>
          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            className={classes.blockElement}
          />
          <TextField
            required
            fullWidth
            label="Repeat Password"
            type="password"
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
