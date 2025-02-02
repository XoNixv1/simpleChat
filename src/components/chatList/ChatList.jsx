import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import addUser from "../addUser/AddUser";
import getUsers from "../getUsers/getUsers";
import ChatRoom from "../chatRoom/ChatRoom";

export default function ChatList({ user, db }) {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [openedChat, setOpenedChat] = useState();
  const [error, setError] = useState(""); //TODO ERROR DISPLAY

  const [addedUserEmail, setAddedUserEmail] = useState("");

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

  return (
    <div className="chat-list">
      <label htmlFor="email">Add User</label>
      <input
        id="email"
        type="email"
        placeholder="eshkere@gmail.com"
        value={addedUserEmail}
        onChange={(e) => {
          setAddedUserEmail(e.currentTarget.value);
        }}
      />
      <button
        onClick={() => {
          addUser(user.uid, addUserEmail, db);
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
            <li
              key={chat.id}
              onClick={() => {
                setOpenedChat({
                  id: chat.id,
                  otherUser: users[otherUserId],
                });
              }}
            >
              <p>{otherUserName}</p>
              <p>{chat.lastMessage}</p>
            </li>
          );
        })}
      </ul>
      {openedChat && <ChatRoom db={db} chat={openedChat} user={user} />}
    </div>
  );
}
