import { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import { Actions } from "../Actions";
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

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.on("connect_error", (err) => handleError(err));
        socketRef.current.on("connect_failed", (err) => handleError(err));

        function handleError(e) {
          console.error("Socket error", e);
          toast.error("Socket connection failed, try again later");
          reactNavigate("/");
        }

        socketRef.current.emit(Actions.JOIN, {
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
        socketRef.current.disconnect();
      }
    };
  }, [location.state?.userName, roomId, reactNavigate]);

  const [clients, setClients] = useState([
    { socketId: "1", userName: "Anash C" },
    { socketId: "2", userName: "Rahul C" },
    { socketId: "3", userName: "lalal H" },
    { socketId: "4", userName: "Amey S" },
    { socketId: "5", userName: "Maya C" },
    { socketId: "6", userName: "Ashoka C" },
  ]);

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
          <h3>Connected</h3>
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
