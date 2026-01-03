// --- CONFIGURATION ---
const API_BASE =
  "https://travia-online-booking-application-backend.onrender.com/api";
let cmsModal;
let currentType = null; // 'country', 'city', 'tour'
let editingId = null;
let token = localStorage.getItem("token");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  // Auth Check
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || !user.isAdmin) {
    alert("Access Denied");
    window.location.href = "../pages/index.html";
    return;
  }

  cmsModal = new bootstrap.Modal(document.getElementById("cmsModal"));

  // Sidebar Navigation
  const tabs = ["dashboard", "countries", "cities", "tours", "users"];
  tabs.forEach((tab) => {
    document.getElementById(`menu-${tab}`).addEventListener("click", (e) => {
      e.preventDefault();
      switchView(tab);
    });
  });

  // Save Button Handler
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
    .querySelectorAll(".list-group-item")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`menu-${viewName}`).classList.add("active");

  document.getElementById("page-title").innerText =
    viewName.charAt(0).toUpperCase() + viewName.slice(1);

  if (viewName === "countries") loadCountries();
  if (viewName === "cities") loadCities();
  if (viewName === "tours") loadTours();
  if (viewName === "users") loadUsers();
}

// --- DATA LOADERS ---

async function loadStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  document.getElementById("stat-tours").innerText = data.tours;
  document.getElementById("stat-countries").innerText = data.countries;
  document.getElementById("stat-cities").innerText = data.cities;
  document.getElementById("stat-bookings").innerText = data.bookings;
}

