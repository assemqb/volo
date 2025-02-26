// profile.js - Handles loading/updating profile information, deleting profile, and loading registrations

let updateModal = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the update modal
  const modalEl = document.getElementById("updateProfileModal");
  if (modalEl) {
    updateModal = new bootstrap.Modal(modalEl);
  } else {
    console.error("Update Profile modal element not found.");
  }

  // Attach event listener to the Update Profile button
  const openUpdateModalBtn = document.getElementById("openUpdateModalBtn");
  if (openUpdateModalBtn) {
    openUpdateModalBtn.addEventListener("click", () => {
      fillProfileForm(); // Pre-fill modal fields with current data
      if (updateModal) {
        updateModal.show();
      }
    });
  } else {
    console.error("Update Profile button not found.");
  }

  // Attach event listener for the update form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", updateProfile);
  } else {
    console.error("Profile form not found.");
  }

  // Attach event listener for delete profile button
  const deleteProfileBtn = document.getElementById("deleteProfileBtn");
  if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener("click", deleteProfile);
  } else {
    console.error("Delete Profile button not found.");
  }

  // Load profile information and registrations
  await loadProfileInfo();
  await loadMyRegistrations();
});

async function loadProfileInfo() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  try {
    const res = await fetch("http://localhost:8000/api/users/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const profile = await res.json();
    if (res.ok) {
      // Update profile display elements
      document.getElementById("profileName").textContent = profile.full_name;
      document.getElementById("profileAge").textContent = profile.age;
      document.getElementById("profileLanguages").textContent = profile.languages.join(", ");
      document.getElementById("profileExperience").textContent = profile.experience;
    } else {
      alert(profile.detail || "Failed to load profile.");
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

function fillProfileForm() {
  // Pre-fill the update form with the current profile info displayed on the page
  const name = document.getElementById("profileName").textContent;
  const age = document.getElementById("profileAge").textContent;
  const languages = document.getElementById("profileLanguages").textContent;
  const experience = document.getElementById("profileExperience").textContent;

  // Set modal input values (ensure these IDs match your modal's inputs)
  document.getElementById("full_name").value = name;
  document.getElementById("age").value = age;
  document.getElementById("languages").value = languages;
  document.getElementById("experience").value = experience;
}

async function updateProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem("access_token");
  const full_name = document.getElementById("full_name").value;
  const age = parseInt(document.getElementById("age").value);
  const languages = document.getElementById("languages").value.split(",").map(l => l.trim());
  const experience = document.getElementById("experience").value;

  try {
    const res = await fetch("http://localhost:8000/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ full_name, age, languages, experience }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Profile updated successfully!");
      updateModal.hide();
      // Reload profile info after update
      await loadProfileInfo();
    } else {
      alert(data.detail || "Failed to update profile.");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile.");
  }
}

async function deleteProfile() {
  if (!confirm("Are you sure you want to delete your profile? This will remove all your data from the system.")) {
    return;
  }
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch("http://localhost:8000/api/users/me", {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.detail || "Profile deleted successfully from the system.");
      localStorage.clear();
      window.location.href = "register.html";
    } else {
      alert(data.detail || "Failed to delete profile from the system.");
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    alert("Error deleting profile.");
  }
}


async function loadMyRegistrations() {
  const token = localStorage.getItem("access_token");
  if (!token) return;
  try {
    const res = await fetch("http://localhost:8000/api/registrations/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    const container = document.getElementById("myRegistrationsList");
    container.innerHTML = "";
    if (res.ok && data.length > 0) {
      data.forEach((reg) => {
        // Use a friendly event title if available; otherwise, fall back to event_id
        const displayTitle = reg.event_title ? reg.event_title : `Event ID: ${reg.event_id}`;
        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
          <div class="card h-100 shadow">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-3">${displayTitle}</h5>
              <p class="card-text"><strong>Approval:</strong> ${reg.approval_status}</p>
              <button class="btn btn-danger mt-auto w-100" data-reg-id="${reg.id}">
                Delete Registration
              </button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      // Attach event listeners for delete registration buttons
      document.querySelectorAll("[data-reg-id]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const regId = e.target.getAttribute("data-reg-id");
          if (confirm("Are you sure you want to delete this registration?")) {
            try {
              const delRes = await fetch(`http://localhost:8000/api/registrations/${regId}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token },
              });
              const delData = await delRes.json();
              if (delRes.ok) {
                alert("Registration deleted successfully!");
                loadMyRegistrations();
              } else {
                alert(delData.detail || "Failed to delete registration.");
              }
            } catch (error) {
              console.error("Error deleting registration:", error);
            }
          }
        });
      });
    } else {
      container.innerHTML = "<p>You have no registered events.</p>";
    }
  } catch (error) {
    console.error("Error fetching registrations:", error);
  }
}
