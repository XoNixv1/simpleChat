import { doc, getDoc } from "firebase/firestore";

export default async function getUsers(chatUsers, setUsers, users, db, user) {
  const otherUserId = chatUsers.find((uid) => uid !== user.uid);
  if (otherUserId && !users[otherUserId]) {
    try {
      const userRef = doc(db, "users", otherUserId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUsers((prevUsers) => ({
          ...prevUsers,
          [otherUserId]: userDoc.data().displayName,
        }));
      }
    } catch {
      console.log("error fetching user data");
    }
  }
}
