import {
  addDoc,
  collection,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import "./chatRoom.scss";

export default function ChatRoom({ db, chat, user }) {
  const messagesRef = collection(db, `chats/${chat.id}/messages`);
  const messagesQuery = query(messagesRef, orderBy("createdAt"), limit(100));
  const [snapshot, loading, error] = useCollection(messagesQuery); // TODO ERROR AND LOADING DISPLAY

  const messages = snapshot?.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const [messageTxt, setMessageTxt] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = user;

    await addDoc(messagesRef, {
      text: messageTxt,
      uid,
      createdAt: Timestamp.now(),
      photoURL: photoURL || "",
    });
    setMessageTxt("");
  };

  function formatDate(date) {
    const formatedDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date);
    return formatedDate;
  }

  return (
    <div className="chat-room">
      {messages &&
        messages.map((message) => (
          <div
            key={message.id}
            className={
              message.uid === user.uid
                ? "chat-room__sent-message"
                : "chat-room__recived-message"
            }
          >
            <img
              className="chat-room__img"
              src={message.photoURL}
              alt="user-icon"
            />
            <div className="chat-room__message-text">
              <p className="chat-room__message-text--data">
                {formatDate(message.createdAt)}
              </p>
              <p className="chat-room__message-text--value">{message.text}</p>
            </div>
          </div>
        ))}
      <form
        action="submit"
        onSubmit={(e) => {
          handleSendMessage(e);
        }}
      >
        <input
          type="text"
          value={messageTxt}
          onChange={(e) => {
            setMessageTxt(e.target.value);
          }}
        />
        <button disabled={!chat} type="submit">
          send
        </button>
      </form>
    </div>
  );
}
