import {
  loginUser,
  registerUser,
  logoutUser,
  initAuthStateListener,
  getAuthError,
  fetchUserProfile,
  saveUserProfile
} from "./auth.js";

import {
  listenToLeads,
  createLead,
  updateLead,
  deleteLead,
  recordFollowup
} from "./leads.js";

import {
  getUserLocation,
  fetchNearbyPlacesOSM,
  getMapLink,
  findDuplicateLead
} from "./location.js";

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
  isFollowupDue,
  initTheme,
  toggleTheme,
  togglePasswordVisibility,
  setCustomerGreeting,
  openProfileModal,
  closeProfileModal,
  setProfileFormError,
  openSupportModal,
  closeSupportModal,
  openNearbyModal,
  closeNearbyModal,
  setNearbyError,
  setLocationStatus,
  renderNearbyPlaces,
  openDuplicateModal,
  closeDuplicateModal
} from "./ui.js";

let rawLeads = [];
let userCoords = null;
let rawNearbyPlaces = [];
let nearbyDistKm = 3;
let nearbyCat = "ALL";
let pendingPlaceToAdd = null;
let duplicateLeadFound = null;
let unsubscribeLeads = null;
let currentUser = null;
let currentProfile = null;

let filterState = {
  searchQuery: "",
  priority: "ALL",
  status: "ALL",
  followupFilter: "ALL"
};

/* =========================
   NETWORK ONLINE/OFFLINE HANDLER
========================== */
function updateNetworkStatus() {
  if (elements.networkStatusBanner) {
    if (navigator.onLine) {
      elements.networkStatusBanner.classList.add("hidden");
    } else {
      elements.networkStatusBanner.classList.remove("hidden");
    }
  }
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();

/* =========================
   INITIALIZATION
========================== */
initTheme();

/* =========================
   THEME TOGGLE LISTENERS
========================== */
if (elements.loginThemeToggleBtn) {
  elements.loginThemeToggleBtn.addEventListener("click", () => toggleTheme());
}
if (elements.appThemeToggleBtn) {
  elements.appThemeToggleBtn.addEventListener("click", () => toggleTheme());
}

/* =========================
   PASSWORD VISIBILITY TOGGLE
========================== */
if (elements.passwordToggleBtn) {
  elements.passwordToggleBtn.addEventListener("click", () => togglePasswordVisibility());
}

/* =========================
   AUTH LISTENER
========================== */
initAuthStateListener(async user => {
  currentUser = user;
  if (user) {
    showAppScreen();
    // Load User Profile
    try {
      currentProfile = await fetchUserProfile(user.uid);
      if (currentProfile && currentProfile.companyName) {
        setCustomerGreeting(currentProfile.companyName);
      } else {
        setCustomerGreeting("Security Agency");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setCustomerGreeting("Security Agency");
    }

    startFirestoreListener();
  } else {
    currentProfile = null;
    showLoginScreen();
    if (unsubscribeLeads) {
      unsubscribeLeads();
      unsubscribeLeads = null;
    }
  }
});

/* =========================
   USER PROFILE MODAL ACTIONS
========================== */
if (elements.profileBtn) {
  elements.profileBtn.addEventListener("click", () => {
    openProfileModal(currentProfile?.companyName || "");
  });
}

if (elements.cancelProfileButton) {
  elements.cancelProfileButton.addEventListener("click", () => {
    closeProfileModal();
  });
}

if (elements.profileModal) {
  elements.profileModal.addEventListener("click", event => {
    if (event.target === elements.profileModal) {
      closeProfileModal();
    }
  });
}

/* =========================
   NEARBY BUSINESSES DISCOVERY (PHASE 5)
========================== */
if (elements.nearbyBtn) {
  elements.nearbyBtn.addEventListener("click", () => {
    openNearbyModal();
    if (!userCoords) {
      loadNearbyPlaces();
    }
  });
}

if (elements.closeNearbyButton) {
  elements.closeNearbyButton.addEventListener("click", () => {
    closeNearbyModal();
  });
}

if (elements.nearbyModal) {
  elements.nearbyModal.addEventListener("click", event => {
    if (event.target === elements.nearbyModal) {
      closeNearbyModal();
    }
  });
}

if (elements.refreshLocationBtn) {
  elements.refreshLocationBtn.addEventListener("click", () => {
    loadNearbyPlaces();
  });
}

async function loadNearbyPlaces() {
  setNearbyError("");
  setLocationStatus("📍 Requesting GPS position...");

  try {
    userCoords = await getUserLocation();
    setLocationStatus(`📍 Position acquired (${userCoords.lat.toFixed(4)}, ${userCoords.lon.toFixed(4)}). Searching nearby prospects...`);

    const places = await fetchNearbyPlacesOSM(userCoords.lat, userCoords.lon, nearbyDistKm);
    rawNearbyPlaces = places;
    setLocationStatus(`📍 Found ${places.length} establishments within ${nearbyDistKm} km.`);
    applyNearbyFiltersAndRender();
  } catch (err) {
    console.error("Location discovery error:", err);
    setLocationStatus("📍 Geolocation required for nearby discovery.");
    setNearbyError(err.message || "Could not fetch nearby places.");
  }
}

function applyNearbyFiltersAndRender() {
  let filtered = [...rawNearbyPlaces];

  if (nearbyCat !== "ALL") {
    filtered = filtered.filter(p => p.category === nearbyCat);
  }

  renderNearbyPlaces(filtered, {
    onAddAsLead: handleAddNearbyAsLead,
    onOpenMap: handleOpenMap
  });
}

// Distance Pills Listener
if (elements.nearbyDistPills) {
  elements.nearbyDistPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.nearbyDistPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      nearbyDistKm = parseInt(pill.dataset.km, 10) || 3;
      if (userCoords) {
        loadNearbyPlaces();
      }
    });
  });
}

