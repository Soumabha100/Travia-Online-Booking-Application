/**
 * TOURS.JS - Optimized Client-Side Controller
 * Features: Server-Side Pagination ("Load More"), Server-Side Search,
 * Client-Side Filtering (on loaded items), and Highlight Logic.
 */

document.addEventListener("DOMContentLoaded", () => {
  initToursPage();
});

// === 1. STATE MANAGEMENT ===
const STATE = {
  tours: [], // Currently loaded tours (Accumulates as you load more)
  displayedTours: [], // Tours currently visible (After client-side filters)
  currentPage: 1, // Current Pagination Page
  isLoading: false, // Prevent duplicate requests
  hasMore: true, // Are there more pages on the server?
  searchQuery: "", // Search text (Sent to Server)

  // Client-Side Filters (Applied to the data we have loaded)
  filters: {
    budget: [],
    rating: [],
    category: [],
  },
  sortBy: "recommended",
};

// === 2. INITIALIZATION ===
async function initToursPage() {
  if (!window.TraviaAPI) {
    console.error("API Config missing");
    return;
  }

  // A. Parse URL for Search/ID
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search") || urlParams.get("id");

  // B. Handle Initial Load
  if (searchParam) {
    // CASE 1: Specific Tour ID (Highlight Logic)
    if (searchParam.match(/^[0-9a-fA-F]{24}$/)) {
      // We fetch the default list, but we prioritize the highlighting
      // In a real large app, you'd fetch /tours/${id} separately.
      // Here we load the list and check if we need to fetch the specific one.
      await fetchTours(1);
    }
    // CASE 2: Text Search (Deep Link)
    else {
      STATE.searchQuery = searchParam;
      document.getElementById("header-search-input").value = searchParam;
      await fetchTours(1);
    }
  } else {
    // Default Load
    await fetchTours(1);
  }

  setupEventListeners();
}

