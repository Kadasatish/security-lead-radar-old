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
  if (!uid) return null;
  let profile = null;

  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profile = snap.data();
    }
  } catch (err) {
    console.warn("Firestore fetch profile warning (using local fallback):", err.message);
  }

  if (!profile) {
    try {
      const local = localStorage.getItem(`agency_profile_${uid}`);
      if (local) {
        profile = JSON.parse(local);
      }
    } catch (e) {
      console.warn("localStorage fetch error:", e);
    }
  }

  return profile;
}

export async function saveUserProfile(uid, { companyName, email }) {
  if (!uid) throw new Error("User not authenticated.");

  const data = {
    companyName: companyName || "Security Agency",
    email: email || "",
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(`agency_profile_${uid}`, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage save error:", e);
  }

  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore save profile warning (saved to user local storage):", err.message);
  }

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