// Category Pills Listener
if (elements.nearbyCatPills) {
  elements.nearbyCatPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.nearbyCatPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      nearbyCat = pill.dataset.cat || "ALL";
      applyNearbyFiltersAndRender();
    });
  });
}

function handleOpenMap(place) {
  const url = getMapLink(place.lat, place.lon, place.name);
  window.open(url, "_blank", "noopener,noreferrer");
}

function handleAddNearbyAsLead(place) {
  const duplicate = findDuplicateLead(place.name, place.location, rawLeads);

  if (duplicate) {
    pendingPlaceToAdd = place;
    duplicateLeadFound = duplicate;
    openDuplicateModal(place, duplicate);
  } else {
    openAddLeadFromPlace(place);
  }
}

function openAddLeadFromPlace(place) {
  closeNearbyModal();

  // Reset form completely first
  openLeadModal(null);

  // Pre-fill ONLY name and location
  if (elements.leadNameInput) elements.leadNameInput.value = place.name || "";
  if (elements.leadLocationInput) elements.leadLocationInput.value = place.location || "";
}

// DUPLICATE MODAL LISTENERS
if (elements.viewExistingLeadBtn) {
  elements.viewExistingLeadBtn.addEventListener("click", () => {
    closeDuplicateModal();
    closeNearbyModal();
    if (duplicateLeadFound) {
      openDetailsModal(duplicateLeadFound);
    }
  });
}

if (elements.proceedAddLeadBtn) {
  elements.proceedAddLeadBtn.addEventListener("click", () => {
    closeDuplicateModal();
    if (pendingPlaceToAdd) {
      openAddLeadFromPlace(pendingPlaceToAdd);
    }
  });
}

if (elements.cancelDuplicateBtn) {
  elements.cancelDuplicateBtn.addEventListener("click", () => {
    closeDuplicateModal();
    pendingPlaceToAdd = null;
    duplicateLeadFound = null;
  });
}

if (elements.duplicateModal) {
  elements.duplicateModal.addEventListener("click", event => {
    if (event.target === elements.duplicateModal) {
      closeDuplicateModal();
    }
  });
}

