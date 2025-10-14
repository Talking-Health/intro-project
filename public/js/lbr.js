// public/js/lbr.js
// Landlords/Buildings/Rooms UI with selection highlight + toasts.

function toast(msg, ok = true) {
    const wrap = document.getElementById("toast")
    const el = document.createElement("div")
    el.className = `toast ${ok ? "ok" : "err"}`
    el.textContent = msg
    wrap.appendChild(el)
    setTimeout(() => el.remove(), 2500)
  }
  
  let selLandlord = null
  let selBuilding = null
  
  // ---------- API ----------
  async function jsonOrThrow(r, fallback) {
    if (r.ok) return r.json()
    let e = fallback
    try { e = (await r.json()).error || fallback } catch {}
    throw new Error(e)
  }
  
  async function apiLandlordsList(){ return jsonOrThrow(await fetch("/api/landlords"), "Failed to list landlords") }
  async function apiLandlordCreate(p){ return jsonOrThrow(await fetch("/api/landlord",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Create landlord failed") }
  async function apiLandlordUpdate(id,p){ return jsonOrThrow(await fetch(`/api/landlord/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Update landlord failed") }
  async function apiLandlordDelete(id){ const r=await fetch(`/api/landlord/${id}`,{method:"DELETE"}); if(r.status===204) return true; return jsonOrThrow(r,"Delete landlord failed") }
  
  async function apiBuildingsList(landlordId){ const p=landlordId?`?landlordId=${landlordId}`:""; return jsonOrThrow(await fetch(`/api/buildings${p}`),"Failed to list buildings") }
  async function apiBuildingCreate(p){ return jsonOrThrow(await fetch("/api/building",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Create building failed") }
  async function apiBuildingUpdate(id,p){ return jsonOrThrow(await fetch(`/api/building/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Update building failed") }
  async function apiBuildingDelete(id){ const r=await fetch(`/api/building/${id}`,{method:"DELETE"}); if(r.status===204) return true; return jsonOrThrow(r,"Delete building failed") }
  
  async function apiRoomsList(buildingId){ const p=buildingId?`?buildingId=${buildingId}`:""; return jsonOrThrow(await fetch(`/api/rooms${p}`),"Failed to list rooms") }
  async function apiRoomCreate(p){ return jsonOrThrow(await fetch("/api/room",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Create room failed") }
  async function apiRoomUpdate(id,p){ return jsonOrThrow(await fetch(`/api/room/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p||{})}),"Update room failed") }
  async function apiRoomDelete(id){ const r=await fetch(`/api/room/${id}`,{method:"DELETE"}); if(r.status===204) return true; return jsonOrThrow(r,"Delete room failed") }
  
  // ---------- Render ----------
  function renderLandlords(rows) {
    const tbody = document.querySelector("#landlordtable tbody")
    tbody.innerHTML = ""
    for (const l of rows) {
      const tr = document.createElement("tr")
      tr.dataset.id = l.id
      if (selLandlord && selLandlord.id === l.id) tr.classList.add("selected-row")
      tr.innerHTML = `
        <td class="ll-name">${escapeHTML(l.name||"")}</td>
        <td class="ll-email">${escapeHTML(l.email||"")}</td>
        <td class="ll-notes">${escapeHTML(l.notes||"")}</td>
        <td style="display:flex; gap:8px;">
          <button class="ll-select btn btn-ghost btn-small" data-id="${l.id}">Select</button>
          <button class="ll-edit btn btn-ghost btn-small" data-id="${l.id}">Edit</button>
          <button class="ll-del btn btn-danger btn-small" data-id="${l.id}">Delete</button>
        </td>
      `
      tbody.appendChild(tr)
    }
  }
  function renderBuildings(rows) {
    const tbody = document.querySelector("#buildingtable tbody")
    tbody.innerHTML = ""
    for (const b of rows) {
      const tr = document.createElement("tr")
      tr.dataset.id = b.id
      if (selBuilding && selBuilding.id === b.id) tr.classList.add("selected-row")
      tr.innerHTML = `
        <td class="b-name">${escapeHTML(b.name||"")}</td>
        <td class="b-address">${escapeHTML(b.address||"")}</td>
        <td style="display:flex; gap:8px;">
          <button class="b-select btn btn-ghost btn-small" data-id="${b.id}">Select</button>
          <button class="b-edit btn btn-ghost btn-small" data-id="${b.id}">Edit</button>
          <button class="b-del btn btn-danger btn-small" data-id="${b.id}">Delete</button>
        </td>
      `
      tbody.appendChild(tr)
    }
  }
  function renderRooms(rows) {
    const tbody = document.querySelector("#roomtable tbody")
    tbody.innerHTML = ""
    for (const r of rows) {
      const tr = document.createElement("tr")
      tr.dataset.id = r.id
      tr.innerHTML = `
        <td class="r-name">${escapeHTML(r.name||"")}</td>
        <td class="r-capacity">${Number(r.capacity)||0}</td>
        <td style="display:flex; gap:8px;">
          <button class="r-edit btn btn-ghost btn-small" data-id="${r.id}">Edit</button>
          <button class="r-del btn btn-danger btn-small" data-id="${r.id}">Delete</button>
        </td>
      `
      tbody.appendChild(tr)
    }
  }
  function escapeHTML(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
  
  // ---------- Modals ----------
  function openModal(id, focusId) {
    const wrap = document.getElementById(id)
    wrap.style.display = "flex"
    document.body.classList.add("modal-open")
    setTimeout(() => document.getElementById(focusId)?.focus(), 0)
  }
  function closeModal(id) {
    const wrap = document.getElementById(id)
    wrap.style.display = "none"
    document.body.classList.remove("modal-open")
  }
  
  // ---------- Landlords ----------
  async function reloadLandlords() {
    const rows = await apiLandlordsList()
    renderLandlords(rows)
    document.getElementById("addbuilding").disabled = !selLandlord
    document.getElementById("selected-landlord").textContent =
      selLandlord ? `— selected: ${selLandlord.name}` : "(no landlord selected)"
    wireLandlordButtons()
  }
  function wireLandlordButtons() {
    document.querySelectorAll(".ll-select").forEach(btn => btn.onclick = async ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      selLandlord = { id, name: row.querySelector(".ll-name").textContent.trim() }
      selBuilding = null
      toast(`Selected landlord: ${selLandlord.name}`)
      await reloadLandlords()
      await reloadBuildings()
      await reloadRooms()
    })
    document.querySelectorAll(".ll-edit").forEach(btn => btn.onclick = ev => {
      const row = ev.currentTarget.closest("tr")
      const id  = Number(ev.currentTarget.dataset.id)
      const f = document.getElementById("landlordform")
      f.dataset.id = id
      document.getElementById("landlord-name").value  = row.querySelector(".ll-name").textContent.trim()
      document.getElementById("landlord-email").value = row.querySelector(".ll-email").textContent.trim()
      document.getElementById("landlord-notes").value = row.querySelector(".ll-notes").textContent.trim()
      openModal("landlordform","landlord-name")
    })
    document.querySelectorAll(".ll-del").forEach(btn => btn.onclick = async ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const name = row.querySelector(".ll-name").textContent.trim()
      if (!confirm(`Delete "${name}"? Buildings and rooms will also be removed.`)) return
      try {
        await apiLandlordDelete(id)
        if (selLandlord && selLandlord.id === id) { selLandlord=null; selBuilding=null }
        toast("Landlord deleted")
        await reloadLandlords(); await reloadBuildings(); await reloadRooms()
      } catch(e){ toast(e.message,false) }
    })
    const addBtn = document.getElementById("addlandlord")
    addBtn.onclick = () => {
      const f = document.getElementById("landlordform"); f.dataset.id = ""
      document.getElementById("landlord-name").value = ""
      document.getElementById("landlord-email").value = ""
      document.getElementById("landlord-notes").value = ""
      openModal("landlordform","landlord-name")
    }
  }
  function wireLandlordForm() {
    const form = document.querySelector("#landlordform form")
    const close = document.querySelector("#landlordform .close")
    close.onclick = () => closeModal("landlordform")
    form.addEventListener("submit", async e => {
      e.preventDefault()
      const f = document.getElementById("landlordform")
      const idRaw = f.dataset.id
      const payload = {
        name: document.getElementById("landlord-name").value.trim(),
        email: document.getElementById("landlord-email").value.trim(),
        notes: document.getElementById("landlord-notes").value.trim()
      }
      try {
        if (!payload.name) throw new Error("Name is required")
        if (idRaw) await apiLandlordUpdate(Number(idRaw), payload)
        else await apiLandlordCreate(payload)
        toast("Landlord saved")
        closeModal("landlordform")
        await reloadLandlords()
      } catch(e){ toast(e.message,false) }
    })
  }
  
  // ---------- Buildings ----------
  async function reloadBuildings() {
    const rows = await apiBuildingsList(selLandlord?.id)
    renderBuildings(rows)
    document.getElementById("addbuilding").disabled = !selLandlord
    document.getElementById("selected-landlord").textContent =
      selLandlord ? `— selected: ${selLandlord.name}` : "(no landlord selected)"
    wireBuildingButtons()
  }
  function wireBuildingButtons() {
    document.querySelectorAll(".b-select").forEach(btn => btn.onclick = async ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      selBuilding = { id, name: row.querySelector(".b-name").textContent.trim() }
      toast(`Selected building: ${selBuilding.name}`)
      await reloadBuildings(); await reloadRooms()
    })
    document.querySelectorAll(".b-edit").forEach(btn => btn.onclick = ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const f = document.getElementById("buildingform")
      f.dataset.id = id
      document.getElementById("building-name").value    = row.querySelector(".b-name").textContent.trim()
      document.getElementById("building-address").value = row.querySelector(".b-address").textContent.trim()
      openModal("buildingform","building-name")
    })
    document.querySelectorAll(".b-del").forEach(btn => btn.onclick = async ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const name = row.querySelector(".b-name").textContent.trim()
      if (!confirm(`Delete building "${name}"? Rooms will also be removed.`)) return
      try {
        await apiBuildingDelete(id)
        if (selBuilding && selBuilding.id === id) selBuilding=null
        toast("Building deleted")
        await reloadBuildings(); await reloadRooms()
      } catch(e){ toast(e.message,false) }
    })
    const addBtn = document.getElementById("addbuilding")
    addBtn.onclick = () => {
      if (!selLandlord) { toast("Select a landlord first", false); return }
      const f = document.getElementById("buildingform"); f.dataset.id = ""
      document.getElementById("building-name").value = ""
      document.getElementById("building-address").value = ""
      openModal("buildingform","building-name")
    }
  }
  function wireBuildingForm() {
    const form = document.querySelector("#buildingform form")
    const close = document.querySelector("#buildingform .close")
    close.onclick = () => closeModal("buildingform")
    form.addEventListener("submit", async e => {
      e.preventDefault()
      const f = document.getElementById("buildingform")
      const idRaw = f.dataset.id
      const payload = {
        landlord_id: selLandlord?.id,
        name: document.getElementById("building-name").value.trim(),
        address: document.getElementById("building-address").value.trim()
      }
      try {
        if (!selLandlord) throw new Error("Select a landlord first")
        if (!payload.name) throw new Error("Name is required")
        if (idRaw) await apiBuildingUpdate(Number(idRaw), payload)
        else await apiBuildingCreate(payload)
        toast("Building saved")
        closeModal("buildingform")
        await reloadBuildings()
      } catch(e){ toast(e.message,false) }
    })
  }
  
  // ---------- Rooms ----------
  async function reloadRooms() {
    const rows = await apiRoomsList(selBuilding?.id)
    renderRooms(rows)
    document.getElementById("addroom").disabled = !selBuilding
    document.getElementById("selected-building").textContent =
      selBuilding ? `— selected: ${selBuilding.name}` : "(no building selected)"
    wireRoomButtons()
  }
  function wireRoomButtons() {
    document.querySelectorAll(".r-edit").forEach(btn => btn.onclick = ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const f = document.getElementById("roomform")
      f.dataset.id = id
      document.getElementById("room-name").value = row.querySelector(".r-name").textContent.trim()
      document.getElementById("room-capacity").value = row.querySelector(".r-capacity").textContent.trim()
      openModal("roomform","room-name")
    })
    document.querySelectorAll(".r-del").forEach(btn => btn.onclick = async ev => {
      const id = Number(ev.currentTarget.dataset.id)
      const row = ev.currentTarget.closest("tr")
      const name = row.querySelector(".r-name").textContent.trim()
      if (!confirm(`Delete room "${name}"?`)) return
      try { await apiRoomDelete(id); toast("Room deleted"); await reloadRooms() }
      catch(e){ toast(e.message,false) }
    })
    const addBtn = document.getElementById("addroom")
    addBtn.onclick = () => {
      if (!selBuilding) { toast("Select a building first", false); return }
      const f = document.getElementById("roomform"); f.dataset.id = ""
      document.getElementById("room-name").value = ""
      document.getElementById("room-capacity").value = "0"
      openModal("roomform","room-name")
    }
  }
  function wireRoomForm() {
    const form = document.querySelector("#roomform form")
    const close = document.querySelector("#roomform .close")
    close.onclick = () => closeModal("roomform")
    form.addEventListener("submit", async e => {
      e.preventDefault()
      const f = document.getElementById("roomform")
      const idRaw = f.dataset.id
      const payload = {
        building_id: selBuilding?.id,
        name: document.getElementById("room-name").value.trim(),
        capacity: Number(document.getElementById("room-capacity").value)
      }
      try {
        if (!selBuilding) throw new Error("Select a building first")
        if (!payload.name) throw new Error("Name is required")
        if (idRaw) await apiRoomUpdate(Number(idRaw), payload)
        else await apiRoomCreate(payload)
        toast("Room saved")
        closeModal("roomform")
        await reloadRooms()
      } catch(e){ toast(e.message,false) }
    })
  }
  
  // ---------- Boot ----------
  async function bootLBR() {
    wireLandlordForm()
    wireBuildingForm()
    wireRoomForm()
    await reloadLandlords()
    await reloadBuildings()
    await reloadRooms()
  }
  document.addEventListener("DOMContentLoaded", bootLBR)
  