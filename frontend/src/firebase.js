import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxxky_L41Pcm1vEoQ9FHp78fgleMoE_1U",
  authDomain: "neuroscreen-22a41.firebaseapp.com",
  projectId: "neuroscreen-22a41",
  storageBucket: "neuroscreen-22a41.firebasestorage.app",
  messagingSenderId: "16507810549",
  appId: "1:16507810549:web:4b8885b4bc391faedd8bbc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
