const API_BASE = window.TraviaAPI.admin;
const token = localStorage.getItem("token");
let cmsModal; // Bootstrap Modal Instance
let currentType = null; // 'country', 'city', 'tour'
let editingId = null; // ID if editing, null if new

const VALID_CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Security Check (Main)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Security Check
  if (!token || !user.isAdmin) {
    window.location.href = "index.html";
    return;
  }

  // 2. Setup Components
  const modalEl = document.getElementById("cmsModal");
  if (modalEl) {
    cmsModal = new bootstrap.Modal(modalEl);
  } else {
    console.warn("CMS Modal element not found on this page.");
  }

  // 3. Sidebar & View Logic
  const path = window.location.pathname;
  const page = path.split("/").pop().replace(".html", "") || "dashboard";

  // A. Auto-Highlight Sidebar
  // Remove 'active' from all links first
  document
    .querySelectorAll(".sidebar-link")
    .forEach((link) => link.classList.remove("active"));
  const currentLink = document.getElementById(`menu-${page}`);
  if (currentLink) currentLink.classList.add("active");

  // B. Force-Show Content (Fixes White Page)
  // This removes 'd-none' from any content wrapper if it was accidentally copied over
  document
    .querySelectorAll(".admin-view")
    .forEach((el) => el.classList.remove("d-none"));

  // 4. Sidebar Navigation

  if (path.includes("dashboard")) {
    loadDashboardStats();
  } else if (path.includes("cities")) {
    loadCities();
  } else if (path.includes("countries")) {
    loadCountries();
  } else if (path.includes("tours")) {
    loadTours();
  } else if (path.includes("users")) {
    loadUsers();
  }

  // 5. Global Event Listeners

  // Safety Check: Only add listener if the Save Button actually exists
  const saveBtn = document.getElementById("btn-save-cms");
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSave);
  }

  // Safety Check: Only add listener if Sidebar Toggle exists
  const toggleBtn = document.getElementById("toggle-sidebar");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) sidebar.classList.toggle("show");
    });
  }

  // 5. Initial Load
  loadDashboardStats();
});

// ==========================================
// DATA FETCHING & RENDERING
// ==========================================

async function loadDashboardStats() {
  if (!document.getElementById("stat-tours")) return;
  try {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    document.getElementById("stat-tours").innerText = data.tours || 0;
    document.getElementById("stat-countries").innerText = data.countries || 0;
    document.getElementById("stat-cities").innerText = data.cities || 0;
    document.getElementById("stat-bookings").innerText = data.bookings || 0;
    document.getElementById("stat-users").innerText = data.users || 0;
  } catch (e) {
    console.error("Stats Error", e);
  }
}

async function loadCountries() {
  if (!document.getElementById("table-countries")) return;
  const res = await fetch(`${API_BASE}/countries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  const tbody = document.querySelector("#table-countries tbody");
  tbody.innerHTML = data
    .map(
      (item) => `
        <tr>
            <td class="fw-bold text-dark">${item.name}</td>
            <td>${item.continent}</td>
            <td><span class="badge bg-light text-dark border">${
              item.isoCode
            }</span></td>
            <td>${item.marketYieldTier || "-"}</td>
            <td>${item.visaPolicy || "-"}</td>
            <td>${item.annualVisitors || 0}</td>
            <td>${item.currency}</td>
            <td>
            <div class="d-flex align-items-center justify-content-between" style="max-width: 150px;">
                <span class="text-muted small me-2">
                    ${(item.backgroundImage || "").substring(0, 10)}...
                </span>
                
                ${
                  item.backgroundImage
                    ? `
                    <button class="btn btn-sm btn-light border text-primary" 
                            onclick="showImagePreview('${item.backgroundImage}')">
                        <i class="bi bi-image"></i>
                    </button>`
                    : ""
                }
            </div>
        </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick='openForm("country", ${JSON.stringify(
                  item
                )})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("countries", "${
                  item._id
                }")'><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `
    )
    .join("");
}

