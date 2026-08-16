import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhRCNe7OeCueCrcr2qJinf0ZNksPrts0E",
  authDomain: "studio-4588813814-af30e.firebaseapp.com",
  databaseURL: "https://studio-4588813814-af30e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-4588813814-af30e",
  storageBucket: "studio-4588813814-af30e.firebasestorage.app",
  messagingSenderId: "225518398042",
  appId: "1:225518398042:web:bc711b656e9a3a7e190663"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
