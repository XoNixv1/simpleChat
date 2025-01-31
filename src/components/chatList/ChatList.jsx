import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import addUser from "../addUser/AddUser";
import getUsers from "./getUsers";

export default function ChatList({ user, db }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (user) {
      const fethChats = async () => {
        try {
          const chatsRef = collection(db, "chats");
          const chatsQuery = query(
            chatsRef,
            where("users", "array-contains", user.uid)
          );
          const querySnapshot = await getDocs(chatsQuery);

          const userChats = [];
          querySnapshot.forEach((doc) => {
            userChats.push({ id: doc.id, ...doc.data() });
          });
          setChats(userChats);
        } catch (errorMessage) {
          setError(errorMessage);
        }
      };

      fethChats();
    }
  }, [user, db]);

  useEffect(() => {
    if (chats.length > 0) {
      chats.forEach((chat) => {
        getUsers(chat.users, setUsers, users, db, user);
      });
    }
  }, [chats, db, user, users]);

  function handleChatClick(chatId) {
    //open the chat room
  }

  return (
    <div className="chat-list">
      <label htmlFor="email">Add User</label>
      <input
        id="email"
        type="email"
        placeholder="eshkere@gmail.com"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.currentTarget.value);
        }}
      />
      <button
        onClick={() => {
          addUser(user.uid, inputValue, db);
        }}
      >
        Confirm
      </button>
      <ul>
        Chat List
        {chats.map((chat) => {
          const otherUserId = chat.users.find((uid) => uid !== user.uid);
          const otherUserName = users[otherUserId];

          return (
            <li key={chat.id}>
              <p>{otherUserName}</p>
              <p>{chat.lastMessage}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