async function loadCities() {
  if (!document.getElementById("table-cities")) return;
  const res = await fetch(`${API_BASE}/cities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  const tbody = document.querySelector("#table-cities tbody");
  tbody.innerHTML = data
    .map(
      (item) => `
        <tr>
            <td class="fw-bold text-dark">${item.name}</td>
            <td class="text-primary fw-semibold">${
              item.countryId ? item.countryId.name : "Unlinked"
            }</td>
            <td>${item.location.coordinates}</td>
            <td>$${item.economics?.minDailyBudget || 0} / day</td>
            <td>$${item.economics.accommodationCost || 0} / day</td>
            <td>$${item.economics.mealIndex || 0} / day</td>
            <td>$${item.economics.transitCost || 0} / day</td>
            <td>${item.economics.currencyStrength || 0} </td>
            <td>${item.timeZone}</td>
            <td>${item.popularityIndex}</td>
            <td>
    <div class="d-flex align-items-center justify-content-between" style="max-width: 250px;">
        <span class="text-muted small me-2">
            ${(item.description || "").substring(0, 20)}${
        item.description && item.description.length > 20 ? "..." : ""
      }
        </span>
        ${
          item.description && item.description.length > 20
            ? `
            <button class="btn btn-sm btn-light border text-primary" 
                    onclick="showReadMore('${encodeURIComponent(
                      item.description
                    )}')">
                <i class="bi bi-eye-fill"></i>
            </button>`
            : ""
        }
    </div>
</td>
            <td>
    <div class="d-flex align-items-center justify-content-between" style="max-width: 150px;">
        <span class="text-muted small me-2">
            ${(item.images && item.images[0]
              ? item.images[0]
              : "No Image"
            ).substring(0, 10)}...
        </span>
        ${
          item.images && item.images[0]
            ? `
            <button class="btn btn-sm btn-light border text-primary" 
                    onclick="showImagePreview('${item.images[0]}')">
                <i class="bi bi-image"></i>
            </button>`
            : ""
        }
    </div>
</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick='openForm("city", ${JSON.stringify(
                  item
                )})'><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("cities", "${
                  item._id
                }")'><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `
    )
    .join("");
}

