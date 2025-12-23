document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

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


    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        setFormMessage(loginForm, "error", "Invalid username/password combination");
    });

    document.querySelectorAll(".auth-input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters in length");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});


function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".auth-message");
    
    messageElement.textContent = message;
    messageElement.classList.remove("auth-message--success", "auth-message--error");
    messageElement.classList.add(`auth-message--${type}`);
    messageElement.style.display = "block"; 
}

function setInputError(inputElement, message) {
    inputElement.classList.add("auth-input--error");
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("auth-input--error");
    inputElement.parentElement.querySelector(".auth-input-error-message").textContent = "";
}