// === 3. DATA FETCHING (The New Engine) ===
async function fetchTours(page) {
  if (STATE.isLoading) return;
  STATE.isLoading = true;

  const listContainer = document.getElementById("tours-list-view"); // Existing Container
  const gridContainer = document.getElementById("tours-grid-view");
  const loadMoreContainer = document.getElementById("pagination-container");

  const spinnerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-travia-teal"></div></div>';

  // UI Loading States
  if (page === 1) {
    if (listContainer) listContainer.innerHTML = spinnerHTML;
    if (gridContainer) gridContainer.innerHTML = spinnerHTML;
  }
  if (page > 1 && loadMoreContainer)
    loadMoreContainer.innerHTML =
      '<div class="text-center py-3"><span class="spinner-border spinner-border-sm"></span> Loading...</div>';

  try {
    // Build Server URL
    let url = `${window.TraviaAPI.destinations}/tours?page=${page}&limit=10`;
    if (STATE.searchQuery) {
      url += `&search=${encodeURIComponent(STATE.searchQuery)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load data");
    const json = await res.json();

    // Handle Response (Expects { data: [], meta: { total: X } })
    // Fallback for simple array if backend structure varies slightly
    const newData = Array.isArray(json) ? json : json.data || [];
    const total = json.meta ? json.meta.total : 9999; // Default high if meta missing

    if (page === 1) {
      STATE.tours = newData;
    } else {
      STATE.tours = [...STATE.tours, ...newData];
    }

    // Update State
    STATE.currentPage = page;
    STATE.hasMore = STATE.tours.length < total;

    // Apply Client-Side Logic (Filters/Sort) & Render
    applyFilters();
  } catch (err) {
    console.error(err);
    const errorHTML =
      '<div class="text-center text-danger py-5">Failed to load tours.</div>';
    if (page === 1) {
      if (listContainer) listContainer.innerHTML = errorHTML;
      if (gridContainer) gridContainer.innerHTML = errorHTML;
    }
  } finally {
    STATE.isLoading = false;
    renderPaginationUI(); // Update button state
  }
}

// === 4. FILTERING & SORTING (Kept Client-Side Logic for Loaded Items) ===
function applyFilters() {
  let result = [...STATE.tours]; // Copy current loaded list

  // Note: Search Query is handled by Server now, so we skip text filtering here
  // unless you want to double-filter.

  // 1. Budget Filter
  if (STATE.filters.budget.length > 0) {
    result = result.filter((tour) => {
      const price = tour.discountPrice || tour.price;
      if (STATE.filters.budget.includes("low") && price < 500) return true;
      if (STATE.filters.budget.includes("mid") && price >= 500 && price <= 1000)
        return true;
      if (STATE.filters.budget.includes("high") && price > 1000) return true;
      return false;
    });
  }

  // 2. Rating Filter
  if (STATE.filters.rating.length > 0) {
    result = result.filter((tour) => {
      const rating = tour.stats?.rating || 0;
      return STATE.filters.rating.some(
        (threshold) => rating >= parseInt(threshold)
      );
    });
  }

  // 3. Category Filter
  if (STATE.filters.category.length > 0) {
    result = result.filter((tour) =>
      STATE.filters.category.includes(tour.category)
    );
  }

  // 4. Sort
  sortData(result);

  // 5. Highlight Logic (Moved here to persist across filters)
  const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get("id");
  if (highlightId && highlightId.match(/^[0-9a-fA-F]{24}$/)) {
    const targetIndex = result.findIndex((t) => t._id === highlightId);
    if (targetIndex > -1) {
      const target = result.splice(targetIndex, 1)[0];
      target.isSelected = true; // Mark for rendering
      result.unshift(target); // Move to top
    }
  }

  STATE.displayedTours = result;
  renderTours();
  updateMapWidget();
}

function sortData(data) {
  switch (STATE.sortBy) {
    case "price-asc":
      data.sort(
        (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
      );
      break;
    case "price-desc":
      data.sort(
        (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
      );
      break;
    case "rating":
      data.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
      break;
    default:
      // Default sort (usually server order, but we can enforce popularity)
      // data.sort((a, b) => (b.popularityIndex || 0) - (a.popularityIndex || 0));
      break;
  }
}

// === 5. RENDERING (The View - Unchanged & Optimized) ===
function renderTours() {
  const listContainer = document.getElementById("tours-list-view"); // Existing Container
  const gridContainer = document.getElementById("tours-grid-view"); // New Grid Container
  const countLabel = document.getElementById("results-count");

  // 1. Update Result Count
  if (countLabel)
    countLabel.innerText = `${STATE.displayedTours.length} Tours Shown`;

  // 2. Handle "No Results" Case (Inject message into BOTH containers)
  if (STATE.displayedTours.length === 0) {
    const noResultHTML = `
            <div class="col-12 text-center py-5 border rounded bg-light">
                <h5 class="text-muted">No tours match your filters.</h5>
                <button class="btn btn-link" onclick="window.resetFilters()">Clear Filters</button>
            </div>
        `;
    if (listContainer) listContainer.innerHTML = noResultHTML;
    if (gridContainer) gridContainer.innerHTML = noResultHTML;
    return;
  }

  // 3. RENDER LIST VIEW (Your Existing Detailed Logic)
  if (listContainer) {
    listContainer.innerHTML = STATE.displayedTours
      .map((tour) => {
        // --- LOGIC HELPERS (Shared) ---
        const price = tour.discountPrice || tour.price;
        const oldPriceHtml = tour.discountPrice
          ? `<span class="text-muted text-decoration-line-through small me-1">$${tour.price}</span>`
          : "";
        const rating = tour.stats?.rating || 0;
        const ratingText = getRatingLabel(rating);
        const image =
          tour.images && tour.images.length
            ? tour.images[0]
            : "../public/images/Travia.png";

        // List-Specific Highlights
        const highlightsHtml = (tour.highlights || [])
          .slice(0, 3)
          .map(
            (h) =>
              `<div class="text-dark mb-1"><i class="bi bi-check2 text-success me-1"></i>${h}</div>`
          )
          .join("");

        // Badges
        let badgesHtml = "";
        if (tour.isFeatured)
          badgesHtml += `<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 shadow-sm px-2 py-1"><i class="bi bi-star-fill small me-1"></i>Featured</span>`;
        else if (tour.discountPrice)
          badgesHtml += `<span class="badge bg-danger position-absolute top-0 start-0 m-3 shadow-sm px-2 py-1">Deal</span>`;

        // Highlight Border
        const borderClass = tour.isSelected
          ? "border-primary border-2"
          : "border-0";

        // --- HTML TEMPLATE (LIST) ---
        return `
            <div class="card tour-card ${borderClass} shadow-sm overflow-hidden rounded-3 mb-4">
                <div class="row g-0">
                    <div class="col-md-4 position-relative">
                        <img src="${image}" class="img-fluid h-100 w-100 object-fit-cover tour-card-img" alt="${
          tour.name
        }">
                        ${badgesHtml}
                        <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm icon-btn"><i class="bi bi-heart"></i></button>
                    </div>
                    <div class="col-md-5 p-3 p-md-4 d-flex flex-column border-end-md">
                        <div class="mb-auto">
                            <h5 class="card-title fw-bold text-travia-navy mb-1 hover-underline fs-4">
                                <a href="tour-details.html?id=${
                                  tour._id
                                }" class="text-decoration-none text-travia-navy">${
          tour.name
        }</a>
                            </h5>
                            <p class="small text-muted mb-2"><i class="bi bi-geo-alt-fill text-travia-teal me-1"></i>${
                              tour.cityId?.name || ""
                            }, ${tour.countryId?.name || ""}</p>
                            
                            <div class="tour-features small mt-3 font-lato border-start border-3 border-success ps-3">
                                <div class="fw-bold text-dark mb-1">Highlights:</div>
                                <div class="text-dark mb-1"><i class="bi bi-clock text-success me-1"></i><b>${
                                  tour.duration
                                }</b></div>
                                ${highlightsHtml}
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-top">
                            <span class="badge bg-light text-secondary border fw-normal me-1">${
                              tour.category || "General"
                            }</span>
                        </div>
                    </div>
                    <div class="col-md-3 p-3 p-md-4 bg-light bg-opacity-25 d-flex flex-column justify-content-between align-items-end text-end">
                        <div class="mb-3">
                            <div class="d-flex align-items-center justify-content-end mb-1">
                                <div class="me-2">
                                    <div class="fw-bold text-travia-navy fs-6">${ratingText}</div>
                                    <div class="small text-muted">${
                                      tour.stats?.reviewsCount || 0
                                    } reviews</div>
                                </div>
                                <div class="rating-badge">${rating}</div>
                            </div>
                        </div>
                        <div>
                            <div class="d-flex flex-column align-items-end">
                                <div class="mb-0">${oldPriceHtml} <h3 class="fw-bold mb-0 price-display d-inline">$${price}</h3></div>
                                <small class="text-muted d-block mb-3">Includes taxes & fees</small>
                            </div>
                            <a href="tour-details.html?id=${
                              tour._id
                            }" class="btn btn-travia-primary w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2">
                                See Availability <i class="bi bi-chevron-right small"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            `;
      })
      .join("");
  }

  // 4. RENDER GRID VIEW (New Logic)
  if (gridContainer) {
    gridContainer.innerHTML = STATE.displayedTours
      .map((tour) => {
        // --- LOGIC HELPERS ---
        const price = tour.discountPrice || tour.price;
        const rating = tour.stats?.rating || 0;
        const reviews = tour.stats?.reviewsCount || 0;
        const image =
          tour.images && tour.images.length
            ? tour.images[0]
            : "../public/images/Travia.png";

        // 1. Generate Star Icons based on rating (e.g. 4.5 -> 5 stars visual)
        // Using a simple Math.round to determine star count (max 5)
        const starCount = Math.min(5, Math.max(1, Math.round(rating)));
        const starsHtml = Array(starCount)
          .fill('<i class="bi bi-star-fill text-warning"></i>')
          .join("");

        // 2. Highlights (Take top 3 for grid)
        const featuresHtml = (tour.highlights || [])
          .slice(0, 3)
          .map(
            (h) =>
              `<div class="grid-feature-item"><i class="bi bi-check2 text-success"></i> ${h}</div>`
          )
          .join("");

        // 3. Badges
        let badgeOverlay = "";
        if (tour.isFeatured)
          badgeOverlay =
            '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2 shadow-sm border border-light">Featured</span>';
        else if (tour.discountPrice)
          badgeOverlay =
            '<span class="badge bg-danger position-absolute top-0 start-0 m-2 shadow-sm">Limited Deal</span>';

        // --- HTML TEMPLATE ---
        return `
            <div class="col-md-6 col-lg-4 d-flex align-items-stretch">
                <div class="tour-card-grid w-100 position-relative">
                    
                    <div class="card-img-wrapper">
                        <img src="${image}" class="card-img-top" alt="${
          tour.name
        }">
                        ${badgeOverlay}
                        <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm icon-btn">
                            <i class="bi bi-heart"></i>
                        </button>
                    </div>

                    <div class="card-body">
                        
                        <div>
                            <div class="star-rating-row mb-1">
                                ${starsHtml} <span class="text-muted small ms-1">Top Rated</span>
                            </div>
                            <h6 class="tour-name-grid" title="${tour.name}">
                                <a href="tour-details.html?id=${
                                  tour._id
                                }" class="text-decoration-none text-travia-navy stretched-link">
                                    ${tour.name}
                                </a>
                            </h6>
                            <p class="small text-muted mb-0">
                                <i class="bi bi-geo-alt-fill text-travia-teal"></i> ${
                                  tour.cityId?.name || "Unknown"
                                }, ${tour.countryId?.name || ""}
                            </p>
                        </div>

                        <div class="grid-features">
                            ${featuresHtml}
                            <div class="grid-feature-item text-success fw-bold">
                                <i class="bi bi-check-circle-fill"></i> Free Cancellation
                            </div>
                        </div>

                        <div class="grid-footer">
                            
                            <div class="rating-block-compact">
                                <div class="rating-score-box">${rating}</div>
                                <div style="line-height: 1.1;">
                                    <div class="fw-bold text-travia-navy" style="font-size: 0.8rem;">${getRatingLabel(
                                      rating
                                    )}</div>
                                    <div class="text-muted" style="font-size: 0.7rem;">${reviews} reviews</div>
                                </div>
                            </div>

                            <div class="price-section-grid position-relative" style="z-index: 2;"> ${
                              tour.discountPrice
                                ? `<div class="old-price">$${tour.price}</div>`
                                : ""
                            }
                                <div class="current-price">$${price}</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Includes taxes</div>
                                <a href="tour-details.html?id=${
                                  tour._id
                                }" class="btn btn-travia-primary btn-sm rounded-pill fw-bold mt-1 px-3 w-100 d-block">
                                    View
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            `;
      })
      .join("");
  }
}

