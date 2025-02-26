// events.js - Fetch and display events, handle filtering and event creation

async function loadEvents(filters = {}) {
  try {
    let query = '';
    if (filters.date || filters.location) {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.location) params.append('location', filters.location);
      query = '?' + params.toString();
    }
    
    const res = await fetch("http://localhost:8000/api/events" + query);
    const events = await res.json();
    console.log("Fetched events:", events);
    const container = document.getElementById("eventsContainer");
    container.innerHTML = '';
    if (events.length === 0) {
      container.innerHTML = '<p>No events found.</p>';
    } else {
      events.forEach(event => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
          <div class="card h-100 shadow">
            <div class="card-body">
              <h5 class="card-title">${event.title}</h5>
              <p class="card-text">${event.description.substring(0, 100)}...</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <button class="btn btn-warning" onclick="registerEvent('${event.id}')">Register</button>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

async function registerEvent(eventId) {
  console.log("Registering for event id:", eventId);
  const token = localStorage.getItem("access_token");
  if (!token) return window.location.href = "login.html";
  
  try {
    const res = await fetch("http://localhost:8000/api/registrations/", {
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

const filterForm = document.getElementById("filterForm");
if (filterForm) {
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const filterDate = document.getElementById("filterDate").value;
    const filterLocation = document.getElementById("filterLocation").value;
    loadEvents({ date: filterDate, location: filterLocation });
  });
}

const createEventForm = document.getElementById("createEventForm");
if (createEventForm) {
  createEventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    const location = document.getElementById("location").value;
    const tasks = document.getElementById("tasks").value.split(',').map(t => t.trim());
    const benefits = document.getElementById("benefits").value.split(',').map(b => b.trim());
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/api/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ title, description, date, location, tasks, benefits })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Event created successfully!");
        window.location.href = "index.html";
      } else {
        alert(data.detail || "Failed to create event!");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event!");
    }
  });
}

if (document.getElementById("eventsContainer")) {
  loadEvents();
}