if (elements.saveProfileButton) {
  elements.saveProfileButton.addEventListener("click", async () => {
    setProfileFormError("");
    if (!currentUser) return;

    const companyName = elements.companyNameInput.value.trim();
    if (!companyName) {
      setProfileFormError("Company / Agency name is required.");
      return;
    }

    elements.saveProfileButton.disabled = true;
    elements.saveProfileButton.textContent = "Saving...";

    try {
      await saveUserProfile(currentUser.uid, { companyName, email: currentUser.email || "" });
      currentProfile = { companyName };
      setCustomerGreeting(companyName);
      setAppMessage("Profile updated successfully.");
      closeProfileModal();
    } catch (error) {
      console.error("Save profile error:", error);
      setProfileFormError(error.message || "Could not save profile.");
    } finally {
      elements.saveProfileButton.disabled = false;
      elements.saveProfileButton.textContent = "Save Profile";
    }
  });
}

/* =========================
   SATISH SUPPORT MODAL ACTIONS
========================== */
if (elements.supportBtn) {
  elements.supportBtn.addEventListener("click", () => {
    openSupportModal();
  });
}

if (elements.closeSupportButton) {
  elements.closeSupportButton.addEventListener("click", () => {
    closeSupportModal();
  });
}

if (elements.supportModal) {
  elements.supportModal.addEventListener("click", event => {
    if (event.target === elements.supportModal) {
      closeSupportModal();
    }
  });
}

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

  // Follow-Up Classification filter
  if (filterState.followupFilter !== "ALL") {
    filtered = filtered.filter(l => {
      const todayStr = new Date().toISOString().split("T")[0];
      if (!l.followupDate || l.status === "WON" || l.status === "CONVERTED" || l.status === "LOST") {
        return false;
      }
      if (filterState.followupFilter === "DUE_TODAY") {
        return l.followupDate === todayStr;
      }
      if (filterState.followupFilter === "OVERDUE") {
        return l.followupDate < todayStr;
      }
      if (filterState.followupFilter === "UPCOMING") {
        return l.followupDate > todayStr;
      }
      return true;
    });
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

// Follow-Up Filter Select Listener
if (elements.followupFilter) {
  elements.followupFilter.addEventListener("change", e => {
    filterState.followupFilter = e.target.value;
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
  const guardsRaw = elements.leadGuardsRequiredInput.value.trim();
  const guardsRequired = guardsRaw ? parseInt(guardsRaw, 10) : null;
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

  if (!guardsRaw || isNaN(guardsRequired) || guardsRequired < 1) {
    setLeadFormError("Guards Required is required and must be at least 1.");
    elements.leadGuardsRequiredInput.focus();
    return;
  }

  if (!shift) {
    setLeadFormError("Shift Requirement is required.");
    elements.leadShiftSelect.focus();
    return;
  }

  if (!requirementType) {
    setLeadFormError("Requirement Type is required.");
    elements.leadRequirementTypeSelect.focus();
    return;
  }

  if (!priority) {
    setLeadFormError("Priority selection is required.");
    elements.leadPrioritySelect.focus();
    return;
  }

  if (!status) {
    setLeadFormError("Status selection is required.");
    elements.leadStatusSelect.focus();
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
  const followupDate = elements.followupDateInput ? elements.followupDateInput.value : "";
  const followupTime = elements.followupTimeInput ? elements.followupTimeInput.value : "";
  const nextDate = elements.followupNextDateInput.value;
  const note = elements.followupNoteInput.value.trim();

  if (!leadId) return;

  if (!note && !nextDate) {
    setFollowupFormError("Please enter a follow-up note or schedule next follow-up date.");
    return;
  }

  elements.saveFollowupButton.disabled = true;
  elements.saveFollowupButton.textContent = "Saving...";

  try {
    await recordFollowup(leadId, { note, nextDate, followupDate, followupTime, status });
    setAppMessage("Follow-up saved successfully.");
    closeFollowupModal();
  } catch (error) {
    console.error("Record followup error:", error);
    setFollowupFormError("Could not log follow-up. Check network.");
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
