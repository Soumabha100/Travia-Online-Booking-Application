document.addEventListener("DOMContentLoaded", () => {
    const isPagesFolder = window.location.pathname.includes("/pages/");
    const rootPath = isPagesFolder ? "../" : "./";
  
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
                <li><a class="dropdown-item" href="#">America</a></li>
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
              <input class="form-control" id="search-input" type="search" placeholder="Search..." aria-label="Search" />
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
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
    }

    highlightActiveLink();

    // === NEW SEARCH LOGIC ===
    const searchForm = document.querySelector(".search-box");
    
    if (searchForm) {
        const searchInput = searchForm.querySelector("#search-input");
        const resultsBox = document.getElementById("search-results");
        let searchData = [];

        // 1. Fetch the data (Only once)
        // Ensure search-data.json is in your root or adjust path
        fetch(`${rootPath}search-data.json`) 
            .then(res => res.json())
            .then(data => { searchData = data; })
            .catch(err => console.error("Search data missing:", err));

        // 2. Real-time Search Listener
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsBox.innerHTML = ""; // Clear previous

            if (query.length < 1) {
                resultsBox.style.display = "none";
                return;
            }

            // Filter logic
            const matches = searchData.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );

            // Render results
            if (matches.length > 0) {
                resultsBox.style.display = "block";
                matches.forEach(match => {
                    const div = document.createElement("div");
                    div.classList.add("search-item");
                    
                    // Use rootPath for images and links to ensure they work from subfolders
                    // Note: Assuming links in JSON are like "pages/booking.html"
                    const correctLink = match.link.startsWith("http") ? match.link : rootPath + match.link;
                    
                    div.innerHTML = `
                        <img src="${match.image}" alt="${match.name}">
                        <div class="info">
                            <h6>${match.name}</h6>
                            <small>${match.category}</small>
                        </div>
                    `;
                    
                    div.addEventListener("click", () => {
                        window.location.href = correctLink;
                    });

                    resultsBox.appendChild(div);
                });
            } else {
                resultsBox.style.display = "none";
            }
        });

        // 3. Hide on Click Outside
        document.addEventListener("click", (e) => {
            if (!searchForm.contains(e.target)) {
                resultsBox.style.display = "none";
            }
        });

        // 4. Keep existing Submit (Enter key) behavior
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            const query = searchInput.value.trim(); 
            if (query.length > 0) {
                window.location.href = `${rootPath}pages/destinations.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
});

function highlightActiveLink() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') !== "#" && path.includes(link.getAttribute('href').replace("../", "").replace("./", ""))) {
            link.classList.add('active');
        }
    });
}