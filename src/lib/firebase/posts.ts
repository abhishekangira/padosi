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

export const addPost = (post: {}) => {
  console.log("test");

  return addDoc(collection(db, "posts"), { ...post, createdAt: serverTimestamp() });
};

export const fetchPosts = async ({ pageParam }) => {
  let q;
  if (pageParam) {
    q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(pageParam), limit(10));
  } else {
    q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
  }
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { posts, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};
