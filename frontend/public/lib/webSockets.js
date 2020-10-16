export default function WebSocketService(apiURLStr) {
  return new WebSocket(process.env.SOCKET_URL + apiURLStr);
}
