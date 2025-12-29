document.addEventListener("DOMContentLoaded", async () => {
    // 1. GET THE DESTINATION FROM URL
    // Example: bookings.html?destination=Japan -> destinationName = "Japan"
    const params = new URLSearchParams(window.location.search);
    const destinationName = params.get("destination");

    // Safety Check: If no destination is provided, stop or show default
    if (!destinationName) {
        console.warn("No destination specified in URL.");
        // Optional: window.location.href = "destinations.html"; // Redirect back
        return; 
    }

    try {
        // 2. FETCH DATA FROM JSON ("BACKEND")
        const response = await fetch("destinations.json");
        const data = await response.json();
        
        // 3. FIND THE MATCHING COUNTRY OBJECT
        let selectedPlace = null;
        
        // Our JSON is structured by Continents, so we loop through them first
        for (const continent of data) {
            // .find() looks for the first item that matches the condition
            const found = continent.countries.find(c => c.name === destinationName);
            if (found) {
                selectedPlace = found;
                break; // Stop searching once found
            }
        }

        // 4. UPDATE THE PAGE CONTENT
        if (selectedPlace) {
            updatePageContent(selectedPlace);
        } else {
            console.error("Destination not found in database:", destinationName);
            document.querySelector(".booking-section").innerHTML = 
                `<div class="container text-center py-5"><h2>Destination Not Found</h2><a href="destinations.html" class="btn btn-primary">Go Back</a></div>`;
        }

    } catch (error) {
        console.error("Error loading tour data:", error);
    }
});

// === LOGIC TO UPDATE HTML ELEMENTS ===
function updatePageContent(place) {
    // A. Update Text Headers
    document.title = `Booking ${place.name} | Travia`;
    document.getElementById("breadcrumb-current").textContent = place.name;
    document.getElementById("tour-title").textContent = `${place.name} Explorer`;
    
    // B. Update Description (Handle missing desc gracefully)
    document.getElementById("tour-desc").textContent = place.desc || "Experience an unforgettable journey to this amazing destination.";

     document.getElementById("tour-city").textContent = `${place.city} , ${place.name}`
    
    // C. Update Prices
    document.getElementById("tour-price").textContent = place.price;
    document.getElementById("base-total").textContent = place.price;
    console.log(place.price)
    
    // D. Update Image
    const imgElement = document.getElementById("tour-image");
    if (place.image) {
        imgElement.src = place.image;
        imgElement.alt = place.name;
    }

    // E. SETUP DYNAMIC PRICING LOGIC
    // We need to convert "$1,200" string into the number 1200 for math.
    // .replace(/[^0-9]/g, '') removes '$' and ',' leaving only digits.
    const numericPrice = parseInt(place.price.replace(/[^0-9]/g, '')) || 0;
    
    // Store this base price in the DOM (HTML) so the calculator function can access it later
    // 'dataset.basePrice' corresponds to <input data-base-price="1200">
    const guestInput = document.getElementById("guestCount");
    guestInput.dataset.basePrice = numericPrice;
    
    // F. Run the calculator once to set initial totals
    updateGuests(0); 
}

// === CALCULATOR LOGIC ===
// This function is called by the +/- buttons in HTML
// It must be attached to the 'window' object to be accessible from onclick="..." attributes
window.updateGuests = function(change) {
    const input = document.getElementById("guestCount");
    let count = parseInt(input.value);
    
    // Apply the change (+1 or -1)
    if (change !== 0) count += change;
    
    // Enforce Limits (Min 1, Max 10)
    if (count < 1) count = 1;
    if (count > 10) count = 10;
    
    // Update the input field value
    input.value = count;
    
    // --- PRICE CALCULATION ---
    // 1. Retrieve the base price we stored earlier
    const basePrice = parseInt(input.dataset.basePrice) || 0;
    const serviceFee = 50; // Fixed fee
    
    // 2. Calculate Totals
    const subtotal = basePrice * count;
    const finalTotal = subtotal + serviceFee;
    
    // 3. Update the UI Text
    // .toLocaleString() adds commas back (e.g., 3000 -> "3,000")
    document.getElementById("base-calc").textContent = `$${basePrice.toLocaleString()} x ${count} guest${count > 1 ? 's' : ''}`;
    document.getElementById("base-total").textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById("final-total").textContent = `$${finalTotal.toLocaleString()}`;
}