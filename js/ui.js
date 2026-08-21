export const elements = {
  loginScreen: document.getElementById("loginScreen"),
  appScreen: document.getElementById("appScreen"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),
  loginButton: document.getElementById("loginButton"),
  registerButton: document.getElementById("registerButton"),
  logoutButton: document.getElementById("logoutButton"),
  loginMessage: document.getElementById("loginMessage"),
  appMessage: document.getElementById("appMessage"),

  // Modals
  leadModal: document.getElementById("leadModal"),
  followupModal: document.getElementById("followupModal"),
  addLeadButton: document.getElementById("addLeadButton"),
  cancelLeadButton: document.getElementById("cancelLeadButton"),
  saveLeadButton: document.getElementById("saveLeadButton"),
  cancelFollowupButton: document.getElementById("cancelFollowupButton"),
  saveFollowupButton: document.getElementById("saveFollowupButton"),

  // Container
  leadsContainer: document.getElementById("leadsContainer"),

  // Stats Counters
  activeCount: document.getElementById("activeCount"),
  hotCount: document.getElementById("hotCount"),
  warmCount: document.getElementById("warmCount"),
  watchCount: document.getElementById("watchCount"),
  dueCount: document.getElementById("dueCount"),
  guardsCount: document.getElementById("guardsCount"),
  totalCount: document.getElementById("totalCount"),

  // Search & Filters
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  priorityPills: document.querySelectorAll(".filter-pill[data-priority]"),
  dueOnlyToggle: document.getElementById("dueOnlyToggle"),

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
  followupNextDateInput: document.getElementById("followupNextDate"),
  followupNoteInput: document.getElementById("followupNote"),
  followupHistoryList: document.getElementById("followupHistoryList")
};

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

export function openLeadModal(lead = null) {
  if (lead) {
    elements.leadNameInput.value = lead.name || "";
    elements.leadLocationInput.value = lead.location || "";
    elements.leadContactPersonInput.value = lead.contactPerson || "";
    elements.leadPhoneInput.value = lead.phone || "";
    elements.leadGuardsRequiredInput.value = lead.guardsRequired || 1;
    elements.leadShiftSelect.value = lead.shift || "Both";
    elements.leadRequirementTypeSelect.value = lead.requirementType || "Static Guarding";
    elements.leadStartDateInput.value = lead.startDate || "";
    elements.leadPrioritySelect.value = lead.priority || "WATCH";
    elements.leadStatusSelect.value = lead.status || "NEW";
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
  elements.leadNameInput.value = "";
  elements.leadLocationInput.value = "";
  elements.leadContactPersonInput.value = "";
  elements.leadPhoneInput.value = "";
  elements.leadGuardsRequiredInput.value = 1;
  elements.leadShiftSelect.value = "Both";
  elements.leadRequirementTypeSelect.value = "Static Guarding";
  elements.leadStartDateInput.value = "";
  elements.leadPrioritySelect.value = "HOT";
  elements.leadStatusSelect.value = "NEW";
  elements.leadFollowupDateInput.value = "";
  elements.leadNotesInput.value = "";
  delete elements.leadModal.dataset.editId;
}

export function openFollowupModal(lead) {
  elements.followupModal.dataset.leadId = lead.id;
  elements.followupLeadTitle.textContent = `📞 Follow-Up: ${lead.name || "Lead"}`;
  elements.followupStatusSelect.value = lead.status || "FOLLOW_UP";
  elements.followupNextDateInput.value = lead.followupDate || "";
  elements.followupNoteInput.value = "";

  renderFollowupHistory(lead.followupHistory || []);
  elements.followupModal.classList.remove("hidden");
}

export function closeFollowupModal() {
  delete elements.followupModal.dataset.leadId;
  elements.followupModal.classList.add("hidden");
}

function renderFollowupHistory(history) {
  elements.followupHistoryList.innerHTML = "";
  if (!history || history.length === 0) {
    elements.followupHistoryList.innerHTML =
      '<div class="timeline-note" style="color:var(--text-muted);">No follow-up records yet.</div>';
    return;
  }

  const sorted = [...history].reverse();
  sorted.forEach(item => {
    const div = document.createElement("div");
    div.className = "timeline-item";

    const dateStr = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "Earlier";

    div.innerHTML = `
      <div class="timeline-date">${dateStr} — ${item.status || "Updated"}</div>
      <div class="timeline-note">${escapeHtml(item.note || "No note recorded")}</div>
      ${item.nextDate ? `<div style="color:var(--accent-blue);font-size:11px;margin-top:2px;">Next Due: ${item.nextDate}</div>` : ""}
    `;
    elements.followupHistoryList.appendChild(div);
  });
}

export function isFollowupDue(lead) {
  if (!lead.followupDate || lead.status === "CONVERTED" || lead.status === "LOST") {
    return false;
  }
  const todayStr = new Date().toISOString().split("T")[0];
  return lead.followupDate <= todayStr;
}

export function updateDashboardStats(allLeads) {
  const activeLeads = allLeads.filter(
    l => l.status !== "CONVERTED" && l.status !== "LOST"
  );

  const hotCount = activeLeads.filter(l => l.priority === "HOT").length;
  const warmCount = activeLeads.filter(l => l.priority === "WARM").length;
  const watchCount = activeLeads.filter(l => l.priority === "WATCH").length;
  const dueCount = activeLeads.filter(isFollowupDue).length;

  const totalGuards = activeLeads.reduce(
    (sum, l) => sum + (parseInt(l.guardsRequired, 10) || 0),
    0
  );

  if (elements.activeCount) elements.activeCount.textContent = activeLeads.length;
  if (elements.hotCount) elements.hotCount.textContent = hotCount;
  if (elements.warmCount) elements.warmCount.textContent = warmCount;
  if (elements.watchCount) elements.watchCount.textContent = watchCount;
  if (elements.dueCount) elements.dueCount.textContent = dueCount;
  if (elements.guardsCount) elements.guardsCount.textContent = totalGuards;
}

export function renderLeadsList(leads, { onEdit, onDelete, onFollowup }) {
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

    // Notes
    let notes = null;
    if (lead.notes) {
      notes = document.createElement("div");
      notes.className = "lead-notes";
      notes.textContent = lead.notes;
    }

    // Follow-up Banner
    let followupBanner = null;
    if (lead.followupDate) {
      followupBanner = document.createElement("div");
      const due = isFollowupDue(lead);
      followupBanner.className = `lead-followup-banner ${due ? "followup-due" : "followup-upcoming"}`;
      followupBanner.innerHTML = `
        <span>${due ? "⚠️ Follow-up Overdue / Due" : "📅 Next Follow-up"}</span>
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
