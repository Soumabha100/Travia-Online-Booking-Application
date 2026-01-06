document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = window.TraviaAPI.destinations;
    // 1. Initialize
    const countryContainer = document.querySelector("#countryCarousel .carousel-inner");
    const cityContainer = document.getElementById("cities-container");
    const tourContainer = document.getElementById("tours-container");

    // Show Loading State
    if(tourContainer) tourContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-travia-teal"></div></div>';

    try {
        // 2. Parallel Fetching for Performance
        const [countriesRes, citiesRes, toursRes] = await Promise.all([
            fetch(`${API_URL}/countries`),
            fetch(`${API_URL}/cities`),
            fetch(`${API_URL}/tours`)
        ]);

        const countries = await countriesRes.json();
        const cities = await citiesRes.json();
        const toursData = await toursRes.json();

        const tours = Array.isArray(toursData) ? toursData : (toursData.data || []);

        // 3. Render Sections
        renderCountries(countries, countryContainer);
        renderCities(cities, cityContainer);
        renderTours(tours, tourContainer);

    } catch (err) {
        console.error("Failed to load destination data:", err);
        if(tourContainer) tourContainer.innerHTML = '<div class="text-center text-danger py-5">Failed to load data. Please try again later.</div>';
    }
});

/**
 * SECTION 1: RENDER COUNTRIES (Carousel)
 */
