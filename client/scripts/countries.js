/**
 * COUNTRIES.JS
 * Handles the Country Landing Page Logic.
 */

document.addEventListener("DOMContentLoaded", () => {
  initCountriesPage();
});

const STATE = {
  selectedCountry: null,
  tours: [],
};

async function initCountriesPage() {
  if (!window.TraviaAPI) return;

  // 1. Check URL for Country ID
  const params = new URLSearchParams(window.location.search);
  const countryId = params.get("id");
  const heroContainer = document.getElementById("countries-hero");

  try {
    if (countryId) {
      // === CASE A: Specific Country Selected ===
      // Fetch THIS specific country directly (Reliable)
      const res = await fetch(`${window.TraviaAPI.destinations}/countries/${countryId}`);
      
      if (!res.ok) throw new Error("Country not found");
      const country = await res.json();

      STATE.selectedCountry = country;
      renderSingleCountryHero(country, heroContainer);
      
      // Fetch tours for this specific country ID (Precise)
      fetchCountryTours(countryId, true); 

    } else {
      // === CASE B: Default View (Carousel of Top Countries) ===
      const res = await fetch(`${window.TraviaAPI.destinations}/countries?limit=5`);
      const countries = await res.json();
      
      renderCarouselHero(countries, heroContainer);
      fetchCountryTours("", false); // Fetch all top tours
    }
  } catch (err) {
    console.error("Countries Error:", err);
    // Fallback if specific ID fails -> Show default
    heroContainer.innerHTML = `<div class="text-center text-white py-5">Failed to load content. Redirecting...</div>`;
    setTimeout(() => window.location.href = "countries.html", 2000);
  }
}

// --- HERO RENDERERS ---

function renderCarouselHero(countries, container) {
  const indicators = countries.map((_, i) =>
        `<button type="button" data-bs-target="#countryCarousel" data-bs-slide-to="${i}" class="${i === 0 ? "active" : ""}"></button>`
    ).join("");

  const slides = countries.map((c, i) => `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img src="${c.backgroundImage || "../public/images/BG1.jpg"}" class="country-hero-img" alt="${c.name}">
            <div class="carousel-caption d-none d-md-block">
                <h1 class="display-3 fw-bold font-playfair">${c.name}</h1>
                <p class="fs-5 opacity-90">Discover the best tours in ${c.name}</p>
                <a href="countries.html?id=${c._id}" class="btn btn-travia-primary rounded-pill px-5 fw-bold mt-3">Explore Now</a>
            </div>
        </div>
    `).join("");

  container.innerHTML = `
        <div id="countryCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
            <div class="carousel-indicators">${indicators}</div>
            <div class="carousel-inner">${slides}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#countryCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#countryCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
        </div>
    `;

  document.getElementById("page-title").innerText = "All Countries";
  document.getElementById("section-heading").innerText = "Top Rated Tours Worldwide";
}

function renderSingleCountryHero(country, container) {
  const bg = country.backgroundImage || "../public/images/BG1.jpg";

  container.innerHTML = `
        <div class="country-banner">
            <img src="${bg}" alt="${country.name}">
            <div class="banner-overlay">
                <h1 class="display-3 fw-bold text-white font-playfair">${country.name}</h1>
                <p class="text-white fs-5 opacity-90">Explore our curated experiences in ${country.name}</p>
            </div>
        </div>
    `;

  document.getElementById("page-title").innerText = country.name;
  document.getElementById("section-heading").innerText = `Available Tours in ${country.name}`;
}

// --- TOUR FETCHING & RENDERING ---

async function fetchCountryTours(identifier, isSpecific) {
  const grid = document.getElementById("country-tours-grid");
  const countLabel = document.getElementById("result-count");

  grid.innerHTML = '<div class="text-center py-5 w-100"><div class="spinner-border text-travia-teal"></div></div>';

  try {
    // Construct URL based on mode
    let url = `${window.TraviaAPI.destinations}/tours?page=1&limit=12`;
    
    if (isSpecific) {
        // Query by Country ID (Exact Match)
        url += `&country=${identifier}`;
    } else {
        // Default: just load top tours
        // No extra params needed
    }

    const res = await fetch(url);
    const json = await res.json();
    const tours = Array.isArray(json) ? json : json.data || [];

    if (tours.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center py-5"><h5 class="text-muted">No tours found for this location yet.</h5></div>`;
      countLabel.innerText = "0 Tours";
      return;
    }

    countLabel.innerText = `${tours.length} Tours Found`;
    renderToursGrid(tours, grid);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="text-center text-danger py-5">Failed to load tours.</div>`;
  }
}

function renderToursGrid(tours, container) {
  container.innerHTML = tours.map((tour) => {
      const price = tour.discountPrice || tour.price;
      const rating = tour.stats?.rating || 0;
      const reviews = tour.stats?.reviewsCount || 0;
      const image = tour.images && tour.images.length ? tour.images[0] : "../public/images/Travia.png";

      const starCount = Math.min(5, Math.max(1, Math.round(rating)));
      const starsHtml = Array(starCount).fill('<i class="bi bi-star-fill text-warning"></i>').join("");

      const featuresHtml = (tour.highlights || []).slice(0, 3).map(h =>
            `<div class="grid-feature-item"><i class="bi bi-check2 text-success"></i> ${h}</div>`
        ).join("");

      let badgeOverlay = "";
      if (tour.isFeatured) badgeOverlay = '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2 shadow-sm border border-light">Featured</span>';
      else if (tour.discountPrice) badgeOverlay = '<span class="badge bg-danger position-absolute top-0 start-0 m-2 shadow-sm">Deal</span>';

      return `
        <div class="col-md-6 col-lg-4 d-flex align-items-stretch">
            <div class="tour-card-grid w-100 position-relative">
                <div class="card-img-wrapper">
                    <img src="${image}" class="card-img-top" alt="${tour.name}">
                    ${badgeOverlay}
                    <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm icon-btn">
                        <i class="bi bi-heart"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div>
                        <div class="star-rating-row mb-1">${starsHtml}</div>
                        <h6 class="tour-name-grid" title="${tour.name}">
                            <a href="tour-details.html?id=${tour._id}" class="text-decoration-none text-travia-navy stretched-link">${tour.name}</a>
                        </h6>
                        <p class="small text-muted mb-0">
                            <i class="bi bi-geo-alt-fill text-travia-teal"></i> ${tour.cityId?.name || ""}, ${tour.countryId?.name || ""}
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
                                <div class="fw-bold text-travia-navy" style="font-size: 0.8rem;">Very Good</div>
                                <div class="text-muted" style="font-size: 0.7rem;">${reviews} reviews</div>
                            </div>
                        </div>
                        <div class="price-section-grid position-relative" style="z-index: 2;">
                            ${tour.discountPrice ? `<div class="old-price">$${tour.price}</div>` : ""}
                            <div class="current-price">$${price}</div>
                            <a href="tour-details.html?id=${tour._id}" class="btn btn-travia-primary btn-sm rounded-pill fw-bold mt-1 px-3 w-100 d-block">View</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join("");
}