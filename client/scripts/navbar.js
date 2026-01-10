document.addEventListener("DOMContentLoaded", () => {
  const isPagesFolder = window.location.pathname.includes("/pages/");
  const rootPath = isPagesFolder ? "../" : "./";

  injectNavbar(rootPath);
  injectFooter(rootPath);

  highlightActiveLink();
  initSearch(rootPath);
});

function injectNavbar(rootPath) {
  // 1. Get User Data
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 2. Auth Section
  let authSectionHTML = "";
  if (token && user) {
    authSectionHTML = `
    <a href="${rootPath}pages/profile.html" class="travia-profile-pill ms-3">
        <img 
          src="${
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }" 
          alt="Profile" 
        />
        <span>${user.username}</span>
    </a>`;
  } else {
    authSectionHTML = `
        <button type="button" class="btn btn-travia ms-3" data-bs-toggle="modal" data-bs-target="#authModal">Login</button>
    `;
  }

  // 3. Navbar HTML (Structure Preserved, Classes Updated)
  const navbarHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark sticky-top travia-navbar" style="background-color: #002a3d;">
        <div class="container">
          <a class="navbar-brand fw-bold" href="${rootPath}index.html">
            <img class="travia" src="${rootPath}public/assets/Travia.png" alt="Travia" />
          </a>
  
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#traviaNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse" id="traviaNavbar">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
              <li class="nav-item"><a class="nav-link" href="${rootPath}index.html">Home</a></li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Destinations</a>
                <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="${rootPath}pages/destinations.html">Popular Destinations</a></li>
                  <li><a class="dropdown-item" href="${rootPath}pages/countries.html">All Countries</a></li>
                  <li><a class="dropdown-item" href="${rootPath}pages/cities.html">All Cities</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="${rootPath}pages/tours.html">Popular Tours</a></li>
                </ul>
              </li>
              <li class="nav-item"><a class="nav-link" href="${rootPath}pages/tours.html">Tours</a></li>
              <li class="nav-item"><a class="nav-link" href="#">Experience</a></li>
              <li class="nav-item"><a class="nav-link" href="#">About</a></li>
            </ul>
  
            <div class="d-flex align-items-center gap-2">
              <form class="search-box position-relative" role="search" autocomplete="off">
                <input class="form-control" id="search-input" type="search" placeholder="Search places, cities, tours..." aria-label="Search" />
                <button type="submit"><img src="${rootPath}public/assets/Search.svg" alt="Search" /></button>
                <div id="search-results" class="search-results-box"></div>
              </form>
              
              ${authSectionHTML}
            </div>
          </div>
        </div>
      </nav>
    `;

  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) navbarContainer.innerHTML = navbarHTML;
}

function injectFooter(rootPath) {
  // ... (Keep your existing footer code exactly as is) ...
  const footerHTML = `
    <footer class="travia-footer text-light">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <a class="navbar-brand fw-bold mb-3 d-block" href="${rootPath}pages/index.html">
              <img class="travia" src="${rootPath}public/assets/Travia.png" alt="Travia Logo" style="height: 50px" />
            </a>
            <p class="footer-text">
              Discover breathtaking destinations and create unforgettable memories. 
              We bring the world to your fingertips with curated tours.
            </p>
            <div class="footer-socials">
              <a href="#"><i class="bi bi-facebook"></i></a>
              <a href="#"><i class="bi bi-instagram"></i></a>
              <a href="#"><i class="bi bi-twitter-x"></i></a>
              <a href="#"><i class="bi bi-youtube"></i></a>
            </div>
          </div>

          <div class="col-lg-2 col-md-6">
            <h6 class="footer-title">Quick Links</h6>
            <ul class="footer-links">
              <li><a href="${rootPath}pages/index.html">Home</a></li>
              <li><a href="${rootPath}pages/destinations.html">Destinations</a></li>
              <li><a href="#">Packages</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="footer-title">Contact Us</h6>
            <ul class="footer-contact-list">
              <li><i class="bi bi-geo-alt-fill"></i> <span>123 Travel Road, Wanderlust City</span></li>
              <li><i class="bi bi-envelope-fill"></i> <span>support@travia.com</span></li>
              <li><i class="bi bi-telephone-fill"></i> <span>+91 98765 43210</span></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h6 class="footer-title">Newsletter</h6>
            <form class="footer-newsletter">
              <div class="input-group">
                <input type="email" class="form-control" placeholder="Your Email" aria-label="Email" />
                <button class="btn btn-travia" type="submit"><i class="bi bi-send-fill"></i></button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="footer-bottom py-3">
        <div class="container d-flex justify-content-between align-items-center flex-wrap">
          <div class="text-center text-md-start">© 2025 <strong>Travia</strong>. All rights reserved.</div>
          <div class="footer-legal">
            <a href="#">Privacy Policy</a> <span class="mx-2 text-muted">|</span>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) footerContainer.innerHTML = footerHTML;
}

