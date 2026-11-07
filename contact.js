const form = document.querySelector("[data-contact-form]");
const submitButton = document.querySelector("[data-contact-submit]");
const status = document.querySelector("[data-form-status]");

// ─── Aceternity UI Cursor Spotlight on form elements ───────────────────────────
document.querySelectorAll("[data-glow-wrap]").forEach((wrap) => {
  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    wrap.style.setProperty("--gx", `${x}px`);
    wrap.style.setProperty("--gy", `${y}px`);
    wrap.style.setProperty("--glow-opacity", "1");
  });

  wrap.addEventListener("mouseleave", () => {
    wrap.style.setProperty("--glow-opacity", "0");
  });
});

// ─── Custom validation with clean, friendly messages ───────────────────────────
function validateForm() {
  let valid = true;
  let firstInvalid = null;

  form.querySelectorAll("[data-cf-input]").forEach((input) => {
    const errorEl = input.closest(".cf-label")?.querySelector("[data-cf-error]");
    const wrap = input.closest("[data-glow-wrap]");
    if (!input.value.trim()) {
      valid = false;
      if (!firstInvalid) firstInvalid = input;
      if (errorEl) errorEl.classList.add("is-visible");
      if (wrap) wrap.classList.add("has-error");
    } else {
      if (errorEl) errorEl.classList.remove("is-visible");
      if (wrap) wrap.classList.remove("has-error");
    }
  });

  // Email format verification
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput && emailInput.value.trim() && !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
    const errorEl = emailInput.closest(".cf-label")?.querySelector("[data-cf-error]");
    const wrap = emailInput.closest("[data-glow-wrap]");
    if (errorEl) {
      errorEl.textContent = "Please provide your email address so I can reply!";
      errorEl.classList.add("is-visible");
    }
    if (wrap) wrap.classList.add("has-error");
    if (!firstInvalid) firstInvalid = emailInput;
    valid = false;
  }

  if (firstInvalid) {
    firstInvalid.focus();
  }

  return valid;
}

form?.querySelectorAll("[data-cf-input]").forEach((input) => {
  input.addEventListener("input", () => {
    const errorEl = input.closest(".cf-label")?.querySelector("[data-cf-error]");
    const wrap = input.closest("[data-glow-wrap]");
    if (input.value.trim()) {
      if (errorEl) errorEl.classList.remove("is-visible");
      if (wrap) wrap.classList.remove("has-error");
    }
  });
});

// ─── Form submit handler ────────────────────────────────────────────────────────
form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    if (status) {
      status.style.color = "#ef4444";
      status.textContent = "Please fill in the required fields above.";
    }
    return;
  }

  submitButton?.setAttribute("disabled", "");
  form.classList.remove("is-sent", "has-error");
  if (status) {
    status.style.color = "var(--wine-light)";
    status.textContent = "Sending…";
  }

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Message could not be sent");
    form.reset();
    form.classList.add("is-sent");
    if (status) {
      status.style.color = "#ff4081";
      status.textContent = "Message sent successfully! ✉️";
    }
  } catch {
    form.classList.add("has-error");
    if (status) {
      status.style.color = "#ef4444";
      status.textContent = "Could not send automatically. Please email kssgubenko@gmail.com directly.";
    }
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});

// ─── Copy email address handler ────────────────────────────────────────────────
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = btn.dataset.copy || "kssgubenko@gmail.com";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.classList.add("is-copied");

    // Toast feedback
    const toast = document.createElement("div");
    toast.className = "contact-toast";
    toast.textContent = "Email copied to clipboard! 📋";
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    setTimeout(() => {
      btn.classList.remove("is-copied");
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  });
});

// ─── Social placeholder links ──────────────────────────────────────────────────
document.querySelectorAll("[data-social-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});
