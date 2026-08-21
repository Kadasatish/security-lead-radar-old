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
  deleteLead,
  recordFollowup
} from "./leads.js";

import {
  elements,
  showAppScreen,
  showLoginScreen,
  setLoginMessage,
  setAppMessage,
  setLeadFormError,
  setFollowupFormError,
  openLeadModal,
  closeLeadModal,
  openFollowupModal,
  closeFollowupModal,
  openDetailsModal,
  closeDetailsModal,
  updateDashboardStats,
  renderLeadsList,
  isFollowupDue
} from "./ui.js";

let rawLeads = [];
let unsubscribeLeads = null;

let filterState = {
  searchQuery: "",
  priority: "ALL",
  status: "ALL",
  dueOnly: false
};

/* =========================
   AUTH LISTENER
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
      rawLeads = leads;
      updateDashboardStats(rawLeads);
      applyFiltersAndRender();
    },
    error => {
      console.error("Firestore error:", error);
      setAppMessage("Firestore access error. Check Firebase Rules.");
    }
  );
}

/* =========================
   SEARCH & FILTERS ENGINE
========================== */
function applyFiltersAndRender() {
  let filtered = [...rawLeads];

  // Search filter
  if (filterState.searchQuery) {
    const q = filterState.searchQuery.toLowerCase();
    filtered = filtered.filter(l =>
      (l.name || "").toLowerCase().includes(q) ||
      (l.location || "").toLowerCase().includes(q) ||
      (l.contactPerson || "").toLowerCase().includes(q) ||
      (l.phone || "").includes(q)
    );
  }

  // Priority filter
  if (filterState.priority !== "ALL") {
    filtered = filtered.filter(l => l.priority === filterState.priority);
  }

  // Status filter
  if (filterState.status !== "ALL") {
    filtered = filtered.filter(l => l.status === filterState.status);
  }

  // Due Only filter
  if (filterState.dueOnly) {
    filtered = filtered.filter(isFollowupDue);
  }

  renderLeadsList(filtered, {
    onEdit: handleEditLead,
    onDelete: handleDeleteLead,
    onFollowup: handleOpenFollowup,
    onViewDetails: handleViewDetails
  });
}

// Search Input Listener
if (elements.searchInput) {
  elements.searchInput.addEventListener("input", e => {
    filterState.searchQuery = e.target.value.trim();
    applyFiltersAndRender();
  });
}

// Priority Pills Listener
if (elements.priorityPills) {
  elements.priorityPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.priorityPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      filterState.priority = pill.dataset.priority;
      applyFiltersAndRender();
    });
  });
}

// Status Select Listener
if (elements.statusFilter) {
  elements.statusFilter.addEventListener("change", e => {
    filterState.status = e.target.value;
    applyFiltersAndRender();
  });
}

// Due Only Toggle
if (elements.dueOnlyToggle) {
  elements.dueOnlyToggle.addEventListener("click", () => {
    filterState.dueOnly = !filterState.dueOnly;
    elements.dueOnlyToggle.classList.toggle("active", filterState.dueOnly);
    applyFiltersAndRender();
  });
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
   LEAD MODAL ACTIONS
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
  const confirmed = confirm(`Delete "${lead.name || "this lead"}" permanently?`);
  if (!confirmed) return;

  try {
    await deleteLead(lead.id);
    setAppMessage("Lead deleted successfully.");
  } catch (error) {
    console.error("Delete lead error:", error);
    setAppMessage("Could not delete lead.");
  }
}

// SAVE LEAD WITH VALIDATION
elements.saveLeadButton.addEventListener("click", async () => {
  setLeadFormError("");
  const name = elements.leadNameInput.value.trim();
  const location = elements.leadLocationInput.value.trim();
  const contactPerson = elements.leadContactPersonInput.value.trim();
  const phone = elements.leadPhoneInput.value.trim();
  const guardsRequired = parseInt(elements.leadGuardsRequiredInput.value, 10) || 1;
  const shift = elements.leadShiftSelect.value;
  const requirementType = elements.leadRequirementTypeSelect.value;
  const startDate = elements.leadStartDateInput.value;
  const priority = elements.leadPrioritySelect.value;
  const status = elements.leadStatusSelect.value;
  const followupDate = elements.leadFollowupDateInput.value;
  const notes = elements.leadNotesInput.value.trim();

  if (!name) {
    setLeadFormError("Business / Establishment Name is required.");
    elements.leadNameInput.focus();
    return;
  }

  if (!location) {
    setLeadFormError("Location is required.");
    elements.leadLocationInput.focus();
    return;
  }

  elements.saveLeadButton.disabled = true;
  elements.saveLeadButton.textContent = "Saving...";

  const payload = {
    name,
    location,
    contactPerson,
    phone,
    guardsRequired,
    shift,
    requirementType,
    startDate,
    priority,
    status,
    followupDate,
    notes
  };

  try {
    const editId = elements.leadModal.dataset.editId;

    if (editId) {
      await updateLead(editId, payload);
      setAppMessage("Lead updated successfully.");
    } else {
      await createLead(payload);
      setAppMessage("New lead saved successfully.");
    }

    closeLeadModal();
  } catch (error) {
    console.error("Save lead error:", error);
    setLeadFormError("Could not save lead. Check Firestore permissions.");
  } finally {
    elements.saveLeadButton.disabled = false;
    elements.saveLeadButton.textContent = "Save Lead";
  }
});

/* =========================
   QUICK FOLLOW-UP MODAL ACTIONS
========================== */
function handleOpenFollowup(lead) {
  openFollowupModal(lead);
}

elements.cancelFollowupButton.addEventListener("click", () => {
  closeFollowupModal();
});

elements.followupModal.addEventListener("click", event => {
  if (event.target === elements.followupModal) {
    closeFollowupModal();
  }
});

elements.saveFollowupButton.addEventListener("click", async () => {
  setFollowupFormError("");
  const leadId = elements.followupModal.dataset.leadId;
  const status = elements.followupStatusSelect.value;
  const nextDate = elements.followupNextDateInput.value;
  const note = elements.followupNoteInput.value.trim();

  if (!leadId) return;

  if (!note && !nextDate) {
    setFollowupFormError("Please enter a follow-up note or next due date.");
    return;
  }

  elements.saveFollowupButton.disabled = true;
  elements.saveFollowupButton.textContent = "Saving...";

  try {
    await recordFollowup(leadId, { note, nextDate, status });
    setAppMessage("Follow-up logged successfully.");
    closeFollowupModal();
  } catch (error) {
    console.error("Record followup error:", error);
    setFollowupFormError("Could not log follow-up.");
  } finally {
    elements.saveFollowupButton.disabled = false;
    elements.saveFollowupButton.textContent = "Save Record";
  }
});

/* =========================
   LEAD DETAILS & QUICK STATUS ACTIONS
========================== */
function handleViewDetails(lead) {
  openDetailsModal(lead);
}

if (elements.closeDetailsButton) {
  elements.closeDetailsButton.addEventListener("click", () => {
    closeDetailsModal();
  });
}

if (elements.detailsModal) {
  elements.detailsModal.addEventListener("click", event => {
    if (event.target === elements.detailsModal) {
      closeDetailsModal();
    }
  });
}

if (elements.detailsQuickStatus) {
  elements.detailsQuickStatus.addEventListener("change", async e => {
    const leadId = elements.detailsModal.dataset.leadId;
    if (!leadId) return;

    const newStatus = e.target.value;
    try {
      await updateLead(leadId, { status: newStatus });
      setAppMessage(`Status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Quick status update error:", error);
      setAppMessage("Could not update status.");
    }
  });
}
