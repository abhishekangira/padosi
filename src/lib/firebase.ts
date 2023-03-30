import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlLSF2esUXhpfaYg-JJkxB4L5NG5aglgM",
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
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { auth, provider };
