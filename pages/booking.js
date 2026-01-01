document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const destinationName = params.get("destination");

    if (!destinationName) {
        console.warn("No destination specified.");
        return; 
    }

    const API_URL = window.TraviaAPI.destinations;

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error("Could not connect to Backend API");
        }

        const data = await response.json();
        let selectedPlace = null;
        
        for (const continent of data) {
            const found = continent.countries.find(c => c.name === destinationName);
            if (found) {
                selectedPlace = found;
                break; 
            }
        }

        if (selectedPlace) {
            updatePageContent(selectedPlace);
        } else {
            document.querySelector(".booking-section").innerHTML = 
                `<div class="container text-center py-5">
                    <h2>Destination Not Found</h2>
                    <p class="text-muted">We couldn't find "${destinationName}" in our database.</p>
                    <a href="destinations.html" class="btn btn-primary mt-3">Go Back</a>
                 </div>`;
        }

    } catch (error) {
        console.error("Error loading tour data:", error);
        document.querySelector(".booking-section").innerHTML = 
            `<div class="container text-center py-5 text-danger">
                <h3>Server Error</h3>
                <p>Ensure your backend (node server.js) is running on port 5000.</p>
             </div>`;
    }
});

// === LOGIC TO UPDATE HTML ELEMENTS ===
function updatePageContent(place) {
  // A. Update Text Headers
  document.title = `Booking ${place.name} | Travia`;
  document.getElementById("breadcrumb-current").textContent = place.name;
  document.getElementById("tour-title").textContent = `${place.name} Explorer`;

  // B. Update Description (Handle missing desc gracefully)
  document.getElementById("tour-desc").textContent =
    place.longDesc ||
    "Experience an unforgettable journey to this amazing destination.";

  document.getElementById(
    "tour-city"
  ).textContent = `${place.city} , ${place.name}`;
  document.getElementById(
    "tour-rating"
  ).textContent = `${place.rating} (${place.reviews})`;

  // C. Update Prices
  document.getElementById("tour-price").textContent = place.price;
  document.getElementById("base-total").textContent = place.price;
  console.log(place.price);

  // D. Update Image
  const imgElement = document.getElementById("tour-image");
  if (place.image) {
    imgElement.src = place.image;
    imgElement.alt = place.name;
  }

  const highlightBoxes = document.querySelectorAll(".highlight-box");
  highlightBoxes.forEach((box) => {
    const header = box.querySelector("h5").textContent.trim();
    const valueP = box.querySelector("p");

    if (header === "Duration" && place.duration) {
      valueP.textContent = place.duration;
    } else if (header === "Group Size" && place.groupSize) {
      valueP.textContent = place.groupSize;
    }
  });

  // E. SETUP DYNAMIC PRICING LOGIC
  // We need to convert "$1,200" string into the number 1200 for math.
  // .replace(/[^0-9]/g, '') removes '$' and ',' leaving only digits.
  const numericPrice = parseInt(place.price.replace(/[^0-9]/g, "")) || 0;

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
window.updateGuests = function (change) {
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
  document.getElementById(
    "base-calc"
  ).textContent = `$${basePrice.toLocaleString()} x ${count} guest${
    count > 1 ? "s" : ""
  }`;
  document.getElementById(
    "base-total"
  ).textContent = `$${subtotal.toLocaleString()}`;
  document.getElementById(
    "final-total"
  ).textContent = `$${finalTotal.toLocaleString()}`;
};
