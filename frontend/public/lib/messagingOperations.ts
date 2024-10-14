import { apiRequest } from "./apiOperations";

export async function getMessageFromServer(message_id, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/message/" + message_id + "/",
      token: token,
      locale: locale,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export async function startPrivateChat(profile, token, locale) {
  try {
    const resp = await apiRequest({
      method: "post",
      url: "/api/start_private_chat/",
      payload: { profile_url_slug: profile.url_slug },
      token: token,
      locale: locale,
    });
    return resp.data;
  } catch (e) {
    throw e;
  }
}

export async function joinIdeaGroupChat({ idea, token, locale }) {
  try {
    const resp = await apiRequest({
      method: "post",
      url: `/api/ideas/${idea.url_slug}/join_chat/`,
      payload: {},
      token: token,
      locale: locale,
    });
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export async function sendChatMessageThroughPostRequest(message, chat_uuid, token, locale) {
  try {
    const resp = await apiRequest({
      method: "post",
      url: "/api/chat/" + chat_uuid + "/send_message/",
      payload: { message_content: message },
      token: token,
      locale: locale,
    });
    console.log(resp.data);
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in sendChatMessageThroughPostRequest: " + err.response.data.detail);

    if (err.response && err.response.data.detail === "Invalid token.")
      console.log("invalid token! token:" + token);
    console.log(err);
    return null;
  }
}
