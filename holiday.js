document.addEventListener("DOMContentLoaded", () => {
  fetch("holidays.json")
    .then((response) => response.json())
    .then((holidays) => checkHolidays(holidays))
    .catch((error) => console.error("Error loading holidays:", error));
});

function checkHolidays(holidays) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const messageBox = document.getElementById("holidayMessage");

  // Check if today is a holiday
  const todayHoliday = holidays.find((holiday) => holiday.date === todayStr);

  if (todayHoliday) {
    messageBox.innerHTML = `
      🎉 <strong>Today is ${todayHoliday.name}!</strong>
      <span class="ms-2">Enjoy your holiday ✨</span>
    `;
    messageBox.classList.add("today-holiday");
    return;
  }

  // Find upcoming holidays
  const upcoming = holidays
    .filter((holiday) =>new Date(holiday.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (upcoming.length > 0) {
    messageBox.innerHTML = `
      📅 <strong>Upcoming Holidays:</strong>
      <ul class="mt-2">
        ${upcoming
          .map((h) => {
            const daysLeft = getDaysLeft(h.date);

            return `
    <li>
      ${h.name} —
      <span>${formatDate(h.date)}</span>
      <small class="ms-2 text-muted">
        (${daysLeft} day${daysLeft > 1 ? "s" : ""} left)
      </small>
    </li>
  `;
          })
          .join("")}
      </ul>
    `;
  } else {
    messageBox.innerHTML = `No upcoming holidays 🎒`;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysLeft(dateStr) {
  const today = new Date();
  const holidayDate = new Date(dateStr);

  // Remove time part for accurate day calculation
  today.setHours(0, 0, 0, 0);
  holidayDate.setHours(0, 0, 0, 0);

  const diffTime = holidayDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

console.log("Filtered holidays:", upcoming);