document.addEventListener("DOMContentLoaded", () => {
  const isPagesFolder = window.location.pathname.includes("/pages/");
  const rootPath = isPagesFolder ? "../" : "./";

  injectNavbar(rootPath);
  injectFooter(rootPath);

  highlightActiveLink();
  initSearch(rootPath);
});

function injectNavbar(rootPath) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  let authButtonHTML = "";

  if (token && user) {

    authButtonHTML = `
        <div class="dropdown ms-3">
          <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
             <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + user.username + '&background=008080&color=fff'}" 
                  alt="mdo" width="35" height="35" class="rounded-circle border border-2 border-white me-2">
             <span class="text-white fw-bold d-none d-lg-block">${user.username}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end text-small shadow" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#profileModal"><i class="bi bi-person me-2"></i>My Profile</a></li>
            <li><a class="dropdown-item" href="${rootPath}pages/bookings.html"><i class="bi bi-ticket-perforated me-2"></i>My Bookings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
          </ul>
        </div>
    `;
  } else {
    // === GUEST STATE (Login Button) ===
    authButtonHTML = `
        <button type="button" class="btn btn-travia ms-3" data-bs-toggle="modal" data-bs-target="#authModal">Login</button>
    `;
  }

  // === 2. INJECT NAVBAR HTML ===
  const navbarHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top travia-navbar">
        <div class="container">
          <a class="navbar-brand fw-bold" href="${rootPath}pages/index.html">
            <img class="travia" src="${rootPath}public/assets/Travia.png" alt="Travia Logo" />
          </a>
  
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#traviaNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse" id="traviaNavbar">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="${rootPath}pages/index.html">Home</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                  Destinations
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="${rootPath}pages/destinations.html">Popular Tours</a></li>
                  <li><a class="dropdown-item" href="#">Europe</a></li>
                  <li><a class="dropdown-item" href="#">Asia</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="${rootPath}pages/destinations.html">All Destinations</a></li>
                </ul>
              </li>
              <li class="nav-item"><a class="nav-link" href="#">Experiences</a></li>
              <li class="nav-item"><a class="nav-link" href="#">About</a></li>
            </ul>
  
            <div class="d-flex align-items-center">
              <form class="search-box position-relative" role="search" autocomplete="off">
                <input class="form-control" id="search-input" type="search" placeholder="Search tours..." aria-label="Search" />
                <button type="submit"><img src="${rootPath}public/assets/Search.svg" alt="Search" /></button>
                <div id="search-results" class="search-results-box"></div>
              </form>
              
              ${authButtonHTML}

            </div>
          </div>
        </div>
      </nav>
    `;

  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;

    // === 3. ACTIVATE LOGOUT BUTTON ===
    // We attach the listener AFTER the HTML is injected
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Reload page to reset UI to Guest mode
        window.location.reload();
      });
    }
  }
}

// =========================================================
//  EXISTING CODE BELOW (FOOTER, SEARCH, ETC.) - UNTOUCHED
// =========================================================

function injectFooter(rootPath) {
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

function initSearch(rootPath) {
  const searchForm = document.querySelector(".search-box");
  if (!searchForm) return;

  const API_URL = window.TraviaAPI?.destinations;
  const searchInput = searchForm.querySelector("#search-input");
  const resultsBox = document.getElementById("search-results");
  let searchIndex = [];

  if (!API_URL) {
    console.warn("TraviaAPI not found. Make sure apiConfig.js is loaded.");
    return;
  }

  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        searchIndex = buildSearchIndex(data, rootPath);
        console.log(`✅ Loaded ${searchIndex.length} searchable items.`);
      }
    })
    .catch((err) => console.error("❌ API Error:", err));

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    resultsBox.innerHTML = "";

    if (query.length < 2) {
      resultsBox.style.display = "none";
      return;
    }

    const matches = searchIndex.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.parent.toLowerCase().includes(query)
    );

    renderResults(matches, resultsBox);
  });

  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target)) {
      resultsBox.style.display = "none";
    }
  });

  searchForm.addEventListener("submit", (e) => e.preventDefault());
}

function buildSearchIndex(data, rootPath) {
  let index = [];
  data.forEach((continent) => {
    if (continent.countries) {
      continent.countries.forEach((tour) => {
        index.push({
          name: tour.name,
          category: "Tour Package",
          parent: continent.name,
          image: tour.image,
          link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(tour.name)}`,
        });

        if (tour.city) {
          index.push({
            name: tour.city,
            category: `City in ${tour.name}`,
            parent: tour.name,
            image: tour.image,
            link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(tour.name)}`,
          });
        }
        if (tour.placesToVisit) {
          tour.placesToVisit.forEach((place) => {
            if (place !== tour.city) {
              index.push({
                name: place,
                category: `Visit in ${tour.name}`,
                parent: tour.name,
                image: tour.image,
                link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(tour.name)}`,
              });
            }
          });
        }
      });
    }
  });
  return index;
}

function renderResults(matches, container) {
  if (matches.length === 0) {
    container.innerHTML = '<div class="p-3 text-muted small text-center">No matching tours found.</div>';
    container.style.display = "block";
    return;
  }

  matches.slice(0, 10).forEach((match) => {
    const div = document.createElement("div");
    div.classList.add("search-item");
    div.innerHTML = `
            <img src="${match.image}" alt="${match.name}" onerror="this.src='https://via.placeholder.com/50'">
            <div class="info">
                <h6 class="mb-0 text-dark" style="font-size: 14px;">${match.name}</h6>
                <small class="text-primary" style="font-size: 11px; text-transform:uppercase; font-weight:700;">${match.category}</small>
            </div>
            <i class="bi bi-chevron-right ms-auto text-muted" style="font-size: 12px;"></i>
        `;
    div.addEventListener("click", () => {
      window.location.href = match.link;
    });
    container.appendChild(div);
  });
  container.style.display = "block";
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