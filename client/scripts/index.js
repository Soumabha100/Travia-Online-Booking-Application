// === HELPER FUNCTIONS ===
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return; 

    const toast = document.createElement("div");
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
    // Find the error message div next to the input
    const errorDiv = inputElement.parentElement.querySelector(".auth-input-error-message");
    if (errorDiv) errorDiv.textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("auth-input--error");
    const errorDiv = inputElement.parentElement.querySelector(".auth-input-error-message");
    if (errorDiv) errorDiv.textContent = "";
}

// Function to validate a single input (Extracted logic so we can use it on Submit too)
function validateInput(inputElement) {
    const val = inputElement.value.trim();
    const id = inputElement.id;
    const type = inputElement.type;

    // 1. Required Check
    if (val.length === 0) {
        setInputError(inputElement, "This Field is Required");
        return false;
    }

    // 2. Specific Logic
    if (id === "signupUsername" && val.length < 10) {
        setInputError(inputElement, "Username must be at least 10 characters");
        return false;
    }

    if (type === "password" && val.length < 8) {
        setInputError(inputElement, "Password must be at least 8 characters");
        return false;
    }

    if (type === "email" && !val.includes("@")) {
        setInputError(inputElement, "Please enter a valid email address");
        return false;
    }

    clearInputError(inputElement);
    return true;
}

// === MAIN LOGIC ===
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const authModalElement = document.querySelector("#authModal");
    
    let authModal;
    if (authModalElement) {
        authModal = new bootstrap.Modal(authModalElement);
        
        // Reset when closed
        authModalElement.addEventListener("hidden.bs.modal" , () => {
            loginForm.reset();
            createAccountForm.reset();
            document.querySelectorAll(".auth-input").forEach(input => clearInputError(input));
            
            // Default to login view
            loginForm.classList.remove("auth-form--hidden");
            createAccountForm.classList.add("auth-form--hidden");
        });
    }

    // Toggle Forms
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("auth-form--hidden");
        createAccountForm.classList.remove("auth-form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("auth-form--hidden");
        createAccountForm.classList.add("auth-form--hidden");
    });

    // === REAL-TIME VALIDATION) ===
    document.querySelectorAll(".auth-input").forEach(inputElement => {
        // Clear error when typing
        inputElement.addEventListener("input", () => clearInputError(inputElement));
        // Strict validation on blur
        inputElement.addEventListener("blur", () => validateInput(inputElement));
    });

    // === GENERIC SUBMIT HANDLER (Optimized) ===
    const handleAuthSubmit = async (e, form, url, isRegister) => {
        e.preventDefault();

        // 1. Final Validation Check: Run validation on ALL fields
        const inputs = Array.from(form.querySelectorAll(".auth-input"));
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) isValid = false;
        });

        if (!isValid) {
            showToast("Please fix the errors before continuing", "error");
            return;
        }

        // 2. Collect Data using FormData (Cleaner than inputs[0])
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        // 3. Extra Check: Confirm Password (for Registration)
        if (isRegister) {
            const confirmPassInput = form.querySelector('input[name="confirmPassword"]');
            if (payload.password !== payload.confirmPassword) {
                setInputError(confirmPassInput, "Passwords do not match");
                showToast("Passwords do not match", "error");
                return;
            }
        }

        // 4. Send Request
        try {
            const btn = form.querySelector("button[type='submit']");
            const originalText = btn.textContent;
            btn.disabled = true; 
            btn.textContent = "Processing...";

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            btn.disabled = false;
            btn.textContent = originalText;

            if (!response.ok) {
                showToast(data.message || "Error occurred", "error");
                return;
            }

            // 5. Success Handling
            if (isRegister) {
                showToast("Account Created! Please Sign In.", "success");
                form.reset();
                document.querySelector("#linkLogin").click();
            } else {
                showToast(`Welcome back, ${data.user.username}!`, "success");
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (authModal) authModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            }

        } catch (error) {
            console.error("Auth Error:", error);
            showToast("Server unavailable. Please try again later.", "error");
            form.querySelector("button[type='submit']").disabled = false;
        }
    };

    // Attach Handlers
    loginForm.addEventListener("submit", (e) => handleAuthSubmit(e, loginForm, window.TraviaAPI.auth.login, false));
    createAccountForm.addEventListener("submit", (e) => handleAuthSubmit(e, createAccountForm, window.TraviaAPI.auth.register, true));
});