// home.js - Fetches and displays events and shows event details in a modal

document.addEventListener("DOMContentLoaded", loadOpenEvents);

// Global cache to store fetched events (for use in modal)
let eventsCache = [];

async function loadOpenEvents(filters = {}) {
  try {
    let query = "";
    if (filters.date || filters.location) {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.location) params.append("location", filters.location);
      query = "?" + params.toString();
    }
    
    const res = await fetch("https://volo-iila.onrender.com/api/events" + query);
    const events = await res.json();
    console.log("Fetched events:", events);
    eventsCache = events; // Cache the events for modal lookup

    const container = document.getElementById("openEventsContainer");
    container.innerHTML = "";
    if (res.ok && events.length > 0) {
      events.forEach(event => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
          <div class="card h-100 shadow event-card" data-event-id="${event.id}" style="cursor: pointer;">
            <div class="card-body">
              <h5 class="card-title">${event.title}</h5>
              <p class="card-text">${event.description.substring(0, 100)}...</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
            </div>
          </div>
        `;
        // Add click listener to open modal with event details
        col.querySelector(".event-card").addEventListener("click", () => {
          openEventModal(event.id);
        });
        container.appendChild(col);
      });
    } else {
      container.innerHTML = `<p>No events found.</p>`;
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function openEventModal(eventId) {
  // Find the event from the cache
  const eventData = eventsCache.find(ev => ev.id === eventId);
  if (!eventData) {
    alert("Event data not found!");
    return;
  }
  
  // Fill modal fields with event data
  document.getElementById("modalEventTitle").textContent = eventData.title;
  document.getElementById("modalEventDescription").textContent = eventData.description;
  document.getElementById("modalEventDate").textContent = new Date(eventData.date).toLocaleString();
  document.getElementById("modalEventLocation").textContent = eventData.location;
  document.getElementById("modalEventTasks").textContent = eventData.tasks ? eventData.tasks.join(", ") : "N/A";
  document.getElementById("modalEventBenefits").textContent = eventData.benefits ? eventData.benefits.join(", ") : "N/A";
  document.getElementById("modalEventCriteria").textContent = eventData.criteria || "None";
  document.getElementById("modalEventCapacity").textContent = eventData.capacity || "N/A";
  document.getElementById("modalEventVolunteerCount").textContent = eventData.volunteer_count || 0;
  
  // Attach eventId to the register button
  const registerBtn = document.getElementById("modalRegisterBtn");
  registerBtn.setAttribute("data-event-id", eventId);
  registerBtn.onclick = () => registerForEvent(eventId);
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("eventDetailsModal"));
  modal.show();
}

async function registerForEvent(eventId) {
  console.log("Registering for event id:", eventId);
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  
  try {
    const res = await fetch("https://volo-iila.onrender.com/api/registrations/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ event_id: eventId, user_id: "" })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registered successfully!");
    } else {
      alert(data.detail || "Registration failed!");
    }
  } catch (error) {
    console.error("Error registering for event:", error);
    alert("Registration failed!");
  }
}
