// admin.js - Handles admin functionalities: managing events and registrations
document.addEventListener("DOMContentLoaded", () => {
    loadAdminEvents();
    loadAdminEventOptions();
    const updateEventForm = document.getElementById("updateEventForm");
    if (updateEventForm) {
      updateEventForm.addEventListener("submit", updateEvent);
    }
  });
  
  let adminEventsCache = []; // Store all fetched events here

  console.log("Admin events:", events);
  async function loadAdminEvents() {
    const token = localStorage.getItem("access_token");
    if (!token) return (window.location.href = "login.html");
    try {
      const res = await fetch("http://localhost:8000/api/admin/events", {
        headers: { Authorization: "Bearer " + token },
      });
      const events = await res.json();
      adminEventsCache = events;  // Keep a copy in memory
      const container = document.getElementById("adminEventsContainer");
      container.innerHTML = "";
      if (res.ok && events.length > 0) {
        events.forEach((event) => {
          const col = document.createElement("div");
          col.className = "col-md-4";
          col.innerHTML = `
            <div class="card h-100 shadow">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-3">${event.title}</h5>
                <p class="card-text flex-grow-1">${event.description.substring(0, 100)}...</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Capacity:</strong> ${event.capacity}</p>
                <p><strong>Volunteers:</strong> ${event.volunteer_count}</p>
                <div class="btn-group mt-auto w-100" role="group">
                  <button class="btn btn-warning btn-sm" onclick="openUpdateEventModal('${event.id}')">Update</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')">Delete</button>
                  <button class="btn btn-info btn-sm" onclick="loadEventRegistrations('${event.id}')">Registrations</button>
                </div>
              </div>
            </div>
          `;
          container.appendChild(col);
        });
      } else {
        container.innerHTML = "<p>No events created by you.</p>";
      }
    } catch (error) {
      console.error("Error loading admin events:", error);
    }
  }
  
  async function deleteEvent(eventId) {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Event deleted successfully!");
        loadAdminEvents();
        loadAdminEventOptions();
      } else {
        alert(data.detail || "Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  }
  
  function openUpdateEventModal(eventId) {
    const modal = new bootstrap.Modal(document.getElementById("updateEventModal"));
    // Find the event in the cached array
    const eventData = adminEventsCache.find(e => e.id === eventId);
    if (!eventData) {
      alert("Event not found in cache!");
      return;
    }
  
    // Pre-fill the form fields with existing data
    document.getElementById("updateTitle").value = eventData.title || "";
    document.getElementById("updateDescription").value = eventData.description || "";
    document.getElementById("updateDate").value = eventData.date
      ? new Date(eventData.date).toISOString().slice(0, 16)  // e.g. "2025-02-26T09:00"
      : "";
    document.getElementById("updateLocation").value = eventData.location || "";
    document.getElementById("updateTasks").value = eventData.tasks ? eventData.tasks.join(", ") : "";
    document.getElementById("updateBenefits").value = eventData.benefits ? eventData.benefits.join(", ") : "";
    document.getElementById("updateCriteria").value = eventData.criteria || "";
    document.getElementById("updateCapacity").value = eventData.capacity || 0;
  
    // Store the event ID in the modal for reference
    document.getElementById("updateEventModal").setAttribute("data-event-id", eventId);
    modal.show();
  }
  
  
  async function updateEvent(e) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const eventId = document.getElementById("updateEventModal").getAttribute("data-event-id");
    const updateData = {
      title: document.getElementById("updateTitle").value,
      description: document.getElementById("updateDescription").value,
      date: document.getElementById("updateDate").value,
      location: document.getElementById("updateLocation").value,
      tasks: document.getElementById("updateTasks").value.split(",").map(t => t.trim()),
      benefits: document.getElementById("updateBenefits").value.split(",").map(b => b.trim()),
      criteria: document.getElementById("updateCriteria").value,
      capacity: parseInt(document.getElementById("updateCapacity").value)
    };
  
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Event updated successfully!");
        const modal = bootstrap.Modal.getInstance(document.getElementById("updateEventModal"));
        modal.hide();
        loadAdminEvents();
        loadAdminEventOptions();
      } else {
        alert(data.detail || "Failed to update event.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event.");
    }
  }
  
  async function loadAdminEventOptions() {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/api/admin/events", {
        headers: { Authorization: "Bearer " + token },
      });
      const events = await res.json();
      const select = document.getElementById("eventSelect");
      select.innerHTML = "";
      if (res.ok && events.length > 0) {
        events.forEach((event) => {
          const option = document.createElement("option");
          option.value = event.id;
          option.textContent = event.title;
          select.appendChild(option);
        });
        select.addEventListener("change", () => {
          loadEventRegistrations(select.value);
        });
        loadEventRegistrations(events[0].id);
      } else {
        select.innerHTML = "<option>No events available</option>";
      }
    } catch (error) {
      console.error("Error loading admin event options:", error);
    }
  }
  
  async function loadEventRegistrations(eventId) {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/events/${eventId}/registrations`, {
        headers: { Authorization: "Bearer " + token },
      });
      const regs = await res.json();
      const container = document.getElementById("eventRegistrationsContainer");
      container.innerHTML = "";
      if (res.ok && regs.length > 0) {
        regs.forEach((reg) => {
          const col = document.createElement("div");
          col.className = "col-md-4";
          const displayEvent = reg.event_title || `Event ID: ${reg.event_id}`;
        const displayUser = reg.user_full_name || `User ID: ${reg.user_id}`;
        const userAge = reg.user_age || "N/A";
        const userLanguages = (reg.user_languages && reg.user_languages.length > 0) ? reg.user_languages.join(", ") : "None";
        const userExperience = reg.user_experience || "None";

        col.innerHTML = `
          <div class="card h-100 shadow">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-3">Event: ${displayEvent}</h5>
              <p class="card-text"><strong>User:</strong> ${displayUser}</p>
              <p class="card-text"><strong>Age:</strong> ${userAge}</p>
              <p class="card-text"><strong>Languages:</strong> ${userLanguages}</p>
              <p class="card-text"><strong>Experience:</strong> ${userExperience}</p>
              <p class="card-text">Approval: ${reg.approval_status}</p>
              <div class="btn-group mt-auto w-100" role="group">
                <button class="btn btn-success btn-sm" onclick="approveRegistration('${reg.id}')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectRegistration('${reg.id}')">Reject</button>
                <button class="btn btn-secondary btn-sm" onclick="reserveRegistration('${reg.id}')">Reserve</button>
              </div>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    } else {
      container.innerHTML = "<p>No registrations for this event.</p>";
    }
  } catch (error) {
    console.error("Error loading event registrations:", error);
  }
}
  
  async function approveRegistration(registrationId) {
    const token = localStorage.getItem("access_token");
    if (!confirm("Approve this registration?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/registrations/${registrationId}/approve`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration approved!");
        loadEventRegistrations(document.getElementById("eventSelect").value);
      } else {
        alert(data.detail || "Failed to approve registration.");
      }
    } catch (error) {
      console.error("Error approving registration:", error);
    }
  }
  
  async function rejectRegistration(registrationId) {
    const token = localStorage.getItem("access_token");
    if (!confirm("Reject this registration?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/registrations/${registrationId}/reject`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration rejected!");
        loadEventRegistrations(document.getElementById("eventSelect").value);
      } else {
        alert(data.detail || "Failed to reject registration.");
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
    }
  }
  