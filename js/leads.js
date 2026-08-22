import { db } from "../firebase.js";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export function listenToLeads(onNext, onError) {
  const leadsRef = collection(db, "leads");
  const leadsQuery = query(leadsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    leadsQuery,
    snapshot => {
      const leads = [];
      snapshot.forEach(docSnap => {
        leads.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      onNext(leads);
    },
    onError
  );
}

export function createLead(leadData) {
  return addDoc(collection(db, "leads"), {
    ...leadData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    followupHistory: leadData.followupHistory || []
  });
}

export function updateLead(id, leadData) {
  return updateDoc(doc(db, "leads", id), {
    ...leadData,
    updatedAt: serverTimestamp()
  });
}

export function deleteLead(id) {
  return deleteDoc(doc(db, "leads", id));
}

export function recordFollowup(id, { note, nextDate, followupDate, followupTime, status }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const logEntry = {
    note: note || "",
    date: followupDate || todayStr,
    time: followupTime || nowTimeStr,
    nextDate: nextDate || "",
    status: status || "",
    timestamp: new Date().toISOString()
  };

  const updatePayload = {
    updatedAt: serverTimestamp(),
    followupHistory: arrayUnion(logEntry)
  };

  if (status) {
    updatePayload.status = status;
  }

  if (nextDate !== undefined) {
    updatePayload.followupDate = nextDate;
  }

  return updateDoc(doc(db, "leads", id), updatePayload);
}
