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
  const codeRef = useRef(""); // Initialize with an empty string to avoid null references
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

          // Sync code with the newly joined user
          if (codeRef.current) {
            socketRef.current.emit(ACTION.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
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

        // Error handling listeners
        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);
      } catch (error) {
        console.error("Initialization error", error);
        toast.error("Failed to initialize socket connection");
        reactNavigate("/");
      }
    };

    init();

    // Cleanup: Remove all socket event listeners on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTION.JOINED);
        socketRef.current.off(ACTION.USER_DISCONNECTED);
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.disconnect();
      }
    };
  }, [roomId, location.state?.userName, reactNavigate]); // Add dependencies for roomId, userName, and navigate

  if (!location.state) {
    return <Navigate to="/" />;
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied successfully");
    } catch (err) {
      toast.error("Failed to copy Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigate("/");
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
        <button className="btn copy-btn" onClick={copyRoomId}>
          Copy ID
        </button>
        <button className="btn leave-btn" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="rightWrapper">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code; // Update the codeRef with the latest code
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
