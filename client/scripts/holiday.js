document.addEventListener("DOMContentLoaded", () => {
  fetch("/client/holidays.json")
    .then((response) => response.json())
    .then((holidays) => loadHolidays(holidays))
    .catch((error) => console.error("Error:", error));
});

function loadHolidays(holidays) {
  const container = document.getElementById("holidayMessage");
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todayHoliday = holidays.find((h) => h.date === todayStr);

  const upcoming = holidays
    .filter((h) => new Date(h.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  let html = `<div class="holiday-container">`;
  html += `<h3>📅 Upcoming Breaks & Offers</h3>`;
  html += `<div class="holiday-list">`;

  if (todayHoliday) {
    html += createCardHtml(todayHoliday, true);
  }

  if (upcoming.length > 0) {
    upcoming.forEach((h) => {
      html += createCardHtml(h, false);
    });
  } else {
    html += `<p style="color:#b5c7d3;">No upcoming holidays found.</p>`;
  }

  html += `</div></div>`; 
  
  container.innerHTML = html;
  container.classList.remove("holiday-box");
}

function createCardHtml(holiday, isToday) {
  const dateObj = new Date(holiday.date);
  const dateText = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  

  let offerText = "Book early to save 10%!";
  const day = dateObj.getDay();
  
  if (day === 1 || day === 5) {
    offerText = "Long Weekend Deal: Stay 3 Nights, Pay for 2!";
  } else if (holiday.name.includes("New Year")) {
    offerText = "New Year Bash: Party Packs Available 🎆";
  }
  else if (holiday.name.includes("Christmas")) {
    offerText = "Ho Ho Ho ! Save 25% Off For Christmas! 🎆";
  }

  // Return the HTML string
  return `
    <div class="holiday-card ${isToday ? "today" : ""}">
      <div class="holiday-date">
        ${isToday ? "Happening Now" : dateText}
      </div>
      <div class="holiday-name">
        ${holiday.name} ${isToday ? "🎉" : ""}
      </div>
      <div class="holiday-offer">
        <span>Offer:</span> ${offerText}
      </div>
    </div>
  `;
}