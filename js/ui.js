export const elements = {
  loginScreen: document.getElementById("loginScreen"),
  appScreen: document.getElementById("appScreen"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  passwordToggleBtn: document.getElementById("passwordToggleBtn"),
  loginButton: document.getElementById("loginButton"),
  registerButton: document.getElementById("registerButton"),
  logoutButton: document.getElementById("logoutButton"),
  loginMessage: document.getElementById("loginMessage"),
  appMessage: document.getElementById("appMessage"),

  // Theme Toggles
  loginThemeToggleBtn: document.getElementById("loginThemeToggleBtn"),
  appThemeToggleBtn: document.getElementById("appThemeToggleBtn"),

  // Header Elements
  userGreetingBanner: document.getElementById("userGreetingBanner"),
  profileBtn: document.getElementById("profileBtn"),
  supportBtn: document.getElementById("supportBtn"),

  // Modals & Error elements
  leadModal: document.getElementById("leadModal"),
  followupModal: document.getElementById("followupModal"),
  detailsModal: document.getElementById("detailsModal"),
  profileModal: document.getElementById("profileModal"),
  supportModal: document.getElementById("supportModal"),

  leadFormError: document.getElementById("leadFormError"),
  followupFormError: document.getElementById("followupFormError"),
  profileFormError: document.getElementById("profileFormError"),

  addLeadButton: document.getElementById("addLeadButton"),
  cancelLeadButton: document.getElementById("cancelLeadButton"),
  saveLeadButton: document.getElementById("saveLeadButton"),
  cancelFollowupButton: document.getElementById("cancelFollowupButton"),
  saveFollowupButton: document.getElementById("saveFollowupButton"),
  closeDetailsButton: document.getElementById("closeDetailsButton"),

  cancelProfileButton: document.getElementById("cancelProfileButton"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  closeSupportButton: document.getElementById("closeSupportButton"),

  // Container & Banners
  networkStatusBanner: document.getElementById("networkStatusBanner"),
  leadsContainer: document.getElementById("leadsContainer"),

  // Stats Counters
  totalLeadsCount: document.getElementById("totalLeadsCount"),
  activeCount: document.getElementById("activeCount"),
  dueCount: document.getElementById("dueCount"),
  overdueCount: document.getElementById("overdueCount"),
  wonCount: document.getElementById("wonCount"),
  lostCount: document.getElementById("lostCount"),
  guardsCount: document.getElementById("guardsCount"),
  totalCount: document.getElementById("totalCount"),

  // Search & Filters
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  followupFilter: document.getElementById("followupFilter"),
  priorityPills: document.querySelectorAll(".filter-pill[data-priority]"),

  // Lead Form Inputs
  leadNameInput: document.getElementById("leadName"),
  leadLocationInput: document.getElementById("leadLocation"),
  leadContactPersonInput: document.getElementById("leadContactPerson"),
  leadPhoneInput: document.getElementById("leadPhone"),
  leadGuardsRequiredInput: document.getElementById("leadGuardsRequired"),
  leadShiftSelect: document.getElementById("leadShift"),
  leadRequirementTypeSelect: document.getElementById("leadRequirementType"),
  leadStartDateInput: document.getElementById("leadStartDate"),
  leadPrioritySelect: document.getElementById("leadPriority"),
  leadStatusSelect: document.getElementById("leadStatus"),
  leadFollowupDateInput: document.getElementById("leadFollowupDate"),
  leadNotesInput: document.getElementById("leadNotes"),

  // Follow-up Form Inputs
  followupLeadTitle: document.getElementById("followupLeadTitle"),
  followupStatusSelect: document.getElementById("followupStatus"),
  followupDateInput: document.getElementById("followupDate"),
  followupTimeInput: document.getElementById("followupTime"),
  followupNextDateInput: document.getElementById("followupNextDate"),
  followupNoteInput: document.getElementById("followupNote"),
  followupHistoryList: document.getElementById("followupHistoryList"),

  // Details Modal Fields
  detailsCallBtn: document.getElementById("detailsCallBtn"),
  detailsWhatsappBtn: document.getElementById("detailsWhatsappBtn"),
  detailsQuickStatus: document.getElementById("detailsQuickStatus"),
  detailName: document.getElementById("detailName"),
  detailLocation: document.getElementById("detailLocation"),
  detailContactPerson: document.getElementById("detailContactPerson"),
  detailPhone: document.getElementById("detailPhone"),
  detailGuards: document.getElementById("detailGuards"),
  detailShift: document.getElementById("detailShift"),
  detailReqType: document.getElementById("detailReqType"),
  detailStartDate: document.getElementById("detailStartDate"),
  detailFollowupDate: document.getElementById("detailFollowupDate"),
  detailPriority: document.getElementById("detailPriority"),
  detailNotes: document.getElementById("detailNotes"),
  detailHistoryList: document.getElementById("detailHistoryList"),

  // Profile Form Input
  companyNameInput: document.getElementById("companyNameInput"),

  // Nearby Discovery Elements (Phase 5)
  nearbyBtn: document.getElementById("nearbyBtn"),
  nearbyModal: document.getElementById("nearbyModal"),
  closeNearbyButton: document.getElementById("closeNearbyButton"),
  refreshLocationBtn: document.getElementById("refreshLocationBtn"),
  locationStatusText: document.getElementById("locationStatusText"),
  nearbyError: document.getElementById("nearbyError"),
  nearbyResultsContainer: document.getElementById("nearbyResultsContainer"),
  nearbyDistPills: document.querySelectorAll(".nearby-dist-pill"),
  nearbyCatPills: document.querySelectorAll(".nearby-cat-pill"),

  // Duplicate Warning Elements
  duplicateModal: document.getElementById("duplicateModal"),
  duplicateModalText: document.getElementById("duplicateModalText"),
  viewExistingLeadBtn: document.getElementById("viewExistingLeadBtn"),
  proceedAddLeadBtn: document.getElementById("proceedAddLeadBtn"),
  cancelDuplicateBtn: document.getElementById("cancelDuplicateBtn")
};

/* =========================
   NEARBY BUSINESS DISCOVERY UI
========================== */
export function openNearbyModal() {
  setNearbyError("");
  if (elements.nearbyModal) elements.nearbyModal.classList.remove("hidden");
}

export function closeNearbyModal() {
  setNearbyError("");
  if (elements.nearbyModal) elements.nearbyModal.classList.add("hidden");
}

export function setNearbyError(msg) {
  if (elements.nearbyError) elements.nearbyError.textContent = msg;
}

export function setLocationStatus(msg) {
  if (elements.locationStatusText) elements.locationStatusText.textContent = msg;
}

export function openDuplicateModal(place, existingLead) {
  if (elements.duplicateModalText) {
    elements.duplicateModalText.innerHTML = `
      <strong>"${escapeHtml(place.name)}"</strong> looks like a potential duplicate of an existing lead:<br><br>
      📌 <strong>${escapeHtml(existingLead.name || "Existing Lead")}</strong> (${escapeHtml(existingLead.location || "Kakinada")})<br>
      Status: ${escapeHtml(existingLead.status || "NEW")}
    `;
  }
  if (elements.duplicateModal) elements.duplicateModal.classList.remove("hidden");
}

export function closeDuplicateModal() {
  if (elements.duplicateModal) elements.duplicateModal.classList.add("hidden");
}

export function renderNearbyPlaces(places, { onAddAsLead, onOpenMap }) {
  elements.nearbyResultsContainer.innerHTML = "";

  if (!places || places.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-card";
    empty.innerHTML = `
      🔍 No matching establishments found within selected distance.<br><br>
      Try expanding the distance radius (e.g. 5 km or 10 km) or selecting "All" categories.
    `;
    elements.nearbyResultsContainer.appendChild(empty);
    return;
  }

  places.forEach(place => {
    const card = document.createElement("div");
    card.className = "lead-card nearby-card";

    const top = document.createElement("div");
    top.className = "lead-top";

    const name = document.createElement("div");
    name.className = "lead-name";
    name.textContent = place.name;

    const badges = document.createElement("div");
    badges.className = "badges";

    const catBadge = document.createElement("span");
    catBadge.className = "badge badge-NEW";
    catBadge.textContent = place.category;

    const distBadge = document.createElement("span");
    distBadge.className = "badge badge-WATCH";
    distBadge.textContent = `${place.distanceKm.toFixed(2)} km`;

    badges.appendChild(catBadge);
    badges.appendChild(distBadge);

    top.appendChild(name);
    top.appendChild(badges);

    const loc = document.createElement("div");
    loc.className = "lead-contact";
    loc.style.marginTop = "6px";
    loc.textContent = `📍 ${place.location}`;

    const commRow = document.createElement("div");
    commRow.className = "quick-comm-row";

    const mapBtn = document.createElement("button");
    mapBtn.className = "btn-comm btn-details";
    mapBtn.innerHTML = "🗺️ Map";
    mapBtn.addEventListener("click", () => onOpenMap(place));

    const addLeadBtn = document.createElement("button");
    addLeadBtn.className = "btn-comm btn-call";
    addLeadBtn.style.background = "var(--text-primary)";
    addLeadBtn.style.color = "var(--bg-primary)";
    addLeadBtn.style.border = "none";
    addLeadBtn.innerHTML = "＋ Add as Lead";
    addLeadBtn.addEventListener("click", () => onAddAsLead(place));

    commRow.appendChild(mapBtn);
    commRow.appendChild(addLeadBtn);

    card.appendChild(top);
    card.appendChild(loc);
    card.appendChild(commRow);

    elements.nearbyResultsContainer.appendChild(card);
  });
}

/* =========================
   THEME MANAGER
========================== */
export function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = theme === "dark" ? "🌙 Dark" : "☀️ Light";
  if (elements.loginThemeToggleBtn) elements.loginThemeToggleBtn.textContent = icon;
  if (elements.appThemeToggleBtn) elements.appThemeToggleBtn.textContent = icon;
}

/* =========================
   PASSWORD SHOW/HIDE
========================== */
export function togglePasswordVisibility() {
  if (!elements.passwordInput) return;
  const isPassword = elements.passwordInput.type === "password";
  elements.passwordInput.type = isPassword ? "text" : "password";
  if (elements.passwordToggleBtn) {
    elements.passwordToggleBtn.textContent = isPassword ? "🙈" : "👁️";
  }
}

/* =========================
   USER GREETING & PROFILE MODAL
========================== */
export function setCustomerGreeting(companyName) {
  if (elements.userGreetingBanner) {
    elements.userGreetingBanner.textContent = `Welcome — ${companyName || "Security Agency"}`;
  }
}

export function openProfileModal(companyName = "") {
  if (elements.profileFormError) elements.profileFormError.textContent = "";
  if (elements.companyNameInput) elements.companyNameInput.value = companyName;
  if (elements.profileModal) elements.profileModal.classList.remove("hidden");
}

export function closeProfileModal() {
  if (elements.profileFormError) elements.profileFormError.textContent = "";
  if (elements.profileModal) elements.profileModal.classList.add("hidden");
}

export function setProfileFormError(msg) {
  if (elements.profileFormError) elements.profileFormError.textContent = msg;
}

/* =========================
   SATISH SUPPORT MODAL
========================== */
export function openSupportModal() {
  if (elements.supportModal) elements.supportModal.classList.remove("hidden");
}

export function closeSupportModal() {
  if (elements.supportModal) elements.supportModal.classList.add("hidden");
}

/* =========================
   SCREEN & MESSAGES
========================== */
export function showAppScreen() {
  elements.loginScreen.classList.add("hidden");
  elements.appScreen.classList.remove("hidden");
}

export function showLoginScreen() {
  elements.appScreen.classList.add("hidden");
  elements.loginScreen.classList.remove("hidden");
}

export function setLoginMessage(message) {
  elements.loginMessage.textContent = message;
}

export function setAppMessage(message) {
  elements.appMessage.textContent = message;
  if (message) {
    setTimeout(() => {
      if (elements.appMessage.textContent === message) {
        elements.appMessage.textContent = "";
      }
    }, 4000);
  }
}

export function setLeadFormError(msg) {
  if (elements.leadFormError) elements.leadFormError.textContent = msg;
}

export function setFollowupFormError(msg) {
  if (elements.followupFormError) elements.followupFormError.textContent = msg;
}

/* =========================
   LEAD MODAL
========================== */
export function openLeadModal(lead = null) {
  setLeadFormError("");
  if (lead && typeof lead === "object" && lead.id && typeof lead.id === "string") {
    elements.leadNameInput.value = lead.name || "";
    elements.leadLocationInput.value = lead.location || "";
    elements.leadContactPersonInput.value = lead.contactPerson || "";
    elements.leadPhoneInput.value = lead.phone || "";
    elements.leadGuardsRequiredInput.value = lead.guardsRequired !== undefined && lead.guardsRequired !== null ? lead.guardsRequired : "";
    elements.leadShiftSelect.value = lead.shift || "";
    elements.leadRequirementTypeSelect.value = lead.requirementType || "";
    elements.leadStartDateInput.value = lead.startDate || "";
    elements.leadPrioritySelect.value = lead.priority || "";
    elements.leadStatusSelect.value = lead.status || "";
    elements.leadFollowupDateInput.value = lead.followupDate || "";
    elements.leadNotesInput.value = lead.notes || "";
    elements.leadModal.dataset.editId = lead.id;
  } else {
    resetLeadModalForm();
  }
  elements.leadModal.classList.remove("hidden");
}

export function closeLeadModal() {
  resetLeadModalForm();
  elements.leadModal.classList.add("hidden");
}

export function resetLeadModalForm() {
  setLeadFormError("");
  if (elements.leadNameInput) elements.leadNameInput.value = "";
  if (elements.leadLocationInput) elements.leadLocationInput.value = "";
  if (elements.leadContactPersonInput) elements.leadContactPersonInput.value = "";
  if (elements.leadPhoneInput) elements.leadPhoneInput.value = "";
  if (elements.leadGuardsRequiredInput) elements.leadGuardsRequiredInput.value = "";
  if (elements.leadShiftSelect) elements.leadShiftSelect.value = "";
  if (elements.leadRequirementTypeSelect) elements.leadRequirementTypeSelect.value = "";
  if (elements.leadStartDateInput) elements.leadStartDateInput.value = "";
  if (elements.leadPrioritySelect) elements.leadPrioritySelect.value = "";
  if (elements.leadStatusSelect) elements.leadStatusSelect.value = "";
  if (elements.leadFollowupDateInput) elements.leadFollowupDateInput.value = "";
  if (elements.leadNotesInput) elements.leadNotesInput.value = "";
  if (elements.leadModal && elements.leadModal.dataset) {
    delete elements.leadModal.dataset.editId;
  }
}

/* =========================
   FOLLOW-UP MODAL
========================== */
export function openFollowupModal(lead) {
  setFollowupFormError("");
  elements.followupModal.dataset.leadId = lead.id;
  elements.followupLeadTitle.textContent = `📞 Follow-Up: ${lead.name || "Lead"}`;
  elements.followupStatusSelect.value = lead.status || "FOLLOW_UP";

  const todayStr = new Date().toISOString().split("T")[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  if (elements.followupDateInput) elements.followupDateInput.value = todayStr;
  if (elements.followupTimeInput) elements.followupTimeInput.value = nowTimeStr;
  if (elements.followupNextDateInput) elements.followupNextDateInput.value = lead.followupDate || "";
  if (elements.followupNoteInput) elements.followupNoteInput.value = "";

  renderFollowupHistory(lead.followupHistory || [], elements.followupHistoryList);
  elements.followupModal.classList.remove("hidden");
}

export function closeFollowupModal() {
  setFollowupFormError("");
  delete elements.followupModal.dataset.leadId;
  elements.followupModal.classList.add("hidden");
}

/* =========================
   DETAILS MODAL
========================== */
export function openDetailsModal(lead) {
  elements.detailsModal.dataset.leadId = lead.id;
  elements.detailName.textContent = lead.name || "Unnamed Firm";
  elements.detailLocation.textContent = lead.location || "Kakinada";
  elements.detailContactPerson.textContent = lead.contactPerson || "Not specified";
  elements.detailPhone.textContent = lead.phone || "7386885653";
  elements.detailGuards.textContent = `${lead.guardsRequired || 1} Guard(s)`;
  elements.detailShift.textContent = lead.shift || "Both";
  elements.detailReqType.textContent = lead.requirementType || "Static Guarding";
  elements.detailStartDate.textContent = lead.startDate || "Flexible";
  elements.detailFollowupDate.textContent = lead.followupDate || "Not scheduled";
  elements.detailPriority.textContent = lead.priority || "WATCH";
  elements.detailNotes.textContent = lead.notes || "No notes added.";

  elements.detailsQuickStatus.value = lead.status || "NEW";

  const targetPhone = lead.phone || "7386885653";
  elements.detailsCallBtn.href = `tel:${targetPhone}`;
  elements.detailsCallBtn.textContent = `📞 Call (${targetPhone})`;

  const waMsg = encodeURIComponent(`Hello, following up regarding security requirement for ${lead.name || "your firm"}.`);
  elements.detailsWhatsappBtn.href = `https://wa.me/917386885653?text=${waMsg}`;

  renderFollowupHistory(lead.followupHistory || [], elements.detailHistoryList);
  elements.detailsModal.classList.remove("hidden");
}

export function closeDetailsModal() {
  delete elements.detailsModal.dataset.leadId;
  elements.detailsModal.classList.add("hidden");
}

function renderFollowupHistory(history, container) {
  if (!container) return;
  container.innerHTML = "";

  if (!history || history.length === 0) {
    container.innerHTML =
      '<div class="timeline-note" style="color:var(--text-muted);">No follow-up records yet.</div>';
    return;
  }

  const sorted = [...history].reverse();
  sorted.forEach(item => {
    const div = document.createElement("div");
    div.className = "timeline-item";

    let dateDisplay = item.date || "";
    if (item.time) {
      dateDisplay += ` at ${item.time}`;
    }
    if (!dateDisplay && item.timestamp) {
      dateDisplay = new Date(item.timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }

    div.innerHTML = `
      <div class="timeline-date">${escapeHtml(dateDisplay)} — Status: ${escapeHtml(item.status || "FOLLOW_UP")}</div>
      <div class="timeline-note">${escapeHtml(item.note || "No note recorded")}</div>
      ${item.nextDate ? `<div style="color:var(--accent-blue);font-size:11px;margin-top:2px;">📅 Next Follow-up: ${escapeHtml(item.nextDate)}</div>` : ""}
    `;
    container.appendChild(div);
  });
}

export function getFollowupClassification(lead) {
  if (!lead.followupDate || lead.status === "WON" || lead.status === "CONVERTED" || lead.status === "LOST") {
    return { status: "NONE", label: "" };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const dueTime = new Date(lead.followupDate).getTime();
  const todayTime = new Date(todayStr).getTime();
  const diffDays = Math.floor((todayTime - dueTime) / (1000 * 3600 * 24));

  if (lead.followupDate === todayStr) {
    return { status: "DUE_TODAY", label: "📅 Follow-up: Today" };
  } else if (lead.followupDate > todayStr) {
    const d = new Date(lead.followupDate);
    const dateFormatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return { status: "UPCOMING", label: `📅 Follow-up: ${dateFormatted}` };
  } else {
    return { status: "OVERDUE", label: `⚠️ Overdue: ${diffDays} day${diffDays > 1 ? "s" : ""} ago` };
  }
}

export function isFollowupDue(lead) {
  const c = getFollowupClassification(lead);
  return c.status === "DUE_TODAY";
}

export function isFollowupOverdue(lead) {
  const c = getFollowupClassification(lead);
  return c.status === "OVERDUE";
}

export function updateDashboardStats(allLeads) {
  const totalLeads = allLeads.length;
  const activeLeads = allLeads.filter(
    l => l.status !== "WON" && l.status !== "CONVERTED" && l.status !== "LOST"
  );

  const dueCount = activeLeads.filter(isFollowupDue).length;
  const overdueCount = activeLeads.filter(isFollowupOverdue).length;
  const wonCount = allLeads.filter(l => l.status === "WON" || l.status === "CONVERTED").length;
  const lostCount = allLeads.filter(l => l.status === "LOST").length;

  const totalGuards = activeLeads.reduce(
    (sum, l) => sum + (parseInt(l.guardsRequired, 10) || 0),
    0
  );

  if (elements.totalLeadsCount) elements.totalLeadsCount.textContent = totalLeads;
  if (elements.activeCount) elements.activeCount.textContent = activeLeads.length;
  if (elements.dueCount) elements.dueCount.textContent = dueCount;
  if (elements.overdueCount) elements.overdueCount.textContent = overdueCount;
  if (elements.wonCount) elements.wonCount.textContent = wonCount;
  if (elements.lostCount) elements.lostCount.textContent = lostCount;
  if (elements.guardsCount) elements.guardsCount.textContent = totalGuards;
}

export function renderLeadsList(leads, { onEdit, onDelete, onFollowup, onViewDetails }) {
  elements.leadsContainer.innerHTML = "";

  elements.totalCount.textContent =
    leads.length + (leads.length === 1 ? " lead" : " leads");

  if (leads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-card";
    empty.innerHTML = `
      🛡️ No matching security leads found.<br><br>
      Add a new lead or adjust your filter parameters.
    `;
    elements.leadsContainer.appendChild(empty);
    return;
  }

  leads.forEach(lead => {
    const card = document.createElement("div");
    card.className = "lead-card";

    const top = document.createElement("div");
    top.className = "lead-top";

    const name = document.createElement("div");
    name.className = "lead-name";
    name.textContent = lead.name || "Unnamed Business";

    const badges = document.createElement("div");
    badges.className = "badges";

    const prioBadge = document.createElement("span");
    prioBadge.className = `badge badge-${lead.priority || "WATCH"}`;
    prioBadge.textContent =
      (lead.priority === "HOT" ? "🔥 " : lead.priority === "WARM" ? "🟡 " : "⚪ ") +
      (lead.priority || "WATCH");

    const statusBadge = document.createElement("span");
    statusBadge.className = `badge badge-${lead.status || "NEW"}`;
    statusBadge.textContent = (lead.status || "NEW").replace("_", " ");

    badges.appendChild(prioBadge);
    badges.appendChild(statusBadge);

    top.appendChild(name);
    top.appendChild(badges);

    // Chips row
    const chips = document.createElement("div");
    chips.className = "lead-chips";

    const locChip = document.createElement("span");
    locChip.className = "chip";
    locChip.textContent = "📍 " + (lead.location || "Kakinada");

    const guardsChip = document.createElement("span");
    guardsChip.className = "chip";
    guardsChip.textContent = `🛡️ ${lead.guardsRequired || 1} Guard${(lead.guardsRequired || 1) > 1 ? "s" : ""}`;

    const shiftChip = document.createElement("span");
    shiftChip.className = "chip";
    shiftChip.textContent = `🕒 ${lead.shift || "Both"} Shift`;

    const reqChip = document.createElement("span");
    reqChip.className = "chip";
    reqChip.textContent = `📋 ${lead.requirementType || "Static Guarding"}`;

    chips.appendChild(locChip);
    chips.appendChild(guardsChip);
    chips.appendChild(shiftChip);
    chips.appendChild(reqChip);

    // Contact row
    const contact = document.createElement("div");
    contact.className = "lead-contact";
    if (lead.contactPerson) {
      contact.innerHTML += `👤 ${escapeHtml(lead.contactPerson)} `;
    }
    if (lead.phone) {
      contact.innerHTML += `📞 <a class="phone-link" href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>`;
    }

    // Quick Communication Row (Call, WhatsApp, Details)
    const commRow = document.createElement("div");
    commRow.className = "quick-comm-row";

    const phoneNum = lead.phone || "7386885653";
    const callBtn = document.createElement("a");
    callBtn.className = "btn-comm btn-call";
    callBtn.href = `tel:${phoneNum}`;
    callBtn.textContent = `📞 Call`;

    const waMsg = encodeURIComponent(`Hello, regarding security requirement for ${lead.name || "your business"}.`);
    const waBtn = document.createElement("a");
    waBtn.className = "btn-comm btn-whatsapp";
    waBtn.href = `https://wa.me/917386885653?text=${waMsg}`;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.textContent = `💬 WhatsApp`;

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "btn-comm btn-details";
    detailsBtn.textContent = `👁️ Details`;
    detailsBtn.addEventListener("click", () => onViewDetails(lead));

    commRow.appendChild(callBtn);
    commRow.appendChild(waBtn);
    commRow.appendChild(detailsBtn);

    // Notes
    let notes = null;
    if (lead.notes) {
      notes = document.createElement("div");
      notes.className = "lead-notes";
      notes.textContent = lead.notes;
    }

    // Follow-up Banner
    let followupBanner = null;
    const classification = getFollowupClassification(lead);
    if (classification.status !== "NONE") {
      followupBanner = document.createElement("div");
      const isDue = classification.status === "DUE_TODAY";
      const isOver = classification.status === "OVERDUE";
      followupBanner.className = `lead-followup-banner ${isOver || isDue ? "followup-due" : "followup-upcoming"}`;
      followupBanner.innerHTML = `
        <span>${classification.label}</span>
        <span>${lead.followupDate}</span>
      `;
    }

    // Actions row
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-action";
    editBtn.innerHTML = "✏️ Edit";
    editBtn.addEventListener("click", () => onEdit(lead));

    const followupBtn = document.createElement("button");
    followupBtn.className = "btn-action btn-action-followup";
    followupBtn.innerHTML = "📞 Log Follow-Up";
    followupBtn.addEventListener("click", () => onFollowup(lead));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-action btn-action-delete";
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.addEventListener("click", () => onDelete(lead));

    actions.appendChild(editBtn);
    actions.appendChild(followupBtn);
    actions.appendChild(deleteBtn);

    // Assemble Card
    card.appendChild(top);
    card.appendChild(chips);
    if (contact.innerHTML) card.appendChild(contact);
    card.appendChild(commRow);
    if (notes) card.appendChild(notes);
    if (followupBanner) card.appendChild(followupBanner);
    card.appendChild(actions);

    elements.leadsContainer.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