function renderPaginationUI() {
  const container = document.getElementById("pagination-container");
  if (!container) return;

  if (!STATE.hasMore) {
    container.innerHTML =
      '<p class="text-center text-muted small mt-4">You have reached the end of the list.</p>';
    return;
  }

  container.innerHTML = `
        <button id="btn-load-more" class="btn btn-outline-primary rounded-pill px-5 py-2 fw-bold">
            Load More Results
        </button>
    `;

  document.getElementById("btn-load-more").addEventListener("click", () => {
    fetchTours(STATE.currentPage + 1);
  });
}

// === 6. EVENT LISTENERS (Optimized) ===
function setupEventListeners() {
  // A. Sticky Search Input (Server-Side Debounce)
  const searchInput = document.getElementById("header-search-input");
  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        STATE.searchQuery = e.target.value.trim();
        fetchTours(1); // Reset to Page 1
      }, 500);
    });
  }

  // B. Checkboxes (Client-Side filtering of loaded data)
  const filterContainer = document.getElementById("filter-sidebar");
  if (filterContainer) {
    filterContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("filter-checkbox")) {
        const type = e.target.dataset.type;
        const value = e.target.value;
        if (e.target.checked) STATE.filters[type].push(value);
        else
          STATE.filters[type] = STATE.filters[type].filter(
            (item) => item !== value
          );
        applyFilters();
      }
    });
  }

  // C. Sort Dropdown
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      STATE.sortBy = e.target.value;
      applyFilters(); // Re-sort loaded data
    });
  }

  // --- D. View Toggles (List vs Grid) ---
  const btnList = document.getElementById("btn-view-list");
  const btnGrid = document.getElementById("btn-view-grid");

  if (btnList && btnGrid) {
    btnList.addEventListener("click", () => {
      toggleTourView("list");
    });

    btnGrid.addEventListener("click", () => {
      toggleTourView("grid");
    });
  }
}

