import { auth, db } from "../firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export function initAuthStateListener(onChange) {
  return onAuthStateChanged(auth, onChange);
}

export async function fetchUserProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error("Fetch user profile error:", err);
  }
  return null;
}

export async function saveUserProfile(uid, { companyName, email }) {
  const userRef = doc(db, "users", uid);
  const data = {
    companyName: companyName || "Security Agency",
    email: email || "",
    updatedAt: serverTimestamp()
  };
  await setDoc(userRef, data, { merge: true });
  return data;
}

export function getAuthError(error) {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Invalid email address.";

    case "auth/weak-password":
      return "Password is too weak.";

    case "auth/network-request-failed":
      return "Network error. Check internet.";

    default:
      return error.message || "Authentication error.";
  }
}
