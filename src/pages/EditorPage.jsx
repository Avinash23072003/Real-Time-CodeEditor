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
  const [clients, setClients] = useState([]); // Initialize with an empty array

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        // Define event handlers outside useEffect to avoid multiple registrations
        const handleError = (e) => {
          console.error("Socket error", e);
          toast.error("Socket connection failed, try again later");
          reactNavigate("/");
        };

        const handleJoined = ({ clients, userName, socketId }) => {
          console.log("ACTION.JOINED event received");
          console.log("Socket ID:", socketId); // Log the socket ID
          console.log("Clients Data:", clients); // Log the clients data

          if (userName !== location.state?.userName) {
            toast.success(`${userName} has joined`);
          }
          setClients(clients); // Update clients state with the new list
        };

        // Attach event listeners
        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);
        socketRef.current.on(ACTION.JOINED, handleJoined);

        // Emit join event
        socketRef.current.emit(ACTION.JOIN, {
          roomId,
          userName: location.state?.userName,
        });
      } catch (error) {
        console.error("Initialization error", error);
        toast.error("Failed to initialize socket connection");
        reactNavigate("/");
      }
    };

    init();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTION.JOINED); // Remove event listener
        socketRef.current.disconnect();
      }
    };
  }, [location.state?.userName, roomId, reactNavigate]);

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