// === 7. MAP WIDGET LOGIC (Database-First Validation) ===
function updateMapWidget() {
  const btnMap = document.getElementById("btn-show-map");
  const lblMap = document.getElementById("lbl-show-map");
  const bgMap = document.getElementById("map-widget-bg");

  if (!btnMap || !lblMap) return;

  // --- 1. STRICT VALIDATION: DOES DATA EXIST? ---
  // This is the critical fix. If the DB returns nothing (e.g., "Yemen"),
  // we strictly disable the map. We do NOT trust the search query alone.
  if (!STATE.displayedTours || STATE.displayedTours.length === 0) {
    disableMapWidget(btnMap, lblMap, bgMap, "Location not found");
    return;
  }

  // --- 2. INTELLIGENT LOCATION SELECTION ---
  // Now we know valid tours exist. We assume the first tour in the filtered list
  // is the best "representative" of what the user wants to see.
  const topTour = STATE.displayedTours[0];

  // We construct the location from the DB data, ensuring it's always a real place.
  // e.g., Even if user types "Ind", this becomes "New Delhi, India"
  const validLocation = `${topTour.cityId?.name || ""}, ${
    topTour.countryId?.name || ""
  }`;

  let displayLabel = "Show on map";

  // --- 3. CONTEXT AWARE LABELING ---
  // We customize the button text to reassure the user we found what they wanted.

  if (STATE.searchQuery && STATE.searchQuery.trim() !== "") {
    // Case A: User Search (Smart Match)
    // We check if their search term matches the Country or City of the result
    const q = STATE.searchQuery.toLowerCase();
    const country = (topTour.countryId?.name || "").toLowerCase();
    const city = (topTour.cityId?.name || "").toLowerCase();

    if (country.includes(q)) {
      displayLabel = `Show ${topTour.countryId.name} on map`; // Search: "Ind" -> Label: "Show India..."
    } else if (city.includes(q)) {
      displayLabel = `Show ${topTour.cityId.name} on map`; // Search: "Berl" -> Label: "Show Berlin..."
    } else {
      displayLabel = `Show location on map`;
    }
  } else if (topTour.isSelected) {
    // Case B: Specific Tour Highlighted
    displayLabel = `Show ${topTour.cityId?.name || "Location"} on map`;
  }

  // --- 4. ACTIVATE WIDGET ---
  enableMapWidget(btnMap, lblMap, bgMap, displayLabel, validLocation);
}

