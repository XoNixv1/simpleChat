import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import "./App.scss";
import ChatList from "../chatList/ChatList";

const firebaseConfig = {
  apiKey: "AIzaSyCNxjwpYXxKvZN1XSVuZh-WQuI-zWb0qP4",
  authDomain: "chat-4a2d3.firebaseapp.com",
  projectId: "chat-4a2d3",
  storageBucket: "chat-4a2d3.firebasestorage.app",
  messagingSenderId: "405813892868",
  appId: "1:405813892868:web:5824594475424fab32e251",
  measurementId: "G-5F7VN7FEYX",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function SignIn({ setUser }) {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const { uid, displayName, email, photoURL } = user;

      setUser({
        uid,
        displayName,
        email,
        photoURL,
      });

      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          uid,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut({ setUser }) {
  return (
    auth.currentUser && (
      <button
        onClick={() => {
          signOut(auth);
          setUser(null);
        }}
      >
        Sign Out
      </button>
    )
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header>
        <h1>Chat</h1>
      </header>
      <section>
        {user ? (
          <>
            <ChatList user={user} db={db} />
            <SignOut setUser={setUser} />
          </>
        ) : (
          <SignIn setUser={setUser} />
        )}
      </section>
    </div>
  );
}

export default App;

// function ChatMessage({ message }) {
//   const { text, uid, photoURL } = message;
//   const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

//   return (
//     <div className={`message ${messageClass}`}>
//       <img src={photoURL} alt="User" />
//       <p>{text}</p>
//     </div>
//   );
// }

// function MainRoom() {
//   const dummy = useRef();
//   const messagesRef = collection(db, "messages");
//   const messagesQuery = query(messagesRef, orderBy("createdAt"), limit(25));
//   // const [messages] = useCollectionData(messagesQuery, { idField: "id" });
//   const [messages, setMessages] = useState([]);

//   const [formValue, setFormValue] = useState("");
//   const user = auth.currentUser;

//   useEffect(() => {
//     const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
//       const messagesData = snapshot.docs.map((doc) => ({
//         ...doc.data(),
//         id: doc.id,
//       }));
//       setMessages(messagesData);
//     });

//     return () => unsubscribe();
//   }, []);

//   const sendMessage = async (e) => {
//     e.preventDefault();

//     const { uid, photoURL } = user;

//     await addDoc(messagesRef, {
//       text: formValue,
//       createdAt: Timestamp.now(),
//       uid,
//       photoURL: photoURL || "",
//     });

//     setFormValue("");

//     dummy.current.scrollIntoView({ behaviour: "smooth" });
//   };

//   return (
//     <>
//       <main>
//         {messages &&
//           messages.map((message) => (
//             <ChatMessage key={message.id} message={message} />
//           ))}
//         <div ref={dummy}></div>
//       </main>
//       <form onSubmit={sendMessage}>
//         <input
//           value={formValue}
//           onChange={(e) => setFormValue(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button type="submit">Send</button>
//       </form>
//     </>
//   );
// }
