// --- CONFIGURATION ---
const API_BASE =
  "https://travia-online-booking-application-backend.onrender.com/api";
let cmsModal;
let toastEl;
let currentType = null;
let editingId = null;
let token = localStorage.getItem("token");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  // Auth Check
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || !user.isAdmin) {
    window.location.href = "../pages/index.html";
    return;
  }

  // Init Bootstrap Components
  cmsModal = new bootstrap.Modal(document.getElementById("cmsModal"));
  toastEl = new bootstrap.Toast(document.getElementById("liveToast"));

  // Sidebar Logic
  const tabs = ["dashboard", "countries", "cities", "tours", "users"];
  tabs.forEach((tab) => {
    document.getElementById(`menu-${tab}`).addEventListener("click", (e) => {
      e.preventDefault();
      switchView(tab);
    });
  });

  // Mobile Toggle
  document.getElementById("toggle-sidebar")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("d-none");
  });

  document.getElementById("btn-save-cms").addEventListener("click", handleSave);

  // Initial Load
  await loadStats();
});

function switchView(viewName) {
  document
    .querySelectorAll(".admin-view")
    .forEach((el) => el.classList.add("d-none"));
  document.getElementById(`view-${viewName}`).classList.remove("d-none");

  document
    .querySelectorAll(".sidebar-link")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`menu-${viewName}`).classList.add("active");

  if (viewName === "countries") loadCountries();
  if (viewName === "cities") loadCities();
  if (viewName === "tours") loadTours();
  if (viewName === "users") loadUsers();
}

function showToast(msg, isError = false) {
  const toastDiv = document.getElementById("liveToast");
  document.getElementById("toast-msg").innerText = msg;
  toastDiv.classList.remove(isError ? "bg-primary" : "bg-danger");
  toastDiv.classList.add(isError ? "bg-danger" : "bg-primary");
  toastEl.show();
}

// --- DATA LOADERS (READ) ---

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    document.getElementById("stat-tours").innerText = data.tours || 0;
    document.getElementById("stat-countries").innerText = data.countries || 0;
    document.getElementById("stat-cities").innerText = data.cities || 0;
    document.getElementById("stat-bookings").innerText = data.bookings || 0;
  } catch (e) {
    console.error(e);
  }
}

async function loadCountries() {
  const res = await fetch(`${API_BASE}/admin/countries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const tbody = document.querySelector("#table-countries tbody");

  const getBadge = (tier) => {
    if (tier === "High")
      return '<span class="badge badge-yield-high px-2 py-1">High Yield</span>';
    if (tier === "Low")
      return '<span class="badge bg-light text-muted px-2 py-1">Volume</span>';
    return '<span class="badge badge-yield-med px-2 py-1">Standard</span>';
  };

  tbody.innerHTML = data
    .map(
      (c) => `
        <tr>
            <td>
                <div class="fw-bold">${c.name}</div>
                <div class="small text-muted">${c.continent}</div>
            </td>
            <td><span class="badge badge-visa-free">${
              c.visaPolicy || "Standard"
            }</span></td>
            <td>${c.currency}</td>
            <td>${getBadge(c.marketYieldTier)}</td>
            <td>
                <button class="btn btn-sm btn-light border" onclick='editItem("country", ${JSON.stringify(
                  c
                )})'><i class="bi bi-pencil-fill text-primary"></i></button>
                <button class="btn btn-sm btn-light border" onclick='deleteItem("countries", "${
                  c._id
                }")'><i class="bi bi-trash-fill text-danger"></i></button>
            </td>
        </tr>
    `
    )
    .join("");
}

async function loadCities() {
  const res = await fetch(`${API_BASE}/admin/cities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const tbody = document.querySelector("#table-cities tbody");

  tbody.innerHTML = data
    .map(
      (c) => `
        <tr>
            <td class="fw-bold">${c.name}</td>
            <td>${c.countryId ? c.countryId.name : "Unknown"}</td>
            <td>
                <h6 class="mb-0 text-success fw-bold">$${
                  c.economics?.minDailyBudget || 0
                }</h6>
                <small class="text-muted">per day</small>
            </td>
            <td>
                <div class="d-flex gap-2 small text-muted">
                    <span><i class="bi bi-house"></i> $${
                      c.economics?.components?.accommodationCost || 0
                    }</span>
                    <span><i class="bi bi-cup-hot"></i> $${
                      c.economics?.components?.mealCost || 0
                    }</span>
                    <span><i class="bi bi-bus-front"></i> $${
                      c.economics?.components?.transitCost || 0
                    }</span>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-light border" onclick='editItem("city", ${JSON.stringify(
                  c
                )})'><i class="bi bi-pencil-fill text-primary"></i></button>
                <button class="btn btn-sm btn-light border" onclick='deleteItem("cities", "${
                  c._id
                }")'><i class="bi bi-trash-fill text-danger"></i></button>
            </td>
        </tr>
    `
    )
    .join("");
}

