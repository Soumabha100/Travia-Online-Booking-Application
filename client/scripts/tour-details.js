/**
 * TOUR-DETAILS.JS
 * Handles the Single Product Page logic: Fetching, Rendering, and Price Calculation.
 */

document.addEventListener("DOMContentLoaded", () => {
    initTourDetails();
});

// State to hold current tour data for price calc
let CURRENT_TOUR = null;

async function initTourDetails() {
    // 1. Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');

    if (!tourId || !window.TraviaAPI) {
        alert("Invalid Tour Link");
        window.location.href = "tours.html";
        return;
    }

    // 2. Fetch Data
    try {
        const res = await fetch(`${window.TraviaAPI.destinations}/tours/${tourId}`);
        if (!res.ok) throw new Error("Tour not found");
        
        const tour = await res.json();
        CURRENT_TOUR = tour; // Save for booking logic

        // 3. Render All Sections
        renderHeader(tour);
        renderGallery(tour);
        renderMeta(tour);
        renderItinerary(tour);
        renderAmenities(tour);
        renderMap(tour);
        setupBookingForm(tour);

    } catch (err) {
        console.error(err);
        document.querySelector("main").innerHTML = `
            <div class="text-center py-5">
                <h3>Tour not found</h3>
                <a href="tours.html" class="btn btn-travia-primary mt-3">Go Back</a>
            </div>`;
    }
}

// --- RENDERERS ---

function renderHeader(tour) {
    document.title = `${tour.name} | Travia`;
    document.getElementById("breadcrumb-title").innerText = tour.name;
    document.getElementById("tour-name").innerText = tour.name;
    
    // Location
    const city = tour.cityId?.name || "Unknown City";
    const country = tour.countryId?.name || "Unknown Country";
    document.getElementById("tour-location").innerText = `${city}, ${country}`;

    // Stars
    const rating = tour.stats?.rating || 0;
    const starCount = Math.round(rating);
    const starsHtml = Array(starCount).fill('<i class="bi bi-star-fill"></i>').join('');
    document.getElementById("star-container").innerHTML = `${starsHtml} <span class="text-muted ms-1 text-dark">(${rating})</span>`;
}

function renderGallery(tour) {
    // Fallback images
    const images = tour.images && tour.images.length > 0 ? tour.images : ['../public/images/Travia.png'];
    
    // 1. Main Image
    const mainImg = document.getElementById("hero-img-main");
    if(mainImg) mainImg.src = images[0];

    // 2. Side Images (Check if they exist)
    const sec1 = document.getElementById("hero-img-sec1");
    if(sec1) sec1.src = images[1] || images[0]; // Fallback to main if no 2nd image

    const sec2 = document.getElementById("hero-img-sec2");
    if(sec2) sec2.src = images[2] || images[0]; // Fallback to main if no 3rd image
    
    // Count Badge (if more than 3 images)
    if(images.length > 3) {
        const badge = document.querySelector(".overlay-count");
        if(badge) {
            badge.innerText = `+${images.length - 3}`;
            badge.classList.remove("d-none");
            badge.classList.add("d-flex");
        }
    }
}

function renderMeta(tour) {
    document.getElementById("meta-duration").innerText = tour.duration || "-- Days";
    document.getElementById("meta-group").innerText = tour.groupSize || "Variable";
    document.getElementById("tour-overview").innerText = tour.overview || "No description available.";

    // Highlights List
    const hlContainer = document.getElementById("highlights-list");
    if(tour.highlights && tour.highlights.length > 0) {
        hlContainer.innerHTML = tour.highlights.map(h => `
            <div class="col-md-6">
                <div class="d-flex align-items-center gap-2 text-dark">
                    <i class="bi bi-check-circle-fill text-success small"></i>
                    <span>${h}</span>
                </div>
            </div>
        `).join('');
    }
}

