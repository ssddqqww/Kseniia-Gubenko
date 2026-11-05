const form = document.querySelector("[data-contact-form]");
const submitButton = document.querySelector("[data-contact-submit]");
const status = document.querySelector("[data-form-status]");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton?.setAttribute("disabled", "");
  form.classList.remove("is-sent", "has-error");
  if (status) status.textContent = "Sending…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Message could not be sent");
    form.reset();
    form.classList.add("is-sent");
    if (status) status.textContent = "Message sent — thank you.";
  } catch {
    form.classList.add("has-error");
    if (status) status.textContent = "Could not send automatically. Please email kssgubenko@gmail.com.";
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});

document.querySelectorAll("[data-social-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});
