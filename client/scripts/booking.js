document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get the Destination Name from URL (e.g., ?destination=Paris%20Essentials)
    const params = new URLSearchParams(window.location.search);
    const targetTourName = params.get("destination"); // This corresponds to 'place.city' from the API

    if (!targetTourName) {
        alert("No destination selected. Redirecting to home.");
        window.location.href = "index.html";
        return;
    }

    // 2. Fetch All Tours
    try {
        const API_URL = window.TraviaAPI.destinations; // Ensure apiConfig.js is loaded
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to load tours");
        
        const nestedData = await res.json();
        
        // 3. FLATTEN THE DATA (Crucial Step)
        // The API returns [ { name: "Europe", countries: [ { ...tour } ] } ]
        // We need a single list of all tours to search through.
        let allTours = [];
        nestedData.forEach(continent => {
            if (continent.countries) {
                allTours = [...allTours, ...continent.countries];
            }
        });

        // 4. Find the Specific Tour
        // Note: In your API, 'tour.city' holds the Tour Name (e.g. "Paris Essentials")
        const selectedTour = allTours.find(t => t.city === targetTourName);

        if (!selectedTour) {
            console.error("Tour not found:", targetTourName);
            alert("Sorry, we couldn't find details for this booking.");
            return;
        }

        // 5. Populate the UI
        populateBookingPage(selectedTour);

    } catch (error) {
        console.error("Booking Error:", error);
    }
});

function populateBookingPage(tour) {
    // Basic Info
    document.getElementById("tour-title").innerText = tour.city; 
    document.getElementById("tour-city").innerText = tour.name; 
    
    // Rating
    document.getElementById("tour-rating").innerText = `${tour.rating} (${tour.reviews} Reviews)`;

    // Image
    const imgEl = document.getElementById("tour-image");
    if(imgEl) imgEl.src = tour.image || '../public/assets/Travia.png';

    // NEW: Highlights
    document.getElementById("tour-duration-text").innerText = tour.duration;
    document.getElementById("tour-group-text").innerText = tour.groupSize;
    
    const currEl = document.getElementById("tour-currency-text");
    if(currEl) currEl.innerText = tour.currency;

    // NEW: Visa Badge Logic
    const visaBadge = document.getElementById("tour-visa-badge");
    const visaText = document.getElementById("visa-text");
    if(tour.visa) {
        visaText.innerText = tour.visa; // e.g. "Schengen"
        visaBadge.classList.remove("d-none"); // Show it
    }

    // NEW: Trending Badge Logic
    const trendBadge = document.getElementById("tour-trending");
    if(trendBadge && tour.isTrending) {
        trendBadge.classList.remove("d-none");
    }

    // Description
    document.getElementById("tour-desc").innerText = tour.desc;

    // Pricing
    const priceDisplay = document.getElementById("price-display");
    if(priceDisplay) {
        const rawPrice = tour.price.replace(/[^0-9.]/g, '');
        priceDisplay.innerText = `$${rawPrice}`;
        priceDisplay.dataset.rawPrice = rawPrice;
        
        // Also update the sidebar currency note
        const currDisplay = document.getElementById("tour-currency-display");
        if(currDisplay) currDisplay.innerText = `Prices in ${tour.currency || 'USD'}`;
        
        // Trigger calc
        const guestInput = document.getElementById("guestCount");
        if(guestInput) guestInput.dispatchEvent(new Event('input'));
    }
}

// --- CALCULATION LOGIC (Optional, if you have a calculator) ---
// You can add an event listener to the "Guests" input to update Total Price
const guestInput = document.getElementById("guests");
if (guestInput) {
    guestInput.addEventListener("input", (e) => {
        const guests = parseInt(e.target.value) || 1;
        const priceDisplay = document.getElementById("price-display");
        const totalPriceEl = document.getElementById("total-price");
        
        if (priceDisplay && totalPriceEl) {
            const unitPrice = parseFloat(priceDisplay.dataset.rawPrice || 0);
            totalPriceEl.innerText = `$${(unitPrice * guests).toFixed(2)}`;
        }
    });
}