// main.js - Common functionality for all pages
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
  const role = localStorage.getItem("role");
  if (role === "admin") {
    const adminMenu = document.getElementById("adminMenu");
    if (adminMenu) adminMenu.style.display = "block";
  }
});
