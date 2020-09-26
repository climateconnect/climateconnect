import axios from "axios";
import tokenConfig from "../config/tokenConfig";

export async function getMessageFromServer(message_id, token) {
  const resp = await axios.get(
    process.env.API_URL + "/api/message/" + message_id + "/",
    tokenConfig(token)
  );
  return resp.data;
}
