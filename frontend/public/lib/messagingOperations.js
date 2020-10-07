import axios from "axios";
import tokenConfig from "../config/tokenConfig";
import getEnvVar from "./getEnvVar";

export async function getMessageFromServer(message_id, token) {
  const resp = await axios.get(
    getEnvVar("API_URL") + "/api/message/" + message_id + "/",
    tokenConfig(token)
  );
  return resp.data;
}

export async function startPrivateChat(profile, token) {
  const resp = await axios.post(
    getEnvVar("API_URL") + "/api/start_private_chat/",
    { profile_url_slug: profile.url_slug },
    tokenConfig(token)
  );
  return resp.data;
}
