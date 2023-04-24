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
  return addDoc(collection(db, "posts"), { ...post, createdAt: serverTimestamp() });
};

export const fetchPosts = async ({ pageParam }: { pageParam: DocumentData }) => {
  console.log("fetching posts", pageParam);

  let q;
  if (pageParam) {
    q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(pageParam), limit(6));
  } else {
    q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(6));
  }
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { posts, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] };
};
