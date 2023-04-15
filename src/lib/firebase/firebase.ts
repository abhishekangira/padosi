import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "padosi-webapp.firebaseapp.com",
  projectId: "padosi-webapp",
  storageBucket: "padosi-webapp.appspot.com",
  messagingSenderId: "202304249193",
  appId: "1:202304249193:web:de9c05c037760a0f2d31f8",
  measurementId: "G-NRV8YTYXWH",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

if (process.env.NODE_ENV === "development") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { auth, provider, db };