function renderCountries(countries, container) {
    if (!container || !countries.length) return;

    // Filter only top countries (e.g., sorted by visitors or specific list)
    const featuredCountries = countries.slice(0, 5); // Show top 5

    container.innerHTML = featuredCountries.map((country, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <div class="country-card-large" style="background-image: url('${country.backgroundImage || '../public/images/BG1.jpg'}')">
                <div class="country-card-overlay">
                    <div class="p-5 content-slide-up">
                        <h2 class="display-4 fw-bold text-white mb-2 font-playfair">${country.name}</h2>
                        <p class="text-white opacity-90 mb-4 font-lato fs-5">
                            ${getCountryTagline(country.name)}
                        </p>
                        <a href="countries.html?id=${country._id}" class="btn btn-light rounded-pill px-5 fw-bold stretched-link">
                            Explore ${country.name}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

/**
 * SECTION 2: RENDER CITIES (Grid)
 */
function renderCities(cities, container) {
    if (!container || !cities.length) return;

    // Show top 8 cities
    const featuredCities = cities.slice(0, 8);

    container.innerHTML = featuredCities.map(city => `
        <div class="col-12 col-sm-6 col-md-3">
            <a href="cities.html?id=${city._id}" class="card city-card h-100 border-0 shadow-sm text-decoration-none">
                <div class="position-relative overflow-hidden city-img-wrapper rounded-top-4">
                    <img src="${city.images?.[0] || '../public/images/BG2.jpg'}" alt="${city.name}" class="img-fluid w-100 h-100 object-fit-cover">
                    
                    <span class="badge bg-white text-dark position-absolute top-0 start-0 m-3 fw-bold small shadow-sm rounded-pill px-2">
                        <i class="bi bi-star-fill text-warning me-1"></i>${(city.popularityIndex / 20).toFixed(1)}
                    </span>
                    
                    ${city.popularityIndex > 90 ? 
                        '<span class="badge bg-travia-teal text-white position-absolute top-0 end-0 m-3 small shadow-sm rounded-pill">Trending</span>' : ''}
                </div>
                
                <div class="card-body p-3">
                    <h5 class="fw-bold text-dark mb-1 font-playfair">${city.name}</h5>
                    <p class="text-muted small mb-3">${city.countryId?.name || 'Unknown'}</p>
                    
                    <div class="d-flex justify-content-between align-items-center border-top pt-2">
                        <span class="badge bg-light text-secondary border fw-normal">
                            ${getCityCategory(city)}
                        </span>
                        <small class="fw-bold text-travia-navy">From <span class="fs-6">$${city.economics?.minDailyBudget || 150}</span>/day</small>
                    </div>
                </div>
            </a>
        </div>
    `).join("");
}

/**
 * SECTION 3: RENDER TOURS (Detailed Booking.com Style)
 */
function renderTours(tours, container) {
    if (!container || !tours.length) return;

    // Show top 5 tours
    const featuredTours = tours.slice(0, 5);

    container.innerHTML = featuredTours.map(tour => {
        // Logic for Ratings
        const rating = tour.stats?.rating || 0;
        const ratingLabel = rating >= 9 ? "Exceptional" : rating >= 8 ? "Excellent" : rating >= 7 ? "Very Good" : "Good";
        
        // Logic for Pricing
        const hasDiscount = tour.discountPrice && tour.discountPrice < tour.price;
        const displayPrice = hasDiscount ? tour.discountPrice : tour.price;
        const oldPriceHtml = hasDiscount ? `<div class="mb-1 text-muted text-decoration-line-through small">$${tour.price}</div>` : "";
        const discountBadge = hasDiscount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-3 shadow-sm px-2 py-1">Deal</span>` : 
                              (tour.isFeatured ? `<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 shadow-sm px-2 py-1"><i class="bi bi-star-fill small me-1"></i>Featured</span>` : "");

        // Highlights List (First 2 highlights + Amenities)
        const highlightList = (tour.highlights || []).slice(0, 2).map(h => 
            `<div class="text-dark mb-1"><i class="bi bi-check2 text-success me-1"></i>${h}</div>`
        ).join("");

        const amenityList = (tour.amenities || []).slice(0, 2).map(a => 
            `<div class="text-success"><i class="bi bi-check2 me-1"></i>${a}</div>`
        ).join("");

        return `
        <div class="card tour-card border-0 shadow-sm overflow-hidden rounded-3 mb-4">
            <div class="row g-0">
                <div class="col-md-4 position-relative">
                    <img src="${tour.images?.[0] || '../public/images/Desert3.jpg'}" class="img-fluid h-100 w-100 object-fit-cover tour-card-img" alt="${tour.name}">
                    ${discountBadge}
                    <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm icon-btn" onclick="toggleWishlist(this)">
                        <i class="bi bi-heart"></i>
                    </button>
                </div>

                <div class="col-md-5 p-3 p-md-4 d-flex flex-column border-end-md">
                    <div class="mb-auto">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 class="card-title fw-bold text-travia-navy mb-1 hover-underline font-playfair fs-4">
                                    <a href="tours.html?id=${tour._id}" class="text-decoration-none text-travia-navy">${tour.name}</a>
                                </h5>
                                <p class="small text-muted mb-2">
                                    <i class="bi bi-geo-alt-fill text-travia-teal me-1"></i>${tour.cityId?.name}, ${tour.countryId?.name}
                                    <span class="mx-1">•</span> 
                                    <a href="#" class="text-decoration-none text-travia-teal small hover-underline">Show on map</a>
                                </p>
                            </div>
                        </div>

                        <div class="tour-features small mt-3 font-lato border-start border-3 border-success ps-3">
                            <div class="fw-bold text-dark mb-1">Highlights:</div>
                            <div class="text-dark mb-1"><i class="bi bi-clock text-success me-1"></i><b>${tour.duration}</b> Duration</div>
                            ${highlightList}
                            ${amenityList}
                        </div>
                        
                        <p class="text-muted small mt-3 mb-0 text-truncate-2">
                            ${tour.overview || "Experience an unforgettable journey..."}
                        </p>
                    </div>

                    <div class="mt-3 pt-3 border-top">
                        <span class="badge bg-light text-secondary border fw-normal me-1">${tour.category || "General"}</span>
                        <span class="badge bg-light text-secondary border fw-normal me-1">${tour.groupSize || "Group"}</span>
                    </div>
                </div>

                <div class="col-md-3 p-3 p-md-4 bg-light bg-opacity-25 d-flex flex-column justify-content-between align-items-end text-end">
                    
                    <div class="mb-3">
                        <div class="d-flex align-items-center justify-content-end mb-1">
                            <div class="me-2">
                                <div class="fw-bold text-travia-navy fs-6">${ratingLabel}</div>
                                <div class="small text-muted">${tour.stats?.reviewsCount || 0} reviews</div>
                            </div>
                            <div class="bg-travia-navy text-white rounded-2 d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style="width: 45px; height: 45px;">
                                ${rating}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="d-flex flex-column align-items-end">
                            ${oldPriceHtml}
                            <h3 class="fw-bold mb-0 text-dark font-playfair display-6">$${displayPrice}</h3>
                            <small class="text-muted d-block mb-3">Includes taxes & fees</small>
                        </div>

                        <a href="tours.html?id=${tour._id}" class="btn btn-travia-primary w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2">
                            See Availability <i class="bi bi-chevron-right small"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

// --- Helpers (Generates authentic placeholders) ---

function getCountryTagline(name) {
    const lines = {
        "France": "Experience romance, art, and world-class cuisine.",
        "India": "A land of vibrant colors, spirituality, and history.",
        "Japan": "Where ancient tradition meets futuristic innovation.",
        "USA": "From bustling cities to breathtaking natural parks."
    };
    return lines[name] || "Discover the beauty and culture of this amazing destination.";
}

function getCityCategory(city) {
    // Simple logic to guess category based on DB data or random
    if (city.economics?.minDailyBudget > 250) return "Luxury";
    if (city.popularityIndex > 90) return "Trending";
    return "Culture";
}

window.toggleWishlist = (btn) => {
    const icon = btn.querySelector("i");
    if (icon.classList.contains("bi-heart")) {
        icon.classList.remove("bi-heart");
        icon.classList.add("bi-heart-fill", "text-danger");
    } else {
        icon.classList.remove("bi-heart-fill", "text-danger");
        icon.classList.add("bi-heart");
    }
};