/**
 * CITIES.JS
 * Handles the logic for the Cities Landing Page.
 * Default: Show Grid of Cities.
 * If ID is Selected: Show Grid of Tours in that City.
 */

document.addEventListener("DOMContentLoaded", () => {
  initCitiesPage();
});

async function initCitiesPage() {
  if (!window.TraviaAPI) return;

  const params = new URLSearchParams(window.location.search);
  const cityId = params.get("id");
  const heroContainer = document.getElementById("cities-hero");
  const gridContainer = document.getElementById("cities-grid");
  const countLabel = document.getElementById("result-count");

  try {
    // 1. Fetch All Cities (Needed for list or hero)
    const res = await fetch(`${window.TraviaAPI.destinations}/cities`);
    const cities = await res.json();

    if (cityId) {
      // === VIEW SPECIFIC CITY (Show Tours) ===
      const city = cities.find((c) => c._id === cityId);

      if (city) {
        // Update Page Meta
        document.getElementById("page-title").innerText = city.name;
        document.getElementById(
          "section-heading"
        ).innerText = `Top Experiences in ${city.name}`;

        // Render Single Hero
        renderSingleCityHero(city, heroContainer);

        // Fetch Tours for this City
        // Note: We use the Search API filtering by City Name
        const tourRes = await fetch(
          `${window.TraviaAPI.destinations}/tours?search=${encodeURIComponent(
            city.name
          )}`
        );
        const tourData = await tourRes.json();
        const tours = Array.isArray(tourData) ? tourData : tourData.data || [];

        countLabel.innerText = `${tours.length} Experiences`;

        // REUSE the Rich Card Renderer from tours.js logic
        // We assume renderToursGrid logic exists or we manually map it here
        if (window.renderToursGrid) {
          window.renderToursGrid(tours, gridContainer);
        } else {
          // Fallback if renderToursGrid isn't global: Use manual mapping (See below)
          renderRichTours(tours, gridContainer);
        }
      }
    } else {
      // === VIEW ALL CITIES (Show City Tiles) ===
      renderCarouselHero(cities, heroContainer);
      renderCitiesGrid(cities, gridContainer);
      countLabel.innerText = `${cities.length} Destinations`;
    }
  } catch (err) {
    console.error("Cities Error:", err);
    gridContainer.innerHTML = `<div class="text-center text-danger py-5">Failed to load content.</div>`;
  }
}

// --- RENDERERS ---

function renderCarouselHero(cities, container) {
  const topCities = cities.slice(0, 5); // Top 5 for slider

  const slides = topCities
    .map(
      (c, i) => `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img src="${
              c.images?.[0] || "../public/images/BG2.jpg"
            }" class="city-hero-img" alt="${c.name}">
            <div class="carousel-caption d-none d-md-block pb-5">
                <h1 class="display-3 fw-bold font-playfair">${c.name}</h1>
                <p class="fs-5 opacity-90">Your journey to ${
                  c.countryId?.name || "paradise"
                } starts here.</p>
                <a href="cities.html?id=${
                  c._id
                }" class="btn btn-travia-primary rounded-pill px-5 fw-bold mt-3">Explore City</a>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = `
        <div id="cityCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
            <div class="carousel-inner">${slides}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#cityCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
            <button class="carousel-control-next" type="button" data-bs-target="#cityCarousel" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
        </div>
    `;
}

function renderSingleCityHero(city, container) {
  const img = city.images?.[0] || "../public/images/BG2.jpg";
  container.innerHTML = `
        <div class="city-banner">
            <img src="${img}" alt="${city.name}">
            <div class="banner-overlay">
                <h1 class="display-3 fw-bold text-white font-playfair">${
                  city.name
                }</h1>
                <p class="text-white fs-5 opacity-90"><i class="bi bi-geo-alt-fill text-travia-teal"></i> ${
                  city.countryId?.name || "World"
                }</p>
            </div>
        </div>
    `;
}

function renderCitiesGrid(cities, container) {
  container.innerHTML = cities
    .map(
      (city) => `
        <div class="col-md-6 col-lg-3">
            <a href="cities.html?id=${
              city._id
            }" class="city-tile text-decoration-none">
                <img src="${
                  city.images?.[0] || "../public/images/BG2.jpg"
                }" alt="${city.name}">
                <div class="flag-badge">
                   ${city.countryId?.name || "Explore"}
                </div>
                <div class="city-overlay">
                    <h3 class="city-name">${city.name}</h3>
                    <div class="city-meta">
                        <span>From $${
                          city.economics?.minDailyBudget || "150"
                        } / day</span>
                        <i class="bi bi-arrow-right-short ms-auto fs-5 text-travia-teal"></i>
                    </div>
                </div>
            </a>
        </div>
    `
    )
    .join("");
}

// Fallback Rich Tour Renderer (If you don't export it from tours.js)
function renderRichTours(tours, container) {
  if (tours.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center py-5 text-muted">No tours available in this city yet.</div>';
    return;
  }

  // Reuse the HTML structure from your Tours Grid
  container.innerHTML = tours
    .map((tour) => {
      const image =
        tour.images && tour.images.length
          ? tour.images[0]
          : "../public/images/Travia.png";
      const rating = tour.stats?.rating || 0;
      const price = tour.discountPrice || tour.price;

      return `
        <div class="col-md-6 col-lg-4 d-flex align-items-stretch">
            <div class="tour-card-grid w-100 position-relative shadow-sm rounded-3 overflow-hidden bg-white border">
                <div class="card-img-wrapper" style="height:220px; overflow:hidden; position:relative;">
                    <img src="${image}" class="w-100 h-100 object-fit-cover" alt="${
        tour.name
      }">
                    ${
                      tour.isFeatured
                        ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">Featured</span>'
                        : ""
                    }
                </div>
                <div class="card-body p-3 d-flex flex-column">
                    <h6 class="fw-bold text-travia-navy mb-1">
                        <a href="tour-details.html?id=${
                          tour._id
                        }" class="text-decoration-none text-travia-navy stretched-link">${
        tour.name
      }</a>
                    </h6>
                    <div class="text-warning small mb-2">
                        ${Array(Math.round(rating))
                          .fill('<i class="bi bi-star-fill"></i>')
                          .join("")}
                        <span class="text-muted ms-1">(${
                          tour.stats?.reviewsCount || 0
                        })</span>
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                        <span class="fw-bold fs-5 text-dark">$${price}</span>
                        <span class="btn btn-sm btn-outline-primary rounded-pill">View</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
}
