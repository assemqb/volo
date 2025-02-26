// auth.js - Login and Registration
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access_token", data.access_token);
        const profileRes = await fetch("http://localhost:8000/api/users/me", {
          headers: { Authorization: "Bearer " + data.access_token },
        });
        const profile = await profileRes.json();
        if (profileRes.ok) {
          localStorage.setItem("nickname", profile.nickname);
          localStorage.setItem("role", profile.role);
        }
        window.location.href = "index.html";
      } else {
        alert(data.detail || "Login failed!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed!");
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("phone").value;
    const nickname = document.getElementById("nickname").value;
    const full_name = document.getElementById("full_name").value;
    const age = parseInt(document.getElementById("age").value);
    const languages = document.getElementById("languages").value.split(",").map(l => l.trim());
    const experience = document.getElementById("experience").value;
    const password = document.getElementById("password").value;
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, nickname, full_name, age, languages, experience, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.detail || "Registration failed!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed!");
    }
  });
}
