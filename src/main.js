const form = document.getElementById("login-form");
const statusEl = document.getElementById("login-status");
const signupLink = document.getElementById("signup-link");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.classList.remove("is-error", "is-success");
  if (type) {
    statusEl.classList.add(type);
  }
}

function validateField(input) {
  const valid = input.checkValidity();
  input.classList.toggle("is-invalid", !valid);
  return valid;
}

form.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) {
    event.target.classList.remove("is-invalid");
    if (statusEl.classList.contains("is-error")) {
      setStatus("");
    }
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  const password = String(data.get("password") || "");

  const emailInput = form.elements.namedItem("email");
  const passwordInput = form.elements.namedItem("password");

  const emailOk = emailInput instanceof HTMLInputElement && validateField(emailInput);
  const passwordOk =
    passwordInput instanceof HTMLInputElement && validateField(passwordInput);

  if (!emailOk || !passwordOk) {
    setStatus("Check your email and password, then try again.", "is-error");
    return;
  }

  // Front-end shell only — wire this to auth when backend is ready.
  console.info("Login submitted", { email, passwordLength: password.length });
  setStatus("Signed in locally. Auth backend coming next.", "is-success");
  form.reset();
});

signupLink.addEventListener("click", (event) => {
  event.preventDefault();
  setStatus("Account creation will open here next.", "");
});