// === ADVANCED SERVER-SIDE LIVE SEARCH ===
function initSearch(rootPath) {
  const searchForm = document.querySelector(".search-box");
  if (!searchForm) return;

  const API_BASE = window.TraviaAPI?.destinations;
  const searchInput = searchForm.querySelector("#search-input");
  const resultsBox = document.getElementById("search-results");
  let debounceTimer;

  if (!API_BASE) return;

  // 1. LISTEN FOR INPUT (Triggers the Fetch)
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    resultsBox.innerHTML = ""; // Clear previous results

    // Don't search for single letters
    if (query.length < 2) {
      resultsBox.style.display = "none";
      return;
    }

    // Show loading spinner
    resultsBox.style.display = "block";
    resultsBox.innerHTML =
      '<div class="p-3 text-muted small text-center"><span class="spinner-border spinner-border-sm"></span> Searching...</div>';

    // DEBOUNCE: Clear previous timer if user is still typing
    clearTimeout(debounceTimer);

    // Set new timer: Wait 300ms before hitting the server
    debounceTimer = setTimeout(() => {
      performLiveSearch(query, API_BASE, rootPath, resultsBox);
    }, 300);
  });

  // 2. Hide on Click Outside
  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target)) {
      resultsBox.style.display = "none";
    }
  });

  searchForm.addEventListener("submit", (e) => e.preventDefault());
}

// 3. FETCHING LOGIC (Optimized Parallel Requests)
async function performLiveSearch(query, apiBase, rootPath, container) {
  try {
    const encodedQuery = encodeURIComponent(query);

    // Fetch Top 3 of each category to save bandwidth
    const [countriesRes, citiesRes, toursRes] = await Promise.all([
      fetch(`${apiBase}/countries?search=${encodedQuery}&limit=3`),
      fetch(`${apiBase}/cities?search=${encodedQuery}&limit=3`),
      fetch(`${apiBase}/tours?search=${encodedQuery}&limit=4`),
    ]);

    const countries = await countriesRes.json();
    const cities = await citiesRes.json();
    const toursJson = await toursRes.json();
    const tours = Array.isArray(toursJson) ? toursJson : toursJson.data || [];

    // Build Unified Results List
    const countryResults = countries.map((c) => ({
      name: c.name,
      type: "Country",
      link: `${rootPath}pages/countries.html?id=${c._id}`,
      image: c.backgroundImage || c.images?.[0],
    }));

    const cityResults = cities.map((c) => ({
      name: c.name,
      type: "City",
      link: `${rootPath}pages/cities.html?id=${c._id}`,
      image: c.images?.[0],
    }));

    const tourResults = tours.map((t) => ({
      name: t.name,
      type: "Tour",
      link: `${rootPath}pages/tour-details.html?id=${t._id}`,
      image: t.images?.[0],
    }));

    // Combine logic: Countries first, then Cities, then Tours
    const allMatches = [...countryResults, ...cityResults, ...tourResults];

    renderAdvancedResults(allMatches, container, rootPath);
  } catch (error) {
    console.error("Search failed:", error);
    container.innerHTML =
      '<div class="p-3 text-danger small text-center">Unable to search.</div>';
  }
}

// 4. RENDER LOGIC
function renderAdvancedResults(matches, container, rootPath) {
  container.innerHTML = ""; // Remove spinner

  if (matches.length === 0) {
    container.innerHTML =
      '<div class="p-3 text-muted small text-center">No results found.</div>';
    return;
  }

  matches.forEach((match) => {
    const div = document.createElement("div");
    div.classList.add("search-item");

    // Badge Logic
    let badgeClass = "badge-tour";
    if (match.type === "Country") badgeClass = "badge-country";
    if (match.type === "City") badgeClass = "badge-city";

    div.innerHTML = `
        <img src="${match.image || `${rootPath}public/assets/Travia.png`}" 
             alt="${match.name}" 
             onerror="this.src='${rootPath}public/assets/Travia.png'">
        <div class="info flex-grow-1">
            <h6 class="mb-0 text-dark" style="font-size: 14px;">${
              match.name
            }</h6>
        </div>
        <span class="search-badge ${badgeClass}">${match.type}</span>
        <i class="bi bi-chevron-right text-muted" style="font-size: 12px;"></i>
    `;

    div.addEventListener("click", () => {
      window.location.href = match.link;
    });
    container.appendChild(div);
  });
}

function highlightActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href !== "#") {
      const cleanHref = href.replace("../", "").replace("./", "");
      if (path.includes(cleanHref)) {
        link.classList.add("active");
      }
    }
  });
}
