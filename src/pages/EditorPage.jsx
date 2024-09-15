import { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import { ACTION } from "../Constants/ACTION";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigate = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const initializedRef = useRef(false); // Ref to track initialization

  useEffect(() => {
    console.log("useEffect called");
    if (initializedRef.current) return; // Prevent duplicate initialization
    initializedRef.current = true;

    const init = async () => {
      try {
        socketRef.current = await initSocket();

        // Emit join event
        socketRef.current.emit(ACTION.JOIN, {
          roomId,
          userName: location.state?.userName,
        });

        // Event handler for when a user joins
        const handleJoined = ({ clients, userName, socketId }) => {
          console.log("ACTION.JOINED event received", clients);

          // Prevent toast for the current user
          if (socketRef.current.id !== socketId) {
            toast.success(`${userName} has joined`);
          }

          // Update the clients state
          setClients(clients);
        };

        // Event handler for when a user disconnects
        const handleUserDisconnected = ({ socketId, userName }) => {
          toast.success(`${userName} left the room`);
          setClients((prev) =>
            prev.filter((client) => client.socketId !== socketId)
          );
        };

        // Register event listeners
        socketRef.current.on(ACTION.JOINED, handleJoined);
        socketRef.current.on(ACTION.USER_DISCONNECTED, handleUserDisconnected);

        // Error handling
        const handleError = (e) => {
          console.error("Socket error", e);
          toast.error("Socket connection failed, try again later");
          reactNavigate("/");
        };

        // socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);
      } catch (error) {
        console.error("Initialization error", error);
        toast.error("Failed to initialize socket connection");
        reactNavigate("/");
      }
    };

    init();

    // Cleanup: Remove socket event listeners on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTION.USER_DISCONNECTED);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, location.state?.userName, reactNavigate]); // Add dependencies for roomId, userName, and navigate

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrapper">
      <div className="leftWrapper">
        <div className="leftInnerWrapper">
          <div className="logo">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3udpGXO8qXgjYXRe_XdPrLtH3KpncdVwCeA&s"
              alt="code-logo"
              className="logo-img"
            />
          </div>
          <h3 className="connectedName">Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} userName={client.userName} />
            ))}
          </div>
        </div>
        <button className="btn copy-btn">Copy Id</button>
        <button className="btn leave-btn">Leave Id</button>
      </div>
      <div className="rightWrapper">
        <Editor />
      </div>
    </div>
  );
};

export default EditorPage;