// --- HELPER: ENABLE STATE ---
function enableMapWidget(btn, lbl, bg, text, location) {
  btn.disabled = false;
  // Reset classes to ensure active style (Keeping your White/Navy style preference)
  btn.classList.remove("btn-secondary", "opacity-50");
  btn.classList.add("btn-travia-primary");

  lbl.innerText = text;
  if (bg) bg.style.opacity = "1";

  // Standard Google Maps Search Link (Most robust format)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;

  // Reset Listeners (Clone trick)
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener("click", () => {
    window.open(mapUrl, "_blank");
  });
}

// --- HELPER: DISABLE STATE ---
function disableMapWidget(btn, lbl, bg, errorText) {
  btn.disabled = true;
  btn.classList.remove("btn-travia-primary");
  btn.classList.add("btn-secondary", "opacity-50"); // Add opacity to look disabled

  lbl.innerText = errorText;
  if (bg) bg.style.opacity = "0.4"; // Dim the background image significantly
}

// Helpers
window.resetFilters = () => {
  STATE.filters = { budget: [], rating: [], category: [] };
  STATE.searchQuery = "";
  document.getElementById("header-search-input").value = "";
  document
    .querySelectorAll(".filter-checkbox")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("sort-select").value = "recommended";
  fetchTours(1); // Reload from server
};

function getRatingLabel(rating) {
  if (rating >= 9.0) return "Superb";
  if (rating >= 8.0) return "Very Good";
  if (rating >= 7.0) return "Good";
  return "Pleasant";
}

// === VIEW TOGGLER ===
window.toggleTourView = (view) => {
  const listView = document.getElementById("tours-list-view");
  const gridView = document.getElementById("tours-grid-view");
  const btnList = document.getElementById("btn-view-list");
  const btnGrid = document.getElementById("btn-view-grid");

  if (view === "grid") {
    listView.classList.add("d-none");
    gridView.classList.remove("d-none");
    btnList.classList.remove("active");
    btnGrid.classList.add("active");
  } else {
    listView.classList.remove("d-none");
    gridView.classList.add("d-none");
    btnList.classList.add("active");
    btnGrid.classList.remove("active");
  }
};
