document.addEventListener("DOMContentLoaded", () => {
  fetch("destinations.json")
    .then((response) => response.json())
    .then((data) => {
      
      const params = new URLSearchParams(window.location.search);
      const searchQuery = params.get("search");

      if (searchQuery) {
        const filteredData = data.map(continent => {
          return {
            ...continent,
            countries: continent.countries.filter(c => 
              c.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          };
        }).filter(continent => continent.countries.length > 0); 

        renderDestinations(filteredData);
      } else {
        // No search? Show everything
        renderDestinations(data);
      }

    })
    .catch((error) => console.error("Error:", error));
});

function renderDestinations(data) {
  const container = document.getElementById("destinationContainer");
  container.innerHTML = ""; // Clear "Loading..." text

  if (data.length === 0) {
    container.innerHTML = '<div class="text-center text-white">No results found.</div>';
    return;
  }

  // 3. Loop through Continents
  data.forEach((continent) => {
    
    // Create Accordion Item
    const continentItem = document.createElement("div");
    continentItem.className = "continent-item";

    // Create Header
    const header = document.createElement("div");
    header.className = "continent-header";
    header.innerHTML = `
      <span>${continent.name}</span>
      <span class="plus-btn"><i class="bi bi-plus-lg"></i></span>
    `;

    // Create Body (Hidden by default)
    const contentBody = document.createElement("div");
    contentBody.className = "nested-list"; 

    // Create Grid
    const cardGrid = document.createElement("div");
    cardGrid.className = "card-grid";

    // 4. Loop through Countries inside Continent
    if (continent.countries) {
      continent.countries.forEach((place) => {
        
        const card = document.createElement("div");
        card.className = "dest-card";
        
        // Use placeholder if image is missing
        const imgSrc = place.image ? place.image : 'https://via.placeholder.com/600';

        card.innerHTML = `
          <div class="dest-card-img-wrapper">
            <img src="${imgSrc}" class="dest-card-img" alt="${place.name}" loading="lazy">
          </div>
          <div class="dest-card-body">
            <div class="dest-card-title">${place.name}</div>
            <div class="dest-card-desc">${place.desc}</div>
            
            <div class="dest-card-footer">
              <div class="dest-price">
                <span>Starting from</span>
                ${place.price}
              </div>
              <button class="btn-book-sm">Book Now</button>
            </div>
          </div>
        `;

        const bookBtn = card.querySelector(".btn-book-sm");
        
        bookBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent the accordion from closing
          // Redirect to booking page with the destination name
          window.location.href = `bookings.html?destination=${encodeURIComponent(place.name)}`;
        });

        cardGrid.appendChild(card);
      });
    }

    // Assemble the parts
    contentBody.appendChild(cardGrid); 
    continentItem.appendChild(header);      
    continentItem.appendChild(contentBody); 
    container.appendChild(continentItem);    

    // 5. Accordion Toggle Logic
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