async function loadTours() {
  const res = await fetch(`${API_BASE}/admin/tours`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  document.getElementById("tours-grid").innerHTML = data
    .map(
      (t) => `
        <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${
                  t.images[0] || "../public/assets/Travia.png"
                }" class="card-img-top" style="height: 160px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="fw-bold mb-1">${t.name}</h6>
                    <p class="small text-muted mb-2"><i class="bi bi-geo-alt"></i> ${
                      t.cityId?.name || "City"
                    }, ${t.countryId?.name || "Country"}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="text-primary fw-bold fs-5">$${
                          t.price
                        }</span>
                        <span class="badge bg-light text-dark border">${
                          t.duration
                        }</span>
                    </div>
                </div>
                <div class="card-footer bg-white border-top-0 d-flex justify-content-between pb-3">
                    <button class="btn btn-sm btn-outline-primary" onclick='editItem("tour", ${JSON.stringify(
                      t
                    )})'>Edit Details</button>
                    <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("tours", "${
                      t._id
                    }")'>Remove</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

async function loadUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  document.querySelector("#table-users tbody").innerHTML = data
    .map(
      (u) => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2"><i class="bi bi-person-fill"></i></div>
                    <div><strong>${u.username}</strong></div>
                </div>
            </td>
            <td>${u.email}</td>
            <td>${
              u.isAdmin
                ? '<span class="badge bg-primary">Administrator</span>'
                : '<span class="badge bg-secondary">Traveler</span>'
            }</td>
            <td><span class="badge bg-success">Active</span></td>
        </tr>
    `
    )
    .join("");
}

// --- INTELLIGENT FORMS (CREATE/UPDATE) ---

window.openModal = async (type) => {
  currentType = type;
  editingId = null;
  document.getElementById("modalTitle").innerText = `Create New ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;
  await renderForm(type);
  cmsModal.show();
};

window.editItem = async (type, data) => {
  currentType = type;
  editingId = data._id;
  document.getElementById("modalTitle").innerText = `Edit ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;
  await renderForm(type, data);
  cmsModal.show();
};

async function renderForm(type, data = {}) {
  const container = document.getElementById("modalBody");
  let html = "";

  if (type === "country") {
    html = `
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Country Name</label>
                <input class="form-control" id="f-name" value="${
                  data.name || ""
                }" placeholder="e.g. France">
            </div>
            <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Continent</label>
                <select class="form-select" id="f-continent">
                    <option value="Europe" ${
                      data.continent === "Europe" ? "selected" : ""
                    }>Europe</option>
                    <option value="Asia" ${
                      data.continent === "Asia" ? "selected" : ""
                    }>Asia</option>
                    <option value="North America" ${
                      data.continent === "North America" ? "selected" : ""
                    }>North America</option>
                    <option value="Africa" ${
                      data.continent === "Africa" ? "selected" : ""
                    }>Africa</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">ISO Code</label>
                <input class="form-control" id="f-iso" value="${
                  data.isoCode || ""
                }" maxlength="2" style="text-transform:uppercase" placeholder="FR">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">Currency</label>
                <input class="form-control" id="f-currency" value="${
                  data.currency || "USD"
                }">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">Visa Policy</label>
                <select class="form-select" id="f-visa">
                    <option value="Schengen" ${
                      data.visaPolicy === "Schengen" ? "selected" : ""
                    }>Schengen Area</option>
                    <option value="Visa Free" ${
                      data.visaPolicy === "Visa Free" ? "selected" : ""
                    }>Visa Free</option>
                    <option value="E-Visa" ${
                      data.visaPolicy === "E-Visa" ? "selected" : ""
                    }>Electronic Visa</option>
                    <option value="Visa Required" ${
                      data.visaPolicy === "Visa Required" ? "selected" : ""
                    }>Embassy Visa</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Market Yield Tier</label>
                <select class="form-select" id="f-yield">
                    <option value="High" ${
                      data.marketYieldTier === "High" ? "selected" : ""
                    }>High Yield (Luxury focus)</option>
                    <option value="Medium" ${
                      data.marketYieldTier === "Medium" ? "selected" : ""
                    }>Medium Yield</option>
                    <option value="Low" ${
                      data.marketYieldTier === "Low" ? "selected" : ""
                    }>Low Yield (Volume focus)</option>
                </select>
            </div>
             <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Annual Visitors</label>
                <input type="number" class="form-control" id="f-visitors" value="${
                  data.annualVisitors || 0
                }">
            </div>
        </div>`;
  } else if (type === "city") {
    // Dynamic Dropdown Fetch for City
    const cRes = await fetch(`${API_BASE}/admin/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countries = await cRes.json();
    const options = countries
      .map(
        (c) =>
          `<option value="${c._id}" ${
            data.countryId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");

    html = `
        <div class="row g-3">
            <div class="col-md-7">
                <label class="form-label small fw-bold text-muted">City Name</label>
                <input class="form-control" id="f-name" value="${
                  data.name || ""
                }">
            </div>
            <div class="col-md-5">
                <label class="form-label small fw-bold text-muted">Country</label>
                <select class="form-select" id="f-country">${options}</select>
            </div>
            
            <div class="col-12 mt-4">
                <div class="p-3 bg-light rounded border">
                    <h6 class="fw-bold text-primary mb-3"><i class="bi bi-calculator"></i> Economic Modelling</h6>
                    <div class="row g-2">
                        <div class="col-md-4">
                            <label class="small text-muted">Accom. (1 Night)</label>
                            <input type="number" class="form-control calc-input" id="f-cost-accom" value="${
                              data.economics?.components?.accommodationCost || 0
                            }">
                        </div>
                        <div class="col-md-4">
                            <label class="small text-muted">Meals (Daily)</label>
                            <input type="number" class="form-control calc-input" id="f-cost-meal" value="${
                              data.economics?.components?.mealCost || 0
                            }">
                        </div>
                        <div class="col-md-4">
                            <label class="small text-muted">Transit</label>
                            <input type="number" class="form-control calc-input" id="f-cost-transit" value="${
                              data.economics?.components?.transitCost || 0
                            }">
                        </div>
                        <div class="col-12 mt-2">
                            <label class="small fw-bold">Total Min. Daily Budget (Auto-Calc)</label>
                            <input type="number" class="form-control fw-bold text-success" id="f-budget" value="${
                              data.economics?.minDailyBudget || 0
                            }" readonly>
                            <small class="text-muted fst-italic">Formula: Accom + (Meals x 0.8) + Transit</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6"><label class="small text-muted">Latitude</label><input type="number" class="form-control" id="f-lat" value="${
              data.location?.coordinates[1] || 0
            }"></div>
            <div class="col-md-6"><label class="small text-muted">Longitude</label><input type="number" class="form-control" id="f-lng" value="${
              data.location?.coordinates[0] || 0
            }"></div>
        </div>`;
  } else if (type === "tour") {
    // --- FULLY RESTORED TOUR FORM ---

    // 1. Fetch data for dropdowns
    const cRes = await fetch(`${API_BASE}/admin/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countries = await cRes.json();
    const ciRes = await fetch(`${API_BASE}/admin/cities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cities = await ciRes.json();

    // 2. Build Options
    const cOptions = countries
      .map(
        (c) =>
          `<option value="${c._id}" ${
            data.countryId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");
    const ciOptions = cities
      .map(
        (c) =>
          `<option value="${c._id}" ${
            data.cityId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");

    html = `
        <div class="row g-3">
            <div class="col-12">
                <label class="form-label small fw-bold text-muted">Tour Name</label>
                <input class="form-control" id="f-name" value="${
                  data.name || ""
                }" placeholder="e.g., Hidden Gems of Tuscany">
            </div>

            <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">Country</label>
                <select class="form-select" id="f-country">${cOptions}</select>
            </div>
            <div class="col-md-6">
                <label class="form-label small fw-bold text-muted">City</label>
                <select class="form-select" id="f-city">${ciOptions}</select>
            </div>

            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">Price ($)</label>
                <input type="number" class="form-control" id="f-price" value="${
                  data.price || 0
                }">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">Duration</label>
                <input class="form-control" id="f-duration" value="${
                  data.duration || "5 Days"
                }">
            </div>
            <div class="col-md-4">
                <label class="form-label small fw-bold text-muted">Group Size</label>
                <input class="form-control" id="f-group" value="${
                  data.groupSize || "Max 12"
                }">
            </div>

            <div class="col-12">
                <label class="form-label small fw-bold text-muted">Main Image URL</label>
                <input class="form-control" id="f-image" value="${
                  data.images?.[0] || ""
                }" placeholder="https://...">
            </div>
            
            <div class="col-12">
                <label class="form-label small fw-bold text-muted">Tour Overview</label>
                <textarea class="form-control" id="f-overview" rows="4" placeholder="Detailed description...">${
                  data.overview || ""
                }</textarea>
            </div>
        </div>
    `;
  }

  container.innerHTML = html;

  // ATTACH LISTENERS FOR CALCULATOR
  if (type === "city") {
    ["f-cost-accom", "f-cost-meal", "f-cost-transit"].forEach((id) => {
      document.getElementById(id).addEventListener("input", calculateBudget);
    });
  }
}

function calculateBudget() {
  const accom = parseFloat(document.getElementById("f-cost-accom").value) || 0;
  const meal = parseFloat(document.getElementById("f-cost-meal").value) || 0;
  const transit =
    parseFloat(document.getElementById("f-cost-transit").value) || 0;

  // Research Report Formula
  const total = accom + meal * 0.8 + transit;
  document.getElementById("f-budget").value = Math.ceil(total);
}

// --- SAVE HANDLER ---

async function handleSave() {
  const btn = document.getElementById("btn-save-cms");
  const spinner = document.getElementById("save-spinner");

  btn.disabled = true;
  spinner.classList.remove("d-none");

  try {
    const payload = {};

    if (currentType === "country") {
      payload.name = document.getElementById("f-name").value;
      payload.continent = document.getElementById("f-continent").value;
      payload.isoCode = document.getElementById("f-iso").value;
      payload.currency = document.getElementById("f-currency").value;
      payload.visaPolicy = document.getElementById("f-visa").value;
      payload.annualVisitors = document.getElementById("f-visitors").value;
      payload.marketYieldTier = document.getElementById("f-yield").value;
    } else if (currentType === "city") {
      payload.name = document.getElementById("f-name").value;
      payload.countryId = document.getElementById("f-country").value;
      payload.location = {
        type: "Point",
        coordinates: [
          parseFloat(document.getElementById("f-lng").value),
          parseFloat(document.getElementById("f-lat").value),
        ],
      };
      // NESTED ECONOMIC DATA
      payload.economics = {
        minDailyBudget: parseFloat(document.getElementById("f-budget").value),
        components: {
          accommodationCost: parseFloat(
            document.getElementById("f-cost-accom").value
          ),
          mealCost: parseFloat(document.getElementById("f-cost-meal").value),
          transitCost: parseFloat(
            document.getElementById("f-cost-transit").value
          ),
        },
      };
    } else if (currentType === "tour") {
      // --- RESTORED TOUR PAYLOAD ---
      payload.name = document.getElementById("f-name").value;
      payload.countryId = document.getElementById("f-country").value;
      payload.cityId = document.getElementById("f-city").value;
      payload.price = parseFloat(document.getElementById("f-price").value);
      payload.duration = document.getElementById("f-duration").value;
      payload.groupSize = document.getElementById("f-group").value;
      payload.images = [document.getElementById("f-image").value]; // Assuming single image for now
      payload.overview = document.getElementById("f-overview").value;
    }

    const endpoint =
      currentType === "country"
        ? "countries"
        : currentType === "city"
        ? "cities"
        : "tours";
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE}/admin/${endpoint}/${editingId}`
      : `${API_BASE}/admin/${endpoint}`;

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Operation Failed");

    cmsModal.hide();
    showToast(`${currentType} saved successfully!`);

    // Refresh Data
    if (currentType === "country") loadCountries();
    if (currentType === "city") loadCities();
    if (currentType === "tour") loadTours();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    spinner.classList.add("d-none");
  }
}

window.deleteItem = async (endpoint, id) => {
  if (!confirm("Are you sure? This action is irreversible.")) return;
  try {
    await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast("Item deleted");
    if (endpoint === "countries") loadCountries();
    if (endpoint === "cities") loadCities();
    if (endpoint === "tours") loadTours();
    loadStats();
  } catch (e) {
    showToast("Delete failed", true);
  }
};
