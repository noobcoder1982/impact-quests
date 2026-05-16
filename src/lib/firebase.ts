import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3xXpbqGHZRaxjnKv2QVPSGfoJCT-tgSY",
  authDomain: "apps-59e7f.firebaseapp.com",
  projectId: "apps-59e7f",
  storageBucket: "apps-59e7f.firebasestorage.app",
  messagingSenderId: "445521992701",
  appId: "1:445521992701:web:2f3c857ec9df949dae5794",
  measurementId: "G-980YPKZ11Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail };
