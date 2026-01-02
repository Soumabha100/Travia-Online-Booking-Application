document.addEventListener("DOMContentLoaded", () => {
  const API_URL = window.TraviaAPI.destinations;

  fetch(API_URL)
    .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
    })
    .then((data) => {
      const params = new URLSearchParams(window.location.search);
      const searchQuery = params.get("search");

      if (searchQuery) {
        // Filter logic remains the same
        const filteredData = data
          .map((continent) => {
            return {
              ...continent,
              countries: continent.countries.filter((tour) =>
                tour.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                tour.name.toLowerCase().includes(searchQuery.toLowerCase())
              ),
            };
          })
          .filter((continent) => continent.countries.length > 0);

        renderDestinations(filteredData);
      } else {
        renderDestinations(data);
      }
    })
    .catch((error) => {
        console.error("Error:", error);
        document.getElementById("destinationContainer").innerHTML = 
            `<div class="text-center text-white mt-5">
                <h3>System Offline</h3>
                <p>Please check your backend connection.</p>
             </div>`;
    });
});

function renderDestinations(data) {
  const container = document.getElementById("destinationContainer");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = '<div class="text-center text-white">No results found.</div>';
    return;
  }

  data.forEach((continent) => {
    const continentItem = document.createElement("div");
    continentItem.className = "continent-item";

    const header = document.createElement("div");
    header.className = "continent-header active";
    header.innerHTML = `<span>${continent.name}</span><span class="plus-btn"><i class="bi bi-dash-lg"></i></span>`;

    const contentBody = document.createElement("div");
    contentBody.className = "nested-list";
    contentBody.style.display = "block";

    const cardGrid = document.createElement("div");
    cardGrid.className = "card-grid";

    if (continent.countries) {
      continent.countries.forEach((place) => {
        const card = document.createElement("div");
        card.className = "dest-card";

        // BADGES
        const trendingBadge = place.isTrending 
            ? `<span class="badge bg-danger position-absolute top-0 start-0 m-3 shadow-sm">🔥 Trending</span>` : '';
        const visaBadge = place.visa 
            ? `<span class="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-3 shadow-sm"><i class="bi bi-passport"></i> ${place.visa}</span>` : '';
        
        const imgUrl = place.image || '../public/assets/Travia.png';

        card.innerHTML = `
          <div class="dest-card-img-wrapper position-relative">
            <img src="${imgUrl}" class="dest-card-img" alt="${place.city}" 
                 loading="lazy" onerror="this.src='../public/assets/Travia.png'">
            ${trendingBadge}
            ${visaBadge}
          </div>
          <div class="dest-card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <div class="dest-card-title text-truncate" style="max-width: 170px;" title="${place.city}">
                        ${place.city}
                    </div>
                    <small class="text-muted"><i class="bi bi-geo-alt-fill text-primary"></i> ${place.name} • ${place.duration}</small>
                </div>
                <div class="d-flex align-items-center bg-light border rounded px-2 py-1">
                    <i class="bi bi-star-fill text-warning small me-1"></i>
                    <span class="fw-bold small">${place.rating}</span>
                </div>
            </div>
            <p class="dest-card-desc text-muted small flex-grow-1">${place.desc}</p>
            <div class="d-flex gap-2 mb-3">
                <span class="badge bg-light text-dark border fw-normal"><i class="bi bi-people-fill"></i> ${place.groupSize}</span>
                <span class="badge bg-light text-dark border fw-normal"><i class="bi bi-cash-coin"></i> ${place.currency}</span>
            </div>
            <div class="dest-card-footer mt-auto border-top pt-3 d-flex justify-content-between align-items-center">
              <div><small class="text-muted d-block">Total Price</small><div class="fw-bold fs-5 text-primary">${place.price}</div></div>
              <button class="btn btn-primary btn-sm rounded-pill px-3 btn-book-sm">View Deal</button>
            </div>
          </div>
        `;
        
        // Ensure the button links to bookings
        card.querySelector(".btn-book-sm").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `bookings.html?destination=${encodeURIComponent(place.city)}`;
        });

        cardGrid.appendChild(card);
      });
    }
    contentBody.appendChild(cardGrid);
    continentItem.appendChild(header);
    continentItem.appendChild(contentBody);
    container.appendChild(continentItem);
    
    // Accordion Logic
    header.addEventListener("click", () => {
      header.classList.toggle("active");
      const icon = header.querySelector(".plus-btn i");
      if (header.classList.contains("active")) {
          icon.classList.replace("bi-plus-lg", "bi-dash-lg");
          contentBody.style.display = "block";
      } else {
          icon.classList.replace("bi-dash-lg", "bi-plus-lg");
          contentBody.style.display = "none";
      }
    });
  });
}