import { apiRequest } from "./apiOperations";

export async function getMessageFromServer(message_id, token, locale) {
  const resp = await apiRequest({
    method: "get",
    url: "/api/message/" + message_id + "/",
    token: token,
    locale: locale,
  });
  return resp.data;
}

export async function startPrivateChat(profile, token, locale) {
  const resp = await apiRequest({
    method: "post",
    url: "/api/start_private_chat/",
    payload: { profile_url_slug: profile.url_slug },
    token: token,
    locale: locale,
  });
  return resp.data;
}
