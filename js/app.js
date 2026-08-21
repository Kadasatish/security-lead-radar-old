import {
  loginUser,
  registerUser,
  logoutUser,
  initAuthStateListener,
  getAuthError
} from "./auth.js";

import {
  listenToLeads,
  createLead,
  updateLead,
  deleteLead
} from "./leads.js";

import {
  elements,
  showAppScreen,
  showLoginScreen,
  setLoginMessage,
  setAppMessage,
  openLeadModal,
  closeLeadModal,
  updateDashboard
} from "./ui.js";

let unsubscribeLeads = null;

/* =========================
   AUTH STATE LISTENER
========================== */
initAuthStateListener(user => {
  if (user) {
    showAppScreen();
    startFirestoreListener();
  } else {
    showLoginScreen();
    if (unsubscribeLeads) {
      unsubscribeLeads();
      unsubscribeLeads = null;
    }
  }
});

/* =========================
   FIRESTORE LISTENER
========================== */
function startFirestoreListener() {
  if (unsubscribeLeads) {
    unsubscribeLeads();
  }

  unsubscribeLeads = listenToLeads(
    leads => {
      updateDashboard(leads, handleEditLead, handleDeleteLead);
    },
    error => {
      console.error("Firestore error:", error);
      setAppMessage("Firestore access error. Check Firebase Rules.");
    }
  );
}

/* =========================
   AUTH EVENT LISTENERS
========================== */
elements.loginButton.addEventListener("click", async () => {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!email || !password) {
    setLoginMessage("Enter email and password.");
    return;
  }

  setLoginMessage("Logging in...");

  try {
    await loginUser(email, password);
    setLoginMessage("");
  } catch (error) {
    console.error(error);
    setLoginMessage(getAuthError(error));
  }
});

elements.registerButton.addEventListener("click", async () => {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!email || !password) {
    setLoginMessage("Enter email and password first.");
    return;
  }

  if (password.length < 6) {
    setLoginMessage("Password must be at least 6 characters.");
    return;
  }

  setLoginMessage("Creating account...");

  try {
    await registerUser(email, password);
    setLoginMessage("Account created successfully.");
  } catch (error) {
    console.error(error);
    setLoginMessage(getAuthError(error));
  }
});

elements.logoutButton.addEventListener("click", async () => {
  await logoutUser();
});

/* =========================
   MODAL & LEAD ACTIONS
========================== */
elements.addLeadButton.addEventListener("click", () => {
  openLeadModal();
});

elements.cancelLeadButton.addEventListener("click", () => {
  closeLeadModal();
});

elements.leadModal.addEventListener("click", event => {
  if (event.target === elements.leadModal) {
    closeLeadModal();
  }
});

function handleEditLead(lead) {
  openLeadModal(lead);
}

async function handleDeleteLead(lead) {
  const confirmed = confirm(`Delete "${lead.name || "this lead"}"?`);
  if (!confirmed) return;

  try {
    await deleteLead(lead.id);
    setAppMessage("Lead deleted successfully.");
  } catch (error) {
    console.error("Delete lead error:", error);
    setAppMessage("Could not delete lead.");
  }
}

/* =========================
   SAVE LEAD EVENT LISTENER
========================== */
elements.saveLeadButton.addEventListener("click", async () => {
  const leadName = elements.leadNameInput.value.trim();
  const leadLocation = elements.leadLocationInput.value.trim();
  const leadPriority = elements.leadPrioritySelect.value;
  const leadStatus = elements.leadStatusSelect.value;
  const leadNotes = elements.leadNotesInput.value.trim();

  if (!leadName) {
    setAppMessage("Enter business/company name.");
    return;
  }

  elements.saveLeadButton.disabled = true;
  elements.saveLeadButton.textContent = "Saving...";

  try {
    const editId = elements.leadModal.dataset.editId;

    if (editId) {
      await updateLead(editId, {
        name: leadName,
        location: leadLocation || "Kakinada",
        priority: leadPriority,
        status: leadStatus,
        notes: leadNotes
      });
      setAppMessage("Lead updated successfully.");
    } else {
      await createLead({
        name: leadName,
        location: leadLocation || "Kakinada",
        priority: leadPriority,
        status: leadStatus,
        notes: leadNotes
      });
      setAppMessage("Lead saved successfully.");
    }

    closeLeadModal();
  } catch (error) {
    console.error("Save lead error:", error);
    setAppMessage("Could not save lead. Check Firestore Rules.");
  } finally {
    elements.saveLeadButton.disabled = false;
    elements.saveLeadButton.textContent = "Save Lead";
  }
});
