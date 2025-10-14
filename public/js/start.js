// public/js/start.js
// People UI (uses existing API). Adds toasts + button classes.

function toast(msg, ok = true) {
  const wrap = document.getElementById("toast")
  const el = document.createElement("div")
  el.className = `toast ${ok ? "ok" : "err"}`
  el.textContent = msg
  wrap.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}

// -------- API --------
async function apiListPeople() {
  const res = await fetch("/api/people")
  if (!res.ok) throw new Error("Failed to load people")
  return res.json()
}
async function apiCreatePerson(payload) {
  const res = await fetch("/api/person", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload||{})
  })
  if (!res.ok) throw new Error((await res.json()).error || "Create failed")
  return res.json()
}
async function apiUpdatePerson(id, payload) {
  const res = await fetch(`/api/person/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload||{})
  })
  if (!res.ok) throw new Error((await res.json()).error || "Update failed")
  return res.json()
}
async function apiDeletePerson(id) {
  const res = await fetch(`/api/person/${id}`, { method: "DELETE" })
  if (res.status === 204) return true
  throw new Error((await res.json()).error || "Delete failed")
}

// -------- Render --------
function renderPeople(people) {
  const tbody = document.querySelector("#peopletable tbody")
  tbody.innerHTML = ""

  for (const p of people) {
    const tr = document.createElement("tr")
    tr.dataset.id = p.id
    tr.innerHTML = `
      <td class="name-cell">${escapeHTML(p.name || "")}</td>
      <td class="day-1"></td>
      <td class="day-2"></td>
      <td class="day-3"></td>
      <td class="day-4"></td>
      <td class="day-5"></td>
      <td class="day-6"></td>
      <td class="day-7"></td>
      <td class="action-cell" style="display:flex; gap:8px;">
        <button class="edit-btn btn btn-ghost btn-small" data-id="${p.id}">Edit</button>
        <button class="delete-btn btn btn-danger btn-small" data-id="${p.id}">Delete</button>
      </td>
    `
    tbody.appendChild(tr)
  }
}

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

// -------- Modal helpers --------
function openPersonForm(person) {
  const wrap = document.getElementById("personform")
  wrap.style.display = "flex"
  document.body.classList.add("modal-open")
  wrap.dataset.id = person?.id ?? ""

  const nameEl  = document.getElementById("personform-name")
  const emailEl = document.getElementById("personform-email")
  const notesEl = document.getElementById("personform-notes")
  nameEl.value  = person?.name  || ""
  emailEl.value = person?.email || ""
  notesEl.value = person?.notes || ""
  setTimeout(() => nameEl.focus(), 0)
}
function closePersonForm() {
  const wrap = document.getElementById("personform")
  wrap.style.display = "none"
  wrap.dataset.id = ""
  document.body.classList.remove("modal-open")
}

// -------- Wire --------
function wireRowButtons() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const name = row.querySelector(".name-cell")?.textContent?.trim() || ""
      openPersonForm({ id, name, email: "", notes: "" })
    })
  })
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (ev) => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const name = row.querySelector(".name-cell")?.textContent?.trim() || "this person"
      if (!confirm(`Delete "${name}"?`)) return
      try { await apiDeletePerson(id); toast("Deleted"); await reloadPeople() }
      catch (e) { toast(e.message, false) }
    })
  })

  const addBtn = document.getElementById("addperson")
  addBtn.onclick = () => openPersonForm({ id: undefined, name: "", email: "", notes: "" })
}

function wireModal() {
  const formEl = document.querySelector("#personform form")
  const closeBtn = document.querySelector("#personform .close")
  closeBtn.onclick = () => closePersonForm()

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault()
    const wrap = document.getElementById("personform")
    const idRaw = wrap.dataset.id
    const id = idRaw === "" ? undefined : Number(idRaw)
    const payload = {
      name:  document.getElementById("personform-name").value.trim(),
      email: document.getElementById("personform-email").value.trim(),
      notes: document.getElementById("personform-notes").value.trim()
    }
    if (!payload.name) { toast("Name is required", false); return }
    try {
      if (typeof id === "number" && !Number.isNaN(id)) await apiUpdatePerson(id, payload)
      else await apiCreatePerson(payload)
      toast("Saved")
      closePersonForm()
      await reloadPeople()
    } catch (err) {
      toast(err.message || "Save failed", false)
    }
  })
}

// -------- Boot --------
async function reloadPeople() {
  const people = await apiListPeople()
  renderPeople(people)
  wireRowButtons()
}
async function boot() { await reloadPeople(); wireModal() }
document.addEventListener("DOMContentLoaded", boot)
