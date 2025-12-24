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
            <form class="search-box me-3" role="search">
              <input class="form-control" type="search" placeholder="Search..." aria-label="Search" />
              <button type="submit">
                <img src="${rootPath}assets/Search.svg" alt="Search" />
              </button>
            </form>
            
            <button type="button" class="btn btn-travia" data-bs-toggle="modal" data-bs-target="#authModal">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
    `;

    // 3. Inject the Navbar into the container
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
    }

    highlightActiveLink();
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