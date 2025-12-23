document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const authModal = document.querySelector("#authModal");

    authModal.addEventListener("hidden.bs.modal" , () => {

        loginForm.reset();
        createAccountForm.reset();

        document.querySelectorAll(".auth-input").forEach(input => {
            clearInputError(input);
        });

        document.querySelectorAll(".auth-message").forEach(msg => {
            msg.style.display = "none";
            msg.textContent = "";
            msg.classList.remove("auth-message--error", "auth-message--success");
        });

        loginForm.classList.remove("auth-form--hidden");
        createAccountForm.classList.add("auth-form--hidden");
    });

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

  // Login check!
    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        // simulated values for demonstration
        const emailInput = loginForm.querySelector(".auth-input[type='email']");
        const passwordInput = loginForm.querySelector(".auth-input[type='password']");
        
        if (emailInput.value === "user@gmail.com" && passwordInput.value === "password123") {
            setFormMessage(loginForm, "success", "Login Successful! Redirecting...");
        }
        else if(!emailInput.value.includes("@") || emailInput.value.length < 6) {
            setInputError(emailInput, "Please enter a valid email");
        }
            else {
            setFormMessage(loginForm, "error", "Invalid username/password combination");
        }
    });

    // === 3. Input Validation Logic (Length & Format) ===
    document.querySelectorAll(".auth-input").forEach(inputElement => {
        
        // A. Clear errors immediately when user starts typing
        inputElement.addEventListener("input", () => {
            clearInputError(inputElement);
        });

        inputElement.addEventListener("blur", () => {
            const val = inputElement.value.trim();

            if(val.length === 0) {
                setInputError(inputElement, "This Field is Required");
                
            }

            // 1. Check Username Length (Example: < 10 chars)
            if (inputElement.id === "signupUsername" && val.length > 0 && val.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters");
            }

            // 2. Check Password Length (Example: < 8 chars)
            if (inputElement.type === "password" && val.length > 0 && val.length < 8) {
                setInputError(inputElement, "Password must be at least 8 characters");
            }

            // 3. Check Email Format
            if (inputElement.type === "email" && val.length > 0 && !val.includes("@")) {
                setInputError(inputElement, "Please enter a valid email address");
            }
        });
    });
});


function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".auth-message");

    messageElement.textContent = message;
    messageElement.classList.remove("auth-message--success", "auth-message--error");
    messageElement.classList.add(`auth-message--${type}`);
    
    // Make sure the message is visible
    messageElement.style.display = "block"; 
}

function setInputError(inputElement, message) {
    // 1. Turn border red
    inputElement.classList.add("auth-input--error");
    // 2. Find the error text div right below the input and set text
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    // 1. Remove red border
    inputElement.classList.remove("auth-input--error");
    // 2. Clear the error text
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = "";
}