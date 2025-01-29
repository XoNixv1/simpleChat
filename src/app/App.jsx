import React, { useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import "./App.css";

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
const firestore = getFirestore(app);

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error", error);
    }
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(messagesQuery, { idField: "id" });

  const [formValue, setFormValue] = useState("");
  const user = auth.currentUser;

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!user) return;

    const { uid, photoURL } = user;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: Timestamp.now(),
      uid,
      photoURL: photoURL || "",
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser?.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="User" />
      <p>{text}</p>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Welcome to the Chat</h1>
      </header>
      <section>
        {user ? (
          <>
            <ChatRoom />
            <SignOut />
          </>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}

export default App;
