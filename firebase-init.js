// firebase-init.js

// Імпортуємо необхідні функції з Firebase SDK по модульній схемі
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";

// Конфігурація твого Firebase проєкту
const firebaseConfig = {
  apiKey: "AIzaSyC7T8xF3C6rZKmF0EhvwEueUPnxXLyrAxg",
  authDomain: "electricity-319d2.firebaseapp.com",
  projectId: "electricity-319d2",
  storageBucket: "electricity-319d2.firebasestorage.app",
  messagingSenderId: "157905516815",
  appId: "1:157905516815:web:cdec97a0d6d664ba5c667a",
  measurementId: "G-H8ZEF80XWY"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Експортуємо об'єкт db, щоб використовувати Firestore у інших скриптах
export { db };
