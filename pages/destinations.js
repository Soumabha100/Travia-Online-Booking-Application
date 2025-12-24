document.addEventListener("DOMContentLoaded", () => {
  fetch("destinations.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load data");
      return response.json();
    })
    .then((data) => renderDestinations(data))
    .catch((error) => {
      console.error(error);
      document.getElementById("destinationContainer").innerHTML = 
        `<div class="text-center text-danger">Failed to load destinations.</div>`;
    });
});

function renderDestinations(data) {
  const container = document.getElementById("destinationContainer");
  container.innerHTML = "";

  data.forEach((continent) => {
    
    const continentItem = document.createElement("div");
    continentItem.className = "continent-item";

    const header = document.createElement("div");
    header.className = "continent-header";
    header.innerHTML = `
      <span>${continent.name}</span>
      <span class="plus-btn"><i class="bi bi-plus-lg"></i></span>
    `;

    const contentBody = document.createElement("div");
    contentBody.className = "nested-list"; 

    const cardGrid = document.createElement("div");
    cardGrid.className = "card-grid";

    if (continent.countries && continent.countries.length > 0) {
      continent.countries.forEach((place) => {
        
        const card = document.createElement("div");
        card.className = "dest-card";
        
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

        cardGrid.appendChild(card);
      });
    }

    contentBody.appendChild(cardGrid); 
    continentItem.appendChild(header);      
    continentItem.appendChild(contentBody); 
    container.appendChild(continentItem);    

    header.addEventListener("click", () => {
      // Toggle 'active' class
      header.classList.toggle("active");
      
      // Handle Icon Rotation (Plus <-> Dash)
      const icon = header.querySelector(".plus-btn i");
      if (header.classList.contains("active")) {
        icon.classList.replace("bi-plus-lg", "bi-dash-lg");
        contentBody.style.display = "block"; // Show
      } else {
        icon.classList.replace("bi-dash-lg", "bi-plus-lg");
        contentBody.style.display = "none"; // Hide
      }
    });
  });
}