import getEnvVar from "./getEnvVar";

export default function WebSocketService(apiURLStr) {
  return new WebSocket(getEnvVar("SOCKET_URL") + apiURLStr);
}
