import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Room created sucessfully!");
  };

  const joinRoom = () => {
    if (!roomId || !userName) {
      toast.error("RoomId or userName is required");
      return;
    } else {
      navigate(`/editor/${roomId}`, {
        state: { userName },
      });
    }
  };

  const onEnterEvent = (e) => {
    if (e.code == "Enter") joinRoom();
  };
  return (
    <div className="HomePageWrapper">
      <div className="formWrapper">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3udpGXO8qXgjYXRe_XdPrLtH3KpncdVwCeA&s"
          alt="code-logo"
          className="logo-img"
        />
        <h4 className="roomHeading">Paste Invitation RoomId</h4>
        <div className="input-box">
          <input
            type="text"
            className="input"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyDown={onEnterEvent}
          />
          <input
            type="text"
            className="input"
            placeholder="USERNAME"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            onKeyDown={onEnterEvent}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join Now
          </button>
          <span className="createInfo" onClick={createNewRoom}>
            If you don't have Id then create :<a href="">New room</a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built By Avinash <a href=" ">codersAvinash</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