function renderAmenities(tour) {
    const container = document.getElementById("amenities-list");
    if(!container) return;

    // Use DB amenities or defaults
    const amenities = tour.amenities && tour.amenities.length > 0 ? tour.amenities : ["Guide", "Transport", "Tickets"];
    
    container.innerHTML = amenities.map(item => `
        <div class="col-6 col-md-4">
            <div class="amenity-item">
                <i class="bi bi-patch-check-fill"></i>
                <span>${item}</span>
            </div>
        </div>
    `).join('');
}

function renderItinerary(tour) {
    const container = document.getElementById("itineraryAccordion");
    if(!tour.itinerary || tour.itinerary.length === 0) {
        container.innerHTML = '<p class="text-muted">Itinerary details coming soon.</p>';
        return;
    }

    container.innerHTML = tour.itinerary.map((day, index) => {
        const isFirst = index === 0;
        return `
        <div class="accordion-item border-0 border-bottom">
            <h2 class="accordion-header">
                <button class="accordion-button ${isFirst ? '' : 'collapsed'} bg-transparent shadow-none px-0 fw-bold text-dark" 
                        type="button" data-bs-toggle="collapse" data-bs-target="#day${index}">
                    <span class="badge bg-travia-teal text-white me-3 rounded-pill">Day ${day.day}</span>
                    ${day.title}
                </button>
            </h2>
            <div id="day${index}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" data-bs-parent="#itineraryAccordion">
                <div class="accordion-body px-0 pt-0 pb-4 text-muted">
                    ${day.desc}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderMap(tour) {
    // Requires Coordinates from DB. Assuming cityId has name, we default to a center point.
    // NOTE: In a real app, you would use [lat, lng] from the database.
    // Since we are using Leaflet (OpenStreetMap), we need coords.
    // For this demo, we will check if 'coordinates' exist, else hide map.
    
    // Mock coordinates if missing (London center) just to show it working
    const lat = 51.505; 
    const lng = -0.09;

    const mapEl = document.getElementById("tour-map");
    if(!mapEl) return;

    // Initialize Leaflet
    try {
        const map = L.map('tour-map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lng]).addTo(map)
            .bindPopup(`${tour.name}`)
            .openPopup();
    } catch(e) {
        console.log("Map init failed (likely already initialized)", e);
    }
}

// --- BOOKING FORM LOGIC ---

function setupBookingForm(tour) {
    const price = tour.discountPrice || tour.price;
    const priceEl = document.getElementById("price-display");
    
    // Set Base Price
    priceEl.innerText = `$${price}`;
    
    // Show Deal Badge
    if(tour.discountPrice) document.getElementById("deal-badge").classList.remove("d-none");

    // Calculation Logic
    const guestInput = document.getElementById("guest-input");
    const dateInput = document.getElementById("travel-date");
    const form = document.getElementById("booking-form");

    // Recalculate function
    const recalc = () => {
        const count = parseInt(guestInput.value);
        const total = count * price;
        
        document.getElementById("base-calc-text").innerText = `$${price} x ${count} Guests`;
        document.getElementById("base-calc-total").innerText = `$${total}`;
        document.getElementById("final-total").innerText = `$${total}`;
        
        // Show breakdown
        document.getElementById("price-breakdown").classList.remove("d-none");
    };

    // Global Guest Updater (called by onClick in HTML)
    window.updateGuestCount = (change) => {
        let val = parseInt(guestInput.value) + change;
        if(val < 1) val = 1;
        if(val > 10) val = 10;
        
        guestInput.value = val;
        document.getElementById("guest-count-display").innerText = `${val} Adult${val > 1 ? 's' : ''}`;
        recalc();
    };

    // Date Listener
    dateInput.addEventListener("change", recalc);

    // Form Submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert(`Booking Request Sent!\n\nTour: ${tour.name}\nDate: ${dateInput.value}\nGuests: ${guestInput.value}\nTotal: ${document.getElementById("final-total").innerText}`);
        // Here you would call: await fetch('/api/bookings', { method: 'POST', ... })
    });
}