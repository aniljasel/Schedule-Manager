import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYT0yYA3kGbw5Au1tC8qBXwvlQwAspGIM",
  authDomain: "schedule-manager-b51f5.firebaseapp.com",
  projectId: "schedule-manager-b51f5",
  storageBucket: "schedule-manager-b51f5.appspot.com", // corrected typo
  messagingSenderId: "385591684636",
  appId: "1:385591684636:web:a411aec1f3a6c8084679d9",
  measurementId: "G-4SJ6CN86MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, analytics }; // ✅ Export auth for Login/Register
export default app;
