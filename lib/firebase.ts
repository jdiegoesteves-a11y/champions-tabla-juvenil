import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 1. Importa esto

const firebaseConfig = {
  apiKey: "AIzaSyDx35Zpt7X6NWrGk3_ufHQczbEbVKzK5tM",
  authDomain: "torneo-champions-juvenil.firebaseapp.com",
  projectId: "torneo-champions-juvenil",
  storageBucket: "torneo-champions-juvenil.appspot.com",
  messagingSenderId: "1056480390170",
  appId: "1:1056480390170:web:a7831774167994583cb5a3",
  measurementId: "G-16T3KH6S0L"
};

const app = initializeApp(firebaseConfig);

// 2. Inicializa Firestore y expórtalo
export const db = getFirestore(app);