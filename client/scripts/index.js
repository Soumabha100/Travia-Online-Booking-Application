function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return; 

    const toast = document.createElement("div");
    
    // Choose icon
    const icon = type === "success" ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-x-circle-fill"></i>';
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("auth-input--error");
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("auth-input--error");
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = "";
}


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const authModalElement = document.querySelector("#authModal");
    
    // Initialize Bootstrap Modal (safely)
    let authModal;
    if (authModalElement) {
        authModal = new bootstrap.Modal(authModalElement);
    }

    // === 1. MODAL & TAB SWITCHING LOGIC ===
    
    // When modal is closed, reset everything
    if (authModalElement) {
        authModalElement.addEventListener("hidden.bs.modal" , () => {
            loginForm.reset();
            createAccountForm.reset();

            document.querySelectorAll(".auth-input").forEach(input => {
                clearInputError(input);
            });

            // Reset to default view (Login)
            loginForm.classList.remove("auth-form--hidden");
            createAccountForm.classList.add("auth-form--hidden");
        });
    }

    // Switch to "Create Account"
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("auth-form--hidden");
        createAccountForm.classList.remove("auth-form--hidden");
    });

    // Switch to "Login"
    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("auth-form--hidden");
        createAccountForm.classList.add("auth-form--hidden");
    });


    // === 2. LOGIN LOGIC (Real Backend) ===
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = loginForm.querySelector(".auth-input[type='email']");
        const passwordInput = loginForm.querySelector(".auth-input[type='password']");
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if(!email || !password) {
             showToast("Please fill in all fields", "error");
             return;
        }

        try {
            const response = await fetch(window.TraviaAPI.auth.login, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            // Safety: Check if response is actually JSON (handles 404/500 errors gracefully)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server Error: Received non-JSON response.");
            }

            const data = await response.json();

            if (response.ok) {
                // Success
                showToast(`Welcome back, ${data.user.username}!`, "success");
                
                // Store Token
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // Close Modal & Reload
                if(authModal) authModal.hide();
                setTimeout(() => window.location.reload(), 1500);

            } else {
                // Backend Error Message
                showToast(data.message || "Invalid email or password", "error");
            }
        } catch (error) {
            console.error("Login Error:", error);
            showToast("Server unavailable. Please try again later.", "error");
        }
    });


    // === 3. REGISTRATION LOGIC (Real Backend) ===
    createAccountForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const inputs = createAccountForm.querySelectorAll("input");
        // Assuming order: Username, Email, Password, Confirm Password
        const username = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const password = inputs[2].value.trim();
        const confirmPassword = inputs[3].value.trim();

        // Check Passwords Match
        if (password !== confirmPassword) {
            setInputError(inputs[3], "Passwords do not match");
            showToast("Passwords do not match", "error");
            return;
        }

        try {
            const response = await fetch(window.TraviaAPI.auth.register, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            // Safety: Check for JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server Error: Received non-JSON response.");
            }

            const data = await response.json();

            if (response.ok) {
                showToast("Account Created! Please Sign In.", "success");
                createAccountForm.reset();
                
                // Switch to Login Tab automatically
                setTimeout(() => {
                    document.querySelector("#linkLogin").click();
                }, 1500);
            } else {
                showToast(data.message || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            showToast("Server error. Try again later.", "error");
        }
    });


    // === 4. INPUT VALIDATION (Your Original Logic) ===
    document.querySelectorAll(".auth-input").forEach(inputElement => {
        
        // Clear errors when typing
        inputElement.addEventListener("input", () => {
            clearInputError(inputElement);
        });

        // Validate on blur
        inputElement.addEventListener("blur", () => {
            const val = inputElement.value.trim();

            if(val.length === 0) {
                setInputError(inputElement, "This Field is Required");
                return;
            }

            if (inputElement.id === "signupUsername" && val.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters");
            }

            if (inputElement.type === "password" && val.length < 8) {
                setInputError(inputElement, "Password must be at least 8 characters");
            }

            if (inputElement.type === "email" && !val.includes("@")) {
                setInputError(inputElement, "Please enter a valid email address");
            }
        });
    });
});