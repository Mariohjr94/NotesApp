import io from "socket.io-client";

const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
  upgrade: false,
});

export default socket;
