import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const addPost = (post: {}) => addDoc(collection(db, "posts"), post);
