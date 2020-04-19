import React from "react";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../src/themes/theme";
import axios from "axios";
import Cookies from "universal-cookie";
import UserContext from "../src/components/context/UserContext";

// This is lifted from a Material UI template at https://github.com/mui-org/material-ui/blob/master/examples/nextjs/pages/_app.js.

export default class MyApp extends App {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
    this.state = { user: null };

    this.signOut = async () => {
      try {
        console.log("signing out!");
        const token = this.cookies.get("token");
        await axios.post(process.env.API_URL + "/logout/", null, tokenConfig(token));
        this.cookies.remove("token");
        this.setState({
          user: null
        });
      } catch (err) {
        console.log(err);
        this.cookies.remove("token");
        this.setState({
          user: null
        });
        return null;
      }
    };

    this.signIn = async (token, expiry, redirect) => {
      //TODO: set httpOnly=true to make cookie only accessible by server
      //TODO: set secure=true to make cookie only accessible through HTTPS
      this.cookies.set("token", token, { path: "/", expires: new Date(expiry), sameSite: true });
      const user = await getLoggedInUser(this.cookies);
      if (redirect) Router.push(redirect);
      this.setState({
        user: user
      });
    };
  }

  async componentDidMount() {
    const user = await getLoggedInUser(this.cookies);
    if (user) {
      this.setState({ user });
    }
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <React.Fragment>
        <Head>
          <title>Climate Connect</title>
          <link rel="icon" href="/icons/favicon.ico" />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <UserContext.Provider
            value={{ user: this.state.user, signOut: this.signOut, signIn: this.signIn }}
          >
            <Component {...pageProps} />
          </UserContext.Provider>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

async function getLoggedInUser(cookies) {
  const token = cookies.get("token");
  if (token) {
    try {
      const resp = await axios.get(process.env.API_URL + "/api/my_profile/", tokenConfig(token));
      return resp.data;
    } catch (err) {
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  } else {
    return null;
  }
}

const tokenConfig = token => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  // If token, add to headers config
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }

  return config;
};