async function loadTours() {
  if (!document.getElementById("tours-grid")) return;
  try {
    const res = await fetch(`${API_BASE}/tours`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const grid = document.getElementById("tours-grid"); // Grid
    const tbody = document.getElementById("tbody-tours"); // Table Body

    // Fallback image constant
    const fallbackImage = "../../public/assets/Travia.png";

    grid.innerHTML = data
      .map((item) => {
        // Determine initial image URL
        const imgUrl = item.images?.[0] || fallbackImage;

        // --- B. POPULATE CARD --- //
        return `
        <div class="col-md-4 col-lg-4">
            <div class="card h-100 border-0 shadow-sm" style="border-radius: 16px; overflow: hidden;">
                <div style="height: 180px; position: relative; background-color: #f8f9fa;">
                    <img 
                        src="${imgUrl}" 
                        alt="${item.name}"
                        style="width: 100%; height: 100%; object-fit: cover;"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${fallbackImage}'"
                    >
                </div>
                
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0 text-truncate" title="${
                          item.name
                        }">${item.name}</h5>
                        <span class="badge bg-success bg-opacity-10 text-success">$${
                          item.price
                        }</span>
                    </div>
                    <p class="small text-muted mb-3">
                        <i class="bi bi-geo-alt-fill"></i> ${
                          item.cityId?.name || "Unknown"
                        }, ${item.countryId?.name || "Unknown"}
                    </p>
                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-light flex-grow-1" onclick='openForm("tour", ${JSON.stringify(
                          item
                        )})'>Edit Details</button>
                        <button class="btn btn-sm btn-light text-danger" onclick='deleteItem("tours", "${
                          item._id
                        }")'><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
      `;
      })
      .join("");

    // --- B. POPULATE TABLE --- //
    if (tbody) {
      tbody.innerHTML = data
        .map((item) => {
          const dateObj = new Date(item.updatedAt);
          const formattedDate = isNaN(dateObj.getTime())
            ? "N/A"
            : dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

          return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${
                          item.images?.[0] || fallbackImage
                        }" class="rounded me-2" width="40" height="40" style="object-fit: cover;" onerror="this.src='${fallbackImage}'">
                        <div class="text-truncate" style="max-width: 200px;" title="${
                          item.name
                        }">
                            <span class="fw-bold text-dark">${item.name}</span>
                        </div>
                    </div>
                </td>
                <td>${item.cityId?.name || "-"}, ${
            item.countryId?.name || "-"
          }</td>
                <td><span class="badge bg-light text-dark border">${
                  item.category || "General"
                }</span></td>
                <td><span class="fw-bold text-success">$${
                  item.price
                }</span></td>
                <td>${item.duration}</td>
                <td>${item.groupSize}</td>
                <td><i class="bi bi-star-fill text-warning small"></i> ${
                  item.stats?.rating || 0
                }</td>
                <td>${item.stats.reviewsCount}</td>
                <td>${item.stats.isTrending}</td>
                <td>
    <div class="d-flex align-items-center justify-content-between" style="max-width: 150px;">
        <span class="text-muted small me-2">${item.overview.substring(0, 10)}${
            item.overview.length > 10 ? "..." : ""
          }</span>
        ${
          item.overview.length > 10
            ? `
            <button class="btn btn-sm btn-light border text-primary" 
                    onclick="showReadMore('${encodeURIComponent(
                      item.overview
                    )}')">
                <i class="bi bi-eye-fill"></i>
            </button>`
            : ""
        }
    </div>
</td>
                <td>${item.category}</td>
                <td>${formattedDate}</td>
                <td>
                    ${
                      item.isFeatured
                        ? '<span class="badge bg-warning text-dark"><i class="bi bi-star-fill"></i> Featured</span>'
                        : '<span class="badge bg-success bg-opacity-10 text-success">Active</span>'
                    }
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick='openForm("tour", ${JSON.stringify(
                      item
                    )})'><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick='deleteItem("tours", "${
                      item._id
                    }")'><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        })
        .join("");
    }
  } catch (err) {
    console.error("Failed to load tours:", err);
  }
}
async function loadUsers() {
  if (!document.getElementById("table-users")) return;
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  document.querySelector("#table-users tbody").innerHTML = data
    .map(
      (user) => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="bg-light rounded-circle p-2"><i class="bi bi-person"></i></div>
                    <span class="fw-semibold">${user.username}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${
              user.isAdmin
                ? '<span class="badge bg-primary">Admin</span>'
                : '<span class="badge bg-secondary">User</span>'
            }</td>
            <td><span class="badge bg-success bg-opacity-10 text-success border border-success">Active</span></td>
        </tr>
    `
    )
    .join("");
}

// ==========================================
// MODAL & FORMS
// ==========================================

// Helper to open modal clean
window.openModal = (type) => openForm(type, {});

window.openForm = async (type, data) => {
  currentType = type;
  editingId = data._id || null;

  document.getElementById("modalTitle").innerText = editingId
    ? `Edit ${type.toUpperCase()}`
    : `Add New ${type.toUpperCase()}`;
  const body = document.getElementById("modalBody");
  body.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>'; // Loading state

  cmsModal.show();

  // Build Forms
  let formHtml = "";

  if (type === "country") {
    formHtml = `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Country Name</label>
                    <input id="f-name" class="form-control" value="${
                      data.name || ""
                    }" placeholder="e.g. France">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Continent</label>
                    <input id="f-continent" class="form-control" value="${
                      data.continent || ""
                    }" placeholder="e.g. Europe">
                </div>
                
                <div class="col-md-4">
                    <label class="form-label">ISO Code</label>
                    <input id="f-iso" class="form-control" value="${
                      data.isoCode || ""
                    }" maxlength="3" placeholder="FRA">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Market Yield Tier</label>
                    <select id="f-market" class="form-select">
                        <option value="Low" ${
                          data.marketYieldTier === "Low" ? "selected" : ""
                        }>Low</option>
                        <option value="Medium" ${
                          data.marketYieldTier === "Medium" ? "selected" : ""
                        }>Medium</option>
                        <option value="High" ${
                          data.marketYieldTier === "High" ? "selected" : ""
                        }>High</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Currency</label>
                    <input id="f-curr" class="form-control" value="${
                      data.currency || ""
                    }" placeholder="EUR">
                </div>
                
                <div class="col-md-6">
                    <label class="form-label">Visa Policy</label>
                    <select id="f-visa" class="form-select">
                        <option value="Schengen" ${
                          data.visaPolicy === "Schengen" ? "selected" : ""
                        }>Schengen</option>
                        <option value="Visa Free" ${
                          data.visaPolicy === "Visa Free" ? "selected" : ""
                        }>Visa Free</option>
                        <option value="Visa Required" ${
                          data.visaPolicy === "Visa Required" ? "selected" : ""
                        }>Visa Required</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Annual Visitors</label>
                    <input id="f-visitors" type="number" class="form-control" value="${
                      data.annualVisitors || ""
                    }" placeholder="0">
                </div>
                
                <div class="col-12">
                    <label class="form-label">Background Image URL</label>
                    <input id="f-img" class="form-control" value="${
                      data.backgroundImage || ""
                    }" placeholder="https://...">
                </div>
            </div>`;
  } else if (type === "city") {
    // 1. Fetch Data
    const res = await fetch(`${API_BASE}/countries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countries = await res.json();

    // 2. Prepare Data
    const options = countries
      .map(
        (c) =>
          `<option value="${c._id}" ${
            data.countryId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");
    const [lng, lat] = data.location?.coordinates || [0, 0];
    const imagesStr = data.images ? data.images.join("\n") : ""; // Format array for textarea
    const attractionsStr = data.topAttractions
      ? data.topAttractions.join("\n")
      : "";

    formHtml = `
      <ul class="nav nav-tabs mb-3" id="cityTabs" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-general">General</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-econ">Economics</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-content">Content & Media</button></li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="tab-general">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">City Name</label>
                    <input id="f-name" class="form-control" value="${
                      data.name || ""
                    }" placeholder="e.g. Tokyo">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Country</label>
                    <select id="f-country" class="form-select">${options}</select>
                </div>

                <div class="col-12"><label class="form-label small text-muted fw-bold mt-2">GEOLOCATION</label></div>
                <div class="col-md-6">
                    <label class="form-label">Longitude</label>
                    <input id="f-lng" type="number" step="any" class="form-control" value="${lng}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Latitude</label>
                    <input id="f-lat" type="number" step="any" class="form-control" value="${lat}">
                </div>

                <div class="col-12"><label class="form-label small text-muted fw-bold mt-2">METADATA</label></div>
                <div class="col-md-6">
                    <label class="form-label">Time Zone</label>
                    <input id="f-timezone" class="form-control" value="${
                      data.timeZone || ""
                    }" placeholder="e.g. Asia/Tokyo">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Popularity (0-100)</label>
                    <input id="f-pop" type="number" min="0" max="100" class="form-control" value="${
                      data.popularityIndex || 0
                    }">
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="tab-econ">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Daily Budget ($)</label>
                    <input id="f-budget" type="number" class="form-control" value="${
                      data.economics?.minDailyBudget || 0
                    }">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Currency Strength</label>
                    <select id="f-strength" class="form-select">
                        <option value="Weak" ${
                          data.economics?.currencyStrength === "Weak"
                            ? "selected"
                            : ""
                        }>Weak</option>
                        <option value="Stable" ${
                          data.economics?.currencyStrength === "Stable"
                            ? "selected"
                            : ""
                        }>Stable</option>
                        <option value="Strong" ${
                          data.economics?.currencyStrength === "Strong"
                            ? "selected"
                            : ""
                        }>Strong</option>
                    </select>
                </div>
                <div class="col-12"><hr class="text-muted"></div>
                <div class="col-md-4">
                    <label class="form-label small text-muted">Hotel Cost ($)</label>
                    <input id="f-accom" type="number" class="form-control" value="${
                      data.economics?.accommodationCost || 0
                    }">
                </div>
                <div class="col-md-4">
                    <label class="form-label small text-muted">Meal Index ($)</label>
                    <input id="f-meal" type="number" class="form-control" value="${
                      data.economics?.mealIndex || 0
                    }">
                </div>
                <div class="col-md-4">
                    <label class="form-label small text-muted">Transit Cost ($)</label>
                    <input id="f-transit" type="number" class="form-control" value="${
                      data.economics?.transitCost || 0
                    }">
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="tab-content">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-bold">Description</label>
                    <textarea id="f-desc" class="form-control" rows="4">${
                      data.description || ""
                    }</textarea>
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">Image URLs <span class="small text-muted">(One per line)</span></label>
                    <textarea id="f-images" class="form-control font-monospace small" rows="4">${imagesStr}</textarea>
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">Top Attractions <span class="small text-muted">(One per line)</span></label>
                    <textarea id="f-attractions" class="form-control" rows="3">${attractionsStr}</textarea>
                </div>
            </div>
        </div>
      </div>`;
  } else if (type === "tour") {
    // 1. Fetch Relations
    const [cRes, ciRes] = await Promise.all([
      fetch(`${API_BASE}/countries`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/cities`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const countries = await cRes.json();
    const cities = await ciRes.json();

    // 2. Data Preparation
    const countryOpts = countries
      .map(
        (c) =>
          `<option value="${c._id}" ${
            data.countryId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");
    // Note: City filtering logic runs at the end of openForm, so we just list them all here initially with data attributes
    const cityOpts = cities
      .map(
        (c) =>
          `<option value="${c._id}" data-country="${c.countryId?._id}" ${
            data.cityId?._id === c._id ? "selected" : ""
          }>${c.name}</option>`
      )
      .join("");

    const validCategories = [
      "Adventure",
      "Relaxation",
      "History",
      "Culture",
      "Food",
      "Nature",
    ];
    const categoryOpts = validCategories
      .map(
        (cat) =>
          `<option value="${cat}" ${
            data.category === cat ? "selected" : ""
          }>${cat}</option>`
      )
      .join("");

    // Formatting Arrays for Textareas
    const amenitiesStr = data.amenities ? data.amenities.join(", ") : "";
    const highlightsStr = data.highlights ? data.highlights.join("\n") : ""; // One per line
    const imagesStr = data.images ? data.images.join("\n") : ""; // One per line
    const itineraryJson = data.itinerary
      ? JSON.stringify(data.itinerary, null, 4)
      : '[\n  {\n    "day": 1,\n    "title": "Arrival",\n    "desc": "..."\n  }\n]';

    formHtml = `
      <ul class="nav nav-tabs mb-3" id="tourTabs" role="tablist">
        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-essentials">Essentials</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-content">Content & Media</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-itinerary">Itinerary</button></li>
        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-stats">Analytics</button></li>
      </ul>

      <div class="tab-content">
        
        <div class="tab-pane fade show active" id="tab-essentials">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-bold">Tour Name</label>
                    <input id="f-name" class="form-control" value="${
                      data.name || ""
                    }">
                </div>
                
                <div class="col-md-6">
                    <label class="form-label text-muted small">Country</label>
                    <select id="f-country" class="form-select">${countryOpts}</select>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-muted small">City</label>
                    <select id="f-city" class="form-select">${cityOpts}</select>
                </div>

                <div class="col-md-4">
                    <label class="form-label text-muted small">Category</label>
                    <select id="f-category" class="form-select">${categoryOpts}</select>
                </div>
                <div class="col-md-4">
                    <label class="form-label text-muted small">Duration</label>
                    <input id="f-dur" class="form-control" value="${
                      data.duration || ""
                    }" placeholder="e.g. 5 Days">
                </div>
                <div class="col-md-4">
                    <label class="form-label text-muted small">Group Size</label>
                    <input id="f-group" class="form-control" value="${
                      data.groupSize || ""
                    }" placeholder="e.g. Max 12">
                </div>

                <div class="col-md-6">
                    <label class="form-label fw-bold text-success">Regular Price ($)</label>
                    <input id="f-price" type="number" class="form-control" value="${
                      data.price || 0
                    }">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold text-danger">Discount Price ($)</label>
                    <input id="f-discount" type="number" class="form-control" value="${
                      data.discountPrice || ""
                    }" placeholder="Optional">
                </div>

                <div class="col-12 d-flex gap-4 mt-3 p-3 bg-light rounded">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="f-featured" ${
                          data.isFeatured ? "checked" : ""
                        }>
                        <label class="form-check-label fw-bold" for="f-featured">⭐ Featured Tour</label>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="f-trending" ${
                          data.stats?.isTrending ? "checked" : ""
                        }>
                        <label class="form-check-label fw-bold" for="f-trending">🔥 Trending</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="tab-content">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label fw-bold">Overview Description</label>
                    <textarea id="f-overview" class="form-control" rows="4">${
                      data.overview || ""
                    }</textarea>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label fw-bold">Highlights <span class="text-muted small">(One per line)</span></label>
                    <textarea id="f-highlights" class="form-control" rows="5" placeholder="Skip the line ticket\nSunset Cruise included">${highlightsStr}</textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Amenities <span class="text-muted small">(Comma separated)</span></label>
                    <textarea id="f-amenities" class="form-control" rows="5">${amenitiesStr}</textarea>
                </div>

                <div class="col-12">
                    <label class="form-label fw-bold">Image URLs <span class="text-muted small">(One URL per line)</span></label>
                    <textarea id="f-images" class="form-control font-monospace small" rows="3">${imagesStr}</textarea>
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="tab-itinerary">
            <label class="form-label fw-bold">Daily Itinerary JSON</label>
            <textarea id="f-itinerary" class="form-control font-monospace" rows="12" style="font-size: 0.85rem; background:#f8f9fa;">${itineraryJson}</textarea>
            <div class="form-text text-muted">Ensure strict JSON format: [{"day": 1, "title": "...", "desc": "..."}]</div>
        </div>

        <div class="tab-pane fade" id="tab-stats">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Overall Rating (0-5)</label>
                    <input id="f-rating" type="number" step="0.1" class="form-control" value="${
                      data.stats?.rating || 0
                    }">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Total Reviews</label>
                    <input id="f-reviews" type="number" class="form-control" value="${
                      data.stats?.reviewsCount || 0
                    }">
                </div>
                <div class="col-12"><hr></div>
                <div class="col-md-4">
                    <label class="form-label text-muted small">Verified Score</label>
                    <input id="f-verified" type="number" step="0.1" class="form-control" value="${
                      data.stats?.breakdown?.verified || 0
                    }">
                </div>
                <div class="col-md-4">
                    <label class="form-label text-muted small">Volume Score</label>
                    <input id="f-volume" type="number" step="0.1" class="form-control" value="${
                      data.stats?.breakdown?.volume || 0
                    }">
                </div>
                <div class="col-md-4">
                    <label class="form-label text-muted small">AI Sentiment Score</label>
                    <input id="f-nlp" type="number" step="0.1" class="form-control" value="${
                      data.stats?.breakdown?.nlpSentiment || 0
                    }">
                </div>
            </div>
        </div>

      </div>`;
  }

  body.innerHTML = formHtml;

  if (type === "tour") {
    const countrySelect = document.getElementById("f-country");
    const citySelect = document.getElementById("f-city");

    // Safety check just in case
    if (countrySelect && citySelect) {
      const allCityOptions = Array.from(citySelect.options); // Save original list

      function filterCities() {
        const selectedCountryId = countrySelect.value;
        citySelect.innerHTML = "";

        let hasValidSelection = false;
        allCityOptions.forEach((opt) => {
          // Show only cities matching country
          if (opt.dataset.country === selectedCountryId) {
            citySelect.appendChild(opt);
            if (opt.value === data.cityId?._id) hasValidSelection = true;
          }
        });

        // Default select first available option
        if (!hasValidSelection && citySelect.options.length > 0) {
          citySelect.value = citySelect.options[0].value;
        }
      }

      countrySelect.addEventListener("change", filterCities);
      filterCities(); // Run immediately
    }
  }

  // Set selects if needed
  if (type === "country" && data.visaPolicy)
    document.getElementById("f-visa").value = data.visaPolicy;
};

// ==========================================
// SAVE & DELETE
// ==========================================
async function handleSave() {
  const btn = document.getElementById("btn-save-cms");
  const originalText = btn.innerText;
  btn.innerText = "Saving...";
  btn.disabled = true;

  const payload = {};

  try {
    if (currentType === "country") {
      const continent = document.getElementById("f-continent").value;
      if (!VALID_CONTINENTS.includes(continent)) {
        alert(
          `Error: '${continent}' is not a valid continent. Please select from the list.`
        );
        btn.innerText = "Save Changes";
        btn.disabled = false;
        return; // Stop saving
      }

      payload.name = document.getElementById("f-name").value;
      payload.continent = document.getElementById("f-continent").value;
      payload.isoCode = document.getElementById("f-iso").value;
      payload.currency = document.getElementById("f-curr").value;
      payload.visaPolicy = document.getElementById("f-visa").value;
      payload.marketYieldTier = document.getElementById("f-market").value;
      payload.annualVisitors = document.getElementById("f-visitors").value;
      payload.backgroundImage = document.getElementById("f-img").value;
    } else if (currentType === "city") {
      payload.name = document.getElementById("f-name").value;
      payload.countryId = document.getElementById("f-country").value;

      payload.location = {
        type: "Point",
        coordinates: [
          parseFloat(document.getElementById("f-lng").value) || 0,
          parseFloat(document.getElementById("f-lat").value) || 0,
        ],
      };

      payload.economics = {
        minDailyBudget: Number(document.getElementById("f-budget").value),
        accommodationCost: Number(document.getElementById("f-accom").value),
        mealIndex: Number(document.getElementById("f-meal").value),
        transitCost: Number(document.getElementById("f-transit").value),
        currencyStrength: document.getElementById("f-strength").value,
      };

      payload.timeZone = document.getElementById("f-timezone").value;
      payload.popularityIndex = Number(document.getElementById("f-pop").value);

      // 4. Content & Media
      payload.description = document.getElementById("f-desc").value;
      
      // Convert Textarea (Lines) -> Array
      payload.images = document.getElementById("f-images").value
        .split("\n").map(url => url.trim()).filter(url => url.length > 0);

      // Top Attractions
      payload.topAttractions = document.getElementById("f-attractions").value
        .split("\n").map(item => item.trim()).filter(item => item.length > 0);


    } else if (currentType === "tour") {
      // 1. Validation: Country/City Relationship
      const selectedCountryId = document.getElementById("f-country").value;
      const citySelect = document.getElementById("f-city");
      const selectedCityOption = citySelect.options[citySelect.selectedIndex];

      if (!selectedCityOption) {
        alert("Error: Please select a valid city.");
        btn.innerText = "Save Changes";
        btn.disabled = false;
        return;
      }
      if (selectedCityOption.dataset.country !== selectedCountryId) {
        alert("Security Error: City does not belong to the selected Country.");
        btn.innerText = "Save Changes";
        btn.disabled = false;
        return;
      }

      // 2. Gather Data
      payload.name = document.getElementById("f-name").value;
      payload.countryId = selectedCountryId;
      payload.cityId = document.getElementById("f-city").value;
      payload.category = document.getElementById("f-category").value;

      payload.price = Number(document.getElementById("f-price").value);
      const discountVal = document.getElementById("f-discount").value;
      if (discountVal) payload.discountPrice = Number(discountVal);

      payload.duration = document.getElementById("f-dur").value;
      payload.groupSize = document.getElementById("f-group").value;
      payload.isFeatured = document.getElementById("f-featured").checked;

      // 3. Process Content Lists
      // Split images by newline
      payload.images = document
        .getElementById("f-images")
        .value.split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Split highlights by newline (NEW)
      payload.highlights = document
        .getElementById("f-highlights")
        .value.split("\n")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      // Split amenities by comma
      payload.amenities = document
        .getElementById("f-amenities")
        .value.split(",")
        .map((item) => item.trim())
        .filter((i) => i.length > 0);

      payload.overview = document.getElementById("f-overview").value;

      // 4. Stats
      payload.stats = {
        rating: Number(document.getElementById("f-rating").value),
        reviewsCount: Number(document.getElementById("f-reviews").value),
        isTrending: document.getElementById("f-trending").checked,
        breakdown: {
          verified: Number(document.getElementById("f-verified").value),
          volume: Number(document.getElementById("f-volume").value),
          nlpSentiment: Number(document.getElementById("f-nlp").value),
        },
      };

      // 5. Itinerary JSON Parsing
      try {
        payload.itinerary = JSON.parse(
          document.getElementById("f-itinerary").value
        );
      } catch (e) {
        alert("Invalid JSON in Itinerary field. Please check format.");
        btn.innerText = "Save Changes";
        btn.disabled = false;
        return;
      }
    }

    const endpoint =
      currentType === "country"
        ? "countries"
        : currentType === "city"
        ? "cities"
        : "tours";
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE}/${endpoint}/${editingId}`
      : `${API_BASE}/${endpoint}`;

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      cmsModal.hide();
      showToast("Success", "Record saved successfully");
      // Refresh
      if (currentType === "country") loadCountries();
      if (currentType === "city") loadCities();
      if (currentType === "tour") loadTours();
      loadDashboardStats();
    } else {
      showToast("Error", "Failed to save data");
    }
  } catch (e) {
    showToast("Error", "System error occurred");
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

window.deleteItem = async (endpoint, id) => {
  if (
    !confirm(
      "Are you sure you want to delete this item? This cannot be undone."
    )
  )
    return;

  try {
    await fetch(`${API_BASE}/${endpoint}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast("Deleted", "Item removed successfully");

    // Refresh Current View
    window.location.reload();
  } catch (e) {
    showToast("Error", "Could not delete item");
  }
};

function showToast(title, msg) {
  document.getElementById("toast-msg").innerText = `${title}: ${msg}`;
  const toast = new bootstrap.Toast(document.getElementById("liveToast"));
  toast.show();
}

// 1. View Toggler Logic
window.toggleTourView = (view) => {
  const grid = document.getElementById("tours-grid");
  const table = document.getElementById("tours-table-view");
  const btnGrid = document.getElementById("btn-view-grid");
  const btnTable = document.getElementById("btn-view-table");

  if (view === "grid") {
    grid.classList.remove("d-none");
    table.classList.add("d-none");
    btnGrid.classList.add("active");
    btnTable.classList.remove("active");
  } else {
    grid.classList.add("d-none");
    table.classList.remove("d-none");
    btnGrid.classList.remove("active");
    btnTable.classList.add("active");
  }
};

// View Full Description
window.showReadMore = (encodedText) => {
  document.getElementById("descModalBody").innerText =
    decodeURIComponent(encodedText);
  new bootstrap.Modal(document.getElementById("descModal")).show();
};

// Show Image Preview
window.showImagePreview = (url) => {
  const modalBody = document.getElementById("descModalBody");
  // Inject Image + The Link below it
  modalBody.innerHTML = `
        <img src="${url}" class="img-fluid rounded mb-3 w-100" style="object-fit: cover; max-height: 300px;" onerror="this.src='../../public/assets/Travia.png'">
        <div class="p-2 bg-light rounded text-break border small text-muted font-monospace">${url}</div>
    `;
  new bootstrap.Modal(document.getElementById("descModal")).show();
};
