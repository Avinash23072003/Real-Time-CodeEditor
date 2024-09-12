import { io } from "socket.io-client";

let socket;

export const initSocket = async () => {
  // Avoid creating multiple socket connections
  if (!socket) {
    const serverURL = import.meta.env.VITE_API_URL; // Use the correct method to access env variables based on your setup
    console.log("Server URL:", serverURL);

    const options = {
      transports: ["websocket"],
      reconnectionAttempts: Infinity,
      timeout: 10000,
    };

    socket = io(serverURL, options);

    socket.on("connect", () => {
      console.log("Connected to server with socket ID:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server with socket ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });
  }

  return socket;
};
