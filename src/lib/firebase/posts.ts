import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase";

export const addPost = async (post: {}) => {
  const newPostRef = doc(collection(db, "posts"));
  await setDoc(newPostRef, { ...post, id: newPostRef.id, timestamp: serverTimestamp() });
};

let lastVisibleDoc: DocumentData, dataCount: number;
export const getPosts = async () => {
  const data: DocumentData[] = [];
  const q = lastVisibleDoc
    ? query(
        collection(db, "posts"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisibleDoc),
        limit(4)
      )
    : query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(4));
  const documentSnapshots = await getDocs(q);
  if (!dataCount) dataCount = (await getCountFromServer(collection(db, "posts"))).data().count;
  console.log("🚀 ~ file: posts.ts:33 ~ getPosts ~ documentSnapshots:", documentSnapshots);
  lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
  documentSnapshots.forEach((doc) => {
    data.push(doc.data());
  });
  return { data, dataCount };
};
