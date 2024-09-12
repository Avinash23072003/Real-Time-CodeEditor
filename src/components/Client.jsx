import Avatar from "react-avatar";
const Client = ({ userName }) => {
  return (
    <div className="clients">
      <Avatar name={userName} size={50} round="14px"></Avatar>
      <span className="username">{userName}</span>
    </div>
  );
};
export default Client;
