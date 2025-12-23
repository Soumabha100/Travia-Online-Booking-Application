document.addEventListener("DOMContentLoaded", () => {
  fetch("destinations.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => renderDestinations(data))
    .catch((error) => {
      console.error("Error loading destinations:", error);
      document.getElementById("destinationContainer").innerHTML = 
        `<div class="text-danger text-center">Failed to load data. Please try again later.</div>`;
    });
});

function renderDestinations(data) {
  const container = document.getElementById("destinationContainer");
  
  container.innerHTML = "";

  // 2. Loop through Continents (Level 1)
  data.forEach((continent) => {
    // Create Wrapper
    const continentDiv = document.createElement("div");
    continentDiv.className = "continent-item";

    // Create Header (Name + Plus Button)
    const header = document.createElement("div");
    header.className = "continent-header";
    header.innerHTML = `
      <span>${continent.name}</span>
      <span class="plus-btn">+</span>
    `;

    // Create Container for Countries
    const countryContainer = document.createElement("div");
    countryContainer.className = "nested-list";

    // 3. Loop through Countries 
    if (continent.countries && continent.countries.length > 0) {
      continent.countries.forEach((country) => {
        const countryDiv = document.createElement("div");
        countryDiv.className = "country-item";

        const countryName = document.createElement("div");
        countryName.className = "country-name";
        countryName.innerText = country.name;

        // Create Container for Places
        const placesList = document.createElement("ul");
        placesList.className = "places-list";

        if (country.places && country.places.length > 0) {
          country.places.forEach((place) => {
            const placeItem = document.createElement("li");
            placeItem.className = "place-item";
            placeItem.innerText = place;
            placesList.appendChild(placeItem);
          });
        }

        // Event: Click Country to toggle Places
        countryName.addEventListener("click", (e) => {
          e.stopPropagation();
          const isVisible = placesList.style.display === "block";
          placesList.style.display = isVisible ? "none" : "block";
        });

        countryDiv.appendChild(countryName);
        countryDiv.appendChild(placesList);
        countryContainer.appendChild(countryDiv);
      });
    }

    header.addEventListener("click", () => {
      header.classList.toggle("active");
      
      const isVisible = countryContainer.style.display === "block";
      countryContainer.style.display = isVisible ? "none" : "block";
    });

    continentDiv.appendChild(header);
    continentDiv.appendChild(countryContainer);
    container.appendChild(continentDiv);
  });
}
