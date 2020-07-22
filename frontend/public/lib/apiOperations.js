import axios from "axios";
import tokenConfig from "../config/tokenConfig";
import Router from "next/router";

export async function apiRequest(method, url, token, payload, throwError) {
  if (payload) {
    axios[method](process.env.API_URL + url, payload, tokenConfig(token))
      .then(function(response) {
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        if (throwError) throw error;
      });
  } else {
    axios[method](process.env.API_URL + url, tokenConfig(token))
      .then(function(response) {
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        if (throwError) throw error;
      });
  }
}

export async function redirect(url, messages) {
  Router.push({
    pathname: url,
    query: messages
  });
}