async function loadCountries() {
  const res = await fetch(`${API_BASE}/admin/countries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const tbody = document.querySelector("#table-countries tbody");
  tbody.innerHTML = data
    .map(
      (c) => `
        <tr>
            <td><strong>${c.name}</strong><br><small class="text-muted">${
        c.continent
      }</small></td>
            <td>${c.isoCode}</td>
            <td><span class="badge bg-info text-dark">${
              c.visaPolicy
            }</span></td>
            <td>${c.currency}</td>
            <td>${(c.annualVisitors / 1000000).toFixed(1)}M</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick='editItem("country", ${JSON.stringify(
                  c
                )})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("countries", "${
                  c._id
                }")'><i class="bi bi-trash"></i></button>
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
            <td><strong>${c.name}</strong></td>
            <td>${c.countryId ? c.countryId.name : "Unknown"}</td>
            <td>$${c.economics?.minDailyBudget || 0}</td>
            <td>${c.popularityIndex}/100</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick='editItem("city", ${JSON.stringify(
                  c
                )})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("cities", "${
                  c._id
                }")'><i class="bi bi-trash"></i></button>
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
  const grid = document.getElementById("tours-grid");
  grid.innerHTML = data
    .map(
      (t) => `
        <div class="col-md-4">
            <div class="card h-100 shadow-sm">
                <img src="${
                  t.images[0] || "../public/assets/Travia.png"
                }" class="card-img-top" style="height: 180px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title fw-bold">${t.name}</h6>
                    <p class="small text-muted mb-1"><i class="bi bi-geo-alt"></i> ${
                      t.countryId?.name || "N/A"
                    }</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="text-primary fw-bold">$${t.price}</span>
                        <small>${t.duration}</small>
                    </div>
                </div>
                <div class="card-footer bg-white d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary" onclick='editItem("tour", ${JSON.stringify(
                      t
                    )})'>Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("tours", "${
                      t._id
                    }")'>Delete</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/admin/users`, { 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        
        if (!res.ok) throw new Error("Failed to fetch users");
        
        const data = await res.json();
        const tbody = document.querySelector("#table-users tbody");
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(u => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded-circle p-2 me-2 text-primary">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <strong>${u.username || u.name || 'User'}</strong>
                    </div>
                </td>
                <td>${u.email}</td>
                <td>
                    ${u.isAdmin 
                        ? '<span class="badge bg-primary">Admin</span>' 
                        : '<span class="badge bg-secondary">User</span>'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error loading users:", err);
    }
}

// --- DYNAMIC FORMS & MODAL ---

window.openModal = async (type) => {
  currentType = type;
  editingId = null;
  document.getElementById("modalTitle").innerText = `Add New ${
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
                <div class="col-6"><label>Name</label><input class="form-control" id="f-name" value="${
                  data.name || ""
                }"></div>
                <div class="col-6"><label>Continent</label><input class="form-control" id="f-continent" value="${
                  data.continent || ""
                }"></div>
                <div class="col-4"><label>ISO Code</label><input class="form-control" id="f-iso" value="${
                  data.isoCode || ""
                }"></div>
                <div class="col-4"><label>Currency</label><input class="form-control" id="f-currency" value="${
                  data.currency || "USD"
                }"></div>
                <div class="col-4"><label>Visa Policy</label>
                    <select class="form-select" id="f-visa">
                        <option value="Schengen">Schengen</option>
                        <option value="Visa Free">Visa Free</option>
                        <option value="E-Visa">E-Visa</option>
                        <option value="Visa Required">Visa Required</option>
                        <option value="Visa On Arrival">Visa On Arrival</option>
                    </select>
                </div>
                <div class="col-6"><label>Visitors (Annual)</label><input type="number" class="form-control" id="f-visitors" value="${
                  data.annualVisitors || 0
                }"></div>
                <div class="col-6"><label>Yield Tier</label><select class="form-select" id="f-yield"><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
            </div>`;
  } else if (type === "city") {
    // Fetch Countries for Dropdown
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
                <div class="col-6"><label>City Name</label><input class="form-control" id="f-name" value="${
                  data.name || ""
                }"></div>
                <div class="col-6"><label>Country</label><select class="form-select" id="f-country">${options}</select></div>
                <div class="col-4"><label>Daily Budget ($)</label><input type="number" class="form-control" id="f-budget" value="${
                  data.economics?.minDailyBudget || 0
                }"></div>
                <div class="col-4"><label>Lat</label><input type="number" class="form-control" id="f-lat" value="${
                  data.location?.coordinates[1] || 0
                }"></div>
                <div class="col-4"><label>Lng</label><input type="number" class="form-control" id="f-lng" value="${
                  data.location?.coordinates[0] || 0
                }"></div>
            </div>`;
  } else if (type === "tour") {
    // Cascading Setup
    const cRes = await fetch(`${API_BASE}/admin/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countries = await cRes.json();
    const ciRes = await fetch(`${API_BASE}/admin/cities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cities = await ciRes.json();

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
                <div class="col-12"><label>Tour Name</label><input class="form-control" id="f-name" value="${
                  data.name || ""
                }"></div>
                <div class="col-6"><label>Country</label><select class="form-select" id="f-country">${cOptions}</select></div>
                <div class="col-6"><label>City</label><select class="form-select" id="f-city">${ciOptions}</select></div>
                <div class="col-4"><label>Price ($)</label><input type="number" class="form-control" id="f-price" value="${
                  data.price || 0
                }"></div>
                <div class="col-4"><label>Duration</label><input class="form-control" id="f-duration" value="${
                  data.duration || "5 Days"
                }"></div>
                <div class="col-4"><label>Group Size</label><input class="form-control" id="f-group" value="${
                  data.groupSize || "Max 10"
                }"></div>
                <div class="col-12"><label>Image URL</label><input class="form-control" id="f-image" value="${
                  data.images?.[0] || ""
                }"></div>
                <div class="col-12"><label>Overview</label><textarea class="form-control" id="f-overview">${
                  data.overview || ""
                }</textarea></div>
            </div>`;
  }

  container.innerHTML = html;

  // Set Enum Values if editing
  if (type === "country" && data.visaPolicy)
    document.getElementById("f-visa").value = data.visaPolicy;
}

// --- CRUD ACTIONS ---

async function handleSave() {
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
      coordinates: [
        document.getElementById("f-lng").value,
        document.getElementById("f-lat").value,
      ],
    };
    payload.economics = {
      minDailyBudget: document.getElementById("f-budget").value,
    };
  } else if (currentType === "tour") {
    payload.name = document.getElementById("f-name").value;
    payload.countryId = document.getElementById("f-country").value;
    payload.cityId = document.getElementById("f-city").value;
    payload.price = document.getElementById("f-price").value;
    payload.duration = document.getElementById("f-duration").value;
    payload.groupSize = document.getElementById("f-group").value;
    payload.images = [document.getElementById("f-image").value];
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

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");

    cmsModal.hide();
    if (currentType === "country") loadCountries();
    if (currentType === "city") loadCities();
    if (currentType === "tour") loadTours();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

window.deleteItem = async (endpoint, id) => {
  if (!confirm("Are you sure? This cannot be undone.")) return;
  try {
    await fetch(`${API_BASE}/admin/${endpoint}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (endpoint === "countries") loadCountries();
    if (endpoint === "cities") loadCities();
    if (endpoint === "tours") loadTours();
    loadStats();
  } catch (err) {
    alert("Error deleting");
  }
};
