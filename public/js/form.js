document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = form.querySelector(".submit-btn");
    const errorEl = form.querySelector(".form-error");
    const originalText = btn.textContent;

    // Clear error
    if (errorEl) errorEl.style.display = "none";

    // Validate
    const name = form.querySelector('[name="name"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const service = form.querySelector('[name="serviceType"]').value;
    const zipCode = form.querySelector('[name="zipCode"]').value.trim();
    const citySlug = form.dataset.city || "";
    const serviceSlug = form.dataset.service || "";

    if (!name || !phone || !email || !service || !zipCode) {
      if (errorEl) {
        errorEl.textContent = "Please fill in all fields.";
        errorEl.style.display = "block";
      }
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorEl) {
        errorEl.textContent = "Please enter a valid email address.";
        errorEl.style.display = "block";
      }
      return;
    }

    // Simple phone validation (at least 10 digits)
    if (phone.replace(/\D/g, "").length < 10) {
      if (errorEl) {
        errorEl.textContent = "Please enter a valid phone number.";
        errorEl.style.display = "block";
      }
      return;
    }

    // Zip code validation
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      if (errorEl) {
        errorEl.textContent = "Please enter a valid ZIP code.";
        errorEl.style.display = "block";
      }
      return;
    }

    // Submit
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Submitting...';

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          service: serviceSlug,
          serviceType: service,
          zipCode,
          city: citySlug
        })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = `/${serviceSlug}/${citySlug}/thank-you`;
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = originalText;
      if (errorEl) {
        errorEl.textContent = "Something went wrong. Please try again or call us directly.";
        errorEl.style.display = "block";
      }
    }
  });

  // Phone number auto-formatting
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "").slice(0, 10);
      if (digits.length >= 6) {
        this.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length >= 3) {
        this.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      }
    });
  }
});
