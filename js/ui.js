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
  leadModal: document.getElementById("leadModal"),
  addLeadButton: document.getElementById("addLeadButton"),
  cancelLeadButton: document.getElementById("cancelLeadButton"),
  saveLeadButton: document.getElementById("saveLeadButton"),
  leadsContainer: document.getElementById("leadsContainer"),
  hotCount: document.getElementById("hotCount"),
  warmCount: document.getElementById("warmCount"),
  watchCount: document.getElementById("watchCount"),
  followupCount: document.getElementById("followupCount"),
  totalCount: document.getElementById("totalCount"),
  leadNameInput: document.getElementById("leadName"),
  leadLocationInput: document.getElementById("leadLocation"),
  leadPrioritySelect: document.getElementById("leadPriority"),
  leadStatusSelect: document.getElementById("leadStatus"),
  leadNotesInput: document.getElementById("leadNotes")
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
}

export function openLeadModal(lead = null) {
  if (lead) {
    elements.leadNameInput.value = lead.name || "";
    elements.leadLocationInput.value = lead.location || "";
    elements.leadPrioritySelect.value = lead.priority || "WATCH";
    elements.leadStatusSelect.value = lead.status || "NEW";
    elements.leadNotesInput.value = lead.notes || "";
    elements.leadModal.dataset.editId = lead.id;
  } else {
    resetModalForm();
  }
  elements.leadModal.classList.remove("hidden");
}

export function closeLeadModal() {
  resetModalForm();
  elements.leadModal.classList.add("hidden");
}

export function resetModalForm() {
  elements.leadNameInput.value = "";
  elements.leadLocationInput.value = "";
  elements.leadPrioritySelect.value = "HOT";
  elements.leadStatusSelect.value = "NEW";
  elements.leadNotesInput.value = "";
  delete elements.leadModal.dataset.editId;
}

export function updateDashboard(leads, onEdit, onDelete) {
  const hot = leads.filter(lead => lead.priority === "HOT").length;
  const warm = leads.filter(lead => lead.priority === "WARM").length;
  const watch = leads.filter(lead => lead.priority === "WATCH").length;
  const followups = leads.filter(lead => lead.status === "FOLLOW_UP").length;

  elements.hotCount.textContent = hot;
  elements.warmCount.textContent = warm;
  elements.watchCount.textContent = watch;
  elements.followupCount.textContent = followups;
  elements.totalCount.textContent =
    leads.length + (leads.length === 1 ? " lead" : " leads");

  renderLeads(leads, onEdit, onDelete);
}

export function renderLeads(leads, onEdit, onDelete) {
  elements.leadsContainer.innerHTML = "";

  if (leads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-card";
    empty.innerHTML =
      "No leads yet.<br><br>" + "Add your first security opportunity.";
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
    name.textContent = lead.name || "Unnamed Lead";

    const priority = document.createElement("div");
    priority.className =
      "priority priority-" + (lead.priority || "WATCH");
    priority.textContent = lead.priority || "WATCH";

    top.appendChild(name);
    top.appendChild(priority);

    const detail = document.createElement("div");
    detail.className = "lead-detail";
    detail.textContent = "📍 " + (lead.location || "Kakinada");

    const notes = document.createElement("div");
    notes.className = "lead-detail";
    notes.textContent = lead.notes || "No notes";

    const status = document.createElement("div");
    status.className = "lead-status";
    status.textContent = "Status: " + (lead.status || "NEW");

    card.appendChild(top);
    card.appendChild(detail);
    card.appendChild(notes);
    card.appendChild(status);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";

    const editButton = document.createElement("button");
    editButton.textContent = "✏️ Edit";
    editButton.style.flex = "1";
    editButton.style.padding = "10px";
    editButton.style.border = "1px solid #354251";
    editButton.style.borderRadius = "9px";
    editButton.style.background = "transparent";
    editButton.style.color = "#ffffff";

    editButton.addEventListener("click", () => {
      onEdit(lead);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️ Delete";
    deleteButton.style.flex = "1";
    deleteButton.style.padding = "10px";
    deleteButton.style.border = "1px solid #354251";
    deleteButton.style.borderRadius = "9px";
    deleteButton.style.background = "transparent";
    deleteButton.style.color = "#ff4d4d";

    deleteButton.addEventListener("click", () => {
      onDelete(lead);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(actions);

    elements.leadsContainer.appendChild(card);
  });
}
