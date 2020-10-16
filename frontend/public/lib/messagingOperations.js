import axios from "axios";
import tokenConfig from "../config/tokenConfig";

export async function getMessageFromServer(message_id, token) {
  const resp = await axios.get(
    process.env.API_URL + "/api/message/" + message_id + "/",
    tokenConfig(token)
  );
  return resp.data;
}

export async function startPrivateChat(profile, token) {
  const resp = await axios.post(
    process.env.API_URL + "/api/start_private_chat/",
    { profile_url_slug: profile.url_slug },
    tokenConfig(token)
  );
  return resp.data;
}
