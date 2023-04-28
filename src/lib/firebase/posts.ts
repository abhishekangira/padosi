import {
  DocumentData,
  addDoc,
  collection,
  doc,
  endAt,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
} from "firebase/firestore";
import { db } from "./firebase";
import { distanceBetween, geohashQueryBounds } from "geofire-common";

export const addPost = (post: {}) => {
  return addDoc(collection(db, "posts"), { ...post, createdAt: serverTimestamp() });
};

export const fetchPosts = async ({
  pageParam,
  center,
}: {
  pageParam: DocumentData;
  center: [number, number];
}) => {
  const distance = 25; // km
  const bounds = geohashQueryBounds(center, distance * 1000);

  const promises = [];
  let q;
  for (const b of bounds) {
    if (pageParam) {
      q = query(
        collection(db, "posts"),
        orderBy("geoHash"),
        orderBy("createdAt", "desc"),
        startAt(b[0]),
        endAt(b[1]),
        startAfter(pageParam),
        limit(10)
      );
    } else {
      q = query(
        collection(db, "posts"),
        orderBy("geoHash"),
        orderBy("createdAt", "desc"),
        startAt(b[0]),
        endAt(b[1]),
        limit(10)
      );
    }
    promises.push(getDocs(q));
  }
  const snapshots = await Promise.all(promises);
  const matchingDocs = [];
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const lat = doc.data().location.lat;
      const lng = doc.data().location.lng;
      const distanceInKm = distanceBetween([lat, lng], center);
      if (distanceInKm <= distance) {
        matchingDocs.push(doc);
      } else {
        console.count("out of range");
      }
    }
  }
  const posts = matchingDocs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { posts, lastDoc: matchingDocs[matchingDocs.length - 1] };
};

export const fetchPost = async (id: string) => {
  const docRef = doc(db, "posts", id);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() };
};
