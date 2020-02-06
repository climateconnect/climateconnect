import React from "react";
import Layout from "../src/components/layouts/layout";
import Link from "next/link";
import { TextField, Button, Card, Container } from "@material-ui/core";
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
  }
}));

export default function Signin() {
  const classes = useStyles();

  return (
    <Layout title="Sign In">
      <Card className={classes.root}>
        <form action="/create" method="GET">
          <div>
            <TextField
              required
              fullWidth
              autoFocus
              label="Email"
              variant="outlined"
              className={classes.blockElement}
            />
          </div>
          <TextField
            required
            fullWidth
            label="Password"
            variant="outlined"
            className={classes.blockElement}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            color="primary"
            size="large"
            className={classes.blockElement}
          >
            Sign In
          </Button>
        </form>
        <Container className={classes.bottomMessageContainer}>
          <div className={classes.bottomMessages}>New to Climate Connect?</div>
          <Link href="/signup">
            <a className={classes.bottomMessages}>Create an Account</a>
          </Link>
        </Container>
      </Card>
    </Layout>
  );
}
