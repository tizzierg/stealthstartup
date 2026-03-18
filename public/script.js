const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form && statusEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Sending…";

    const data = new URLSearchParams(new FormData(form));

    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
      });

      if (!res.ok) {
        let text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json && json.error) {
            statusEl.textContent = json.error;
            return;
          }
        } catch (parseErr) {
          // not JSON
        }
        statusEl.textContent = "Server error: " + (text ? text : res.statusText);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        if (json.success) {
          form.reset();
          statusEl.textContent = "Message sent — thank you.";
        } else {
          statusEl.textContent = json.error ? json.error : "Something went wrong.";
        }
      } else {
        statusEl.textContent = "Unexpected server response. Please try again.";
      }
    } catch (err) {
      statusEl.textContent = "Network error.";
      console.error("Contact submit failed:", err);
    }
  });
}
