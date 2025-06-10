import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCuZfuqlFhXcn8bb_3YbETGhPiHhA1FfXI",
  authDomain: "luchylnyk-app.firebaseapp.com",
  databaseURL: "https://luchylnyk-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "luchylnyk-app",
  storageBucket: "luchylnyk-app.firebasedatabase.app",
  messagingSenderId: "538399551820",
  appId: "1:538399551820:web:76a0da38a6a8df8d301fe9",
  measurementId: "G-T29EQTSP62"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const CONFIG = {
  tariffs: { day: 3.5, night: 2.0 },
  penalty: { day: 100, night: 80 },
  initialMeters: { "ABC123": { day: 1000, night: 800 } }
};
