export default function WebSocketService(apiURLStr) {
  if (process.env.SOCKET_URL) {
    return new WebSocket(process.env.SOCKET_URL + apiURLStr);
  }
}
