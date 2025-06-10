import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuZfuqlFhXcn8bb_3YbETGhPiFhA1FfXI",
  authDomain: "luchylnyk-app.firebaseapp.com",
  databaseURL: "https://luchylnyk-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "luchylnyk-app",
  storageBucket: "luchylnyk-app.appspot.com",
  messagingSenderId: "538399551820",
  appId: "1:538399551820:web:76a0da38a6a8df8d301fe9",
  measurementId: "G-T29EQTSP62"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, push };
