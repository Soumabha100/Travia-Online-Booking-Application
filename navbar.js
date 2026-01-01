document.addEventListener("DOMContentLoaded", () => {
  const isPagesFolder = window.location.pathname.includes("/pages/");
  const rootPath = isPagesFolder ? "../" : "./";
  const API_URL = "http://localhost:8001/api/destinations"

  const navbarHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top travia-navbar">
        <div class="container">
          <a class="navbar-brand fw-bold" href="${rootPath}index.html">
            <img class="travia" src="${rootPath}assets/Travia.png" alt="Travia Logo" />
          </a>
  
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#traviaNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse" id="traviaNavbar">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="${rootPath}index.html" id="nav-home">Home</a>
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
              <li class="nav-item">
              <a class="nav-link" href="#">Experiences</a>
            </li>

              <li class="nav-item">
                <a class="nav-link" href="#">About</a>
              </li>
            </ul>
  
            <div class="d-flex align-items-center">
              <form class="search-box me-3 position-relative" role="search" autocomplete="off">
                <input class="form-control" id="search-input" type="search" placeholder="Search tours, cities..." aria-label="Search" />
                <button type="submit">
                  <img src="${rootPath}assets/Search.svg" alt="Search" />
                </button>
                <div id="search-results" class="search-results-box"></div>
              </form>
              
              <button type="button" class="btn btn-travia" data-bs-toggle="modal" data-bs-target="#authModal">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    `;

  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) navbarContainer.innerHTML = navbarHTML;

  highlightActiveLink();

  const searchForm = document.querySelector(".search-box");

  if (searchForm) {
    const searchInput = searchForm.querySelector("#search-input");
    const resultsBox = document.getElementById("search-results");

    let searchIndex = [];

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server Returned Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("received data is not an ArrayQ")
        }
        searchIndex = buildSearchIndex(data, rootPath);
        console.log(`✅ MondoDatabae Cloud Loaded ${searchIndex.length} searchable items.`)
      })
      .catch((err) => {
        console.error("❌ API Connection Failed", err);
      });

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
});

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
          link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(
            tour.name
          )}`,
        });

        if (tour.city) {
          index.push({
            name: tour.city,
            category: `City in ${tour.name}`,
            parent: tour.name,
            image: tour.image,
            link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(
              tour.name
            )}`,
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
                link: `${rootPath}pages/bookings.html?destination=${encodeURIComponent(
                  tour.name
                )}`,
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
    container.innerHTML =
      '<div class="p-3 text-muted small text-center">No matching tours found.<br>Please enter a valid destination</div>';
    container.style.display = "block";
    return;
  }

  matches.slice(0, 10).forEach((match) => {
    const div = document.createElement("div");
    div.classList.add("search-item");

    div.innerHTML = `
            <img src="${match.image}" alt="${match.name}" onerror="this.src='https://via.placeholder.com/50'">
            <div class="info">
                <h6 class="mb-0 text-dark" style="font-size: 14px;">
                    ${match.name}
                </h6>
                <small class="text-primary" style="font-size: 11px; text-transform:uppercase; font-weight:700;">
                    ${match.category}
                </small>
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
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href !== "#") {
      const cleanHref = href.replace("../", "").replace("./", "");
      if (path.includes(cleanHref)) {
        link.classList.add("active");
      }
    }
  });
}
