document.addEventListener("DOMContentLoaded", () => {
        // 1. Check Authentication
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userStr || !token) {
          // If not logged in, redirect to home immediately
          window.location.replace("index.html"); 
          return;
        }

        const user = JSON.parse(userStr);

        // 2. Populate Data safely
        const nameEl = document.getElementById("pageProfileName");
        const emailEl = document.getElementById("pageProfileEmail");
        const idEl = document.getElementById("pageProfileId");
        const avatarEl = document.getElementById("pageProfileAvatar");

        if(nameEl) nameEl.textContent = user.username || "Traveler";
        if(emailEl) emailEl.textContent = user.email || "";
        if(idEl) idEl.textContent = "#" + (user.memberId || Math.floor(1000 + Math.random() * 9000));
        
        if (user.avatar && avatarEl) {
            avatarEl.src = user.avatar;
        }

        // 3. Logout Logic
        const logoutBtn = document.getElementById("logoutBtnPage");
        if(logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "index.html";
            });
        }
      });