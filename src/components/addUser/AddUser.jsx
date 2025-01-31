import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

//
export default async function addUser(currentUid, otherUserEmail, db) {
  //
  const usersRef = collection(db, "users");
  const otherUsersQuery = query(usersRef, where("email", "==", otherUserEmail));
  const otherUserSnapshot = await getDocs(otherUsersQuery);

  if (otherUserSnapshot.empty) {
    console.log("no such user");
    return;
  }

  const otherUserDoc = otherUserSnapshot.docs[0];
  const otherUser = otherUserDoc.data();
  const otherUid = otherUser.uid;

  const chatsRef = collection(db, "chats");
  const chatsQuery = query(
    chatsRef,
    where("users", "array-contains", currentUid)
  );
  const chatSnapshot = await getDocs(chatsQuery);

  const existingChat = chatSnapshot.docs.find((doc) => {
    return doc.data().users.includes(otherUid);
  });

  if (existingChat) {
    console.log("already have such chat");
    return;
  }

  const chatRef = await addDoc(collection(db, "chats"), {
    users: [currentUid, otherUid],
    lastMessage: "",
    createdAt: new Date(),
  });

  const currentUserRef = doc(db, "users", currentUid);

  await updateDoc(currentUserRef, {
    chats: arrayUnion(chatRef.id),
  });

  const otherUserRef = doc(db, "users", otherUid);

  await updateDoc(otherUserRef, {
    chats: arrayUnion(chatRef.id),
  });
}
