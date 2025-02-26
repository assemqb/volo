
# Volunteer Hub

Volunteer Hub is a volunteer management platform that connects passionate volunteers with community events. This repository contains both the backend (FastAPI, MongoDB) and frontend (HTML, CSS, JS) code.

## Table of Contents
- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation & Running Locally](#installation--running-locally)
- [Render Deployment](#render-deployment)
- [Frontend Usage](#frontend-usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Volunteer Hub provides two main sets of features:

**Volunteer Features:**
- Registration & login (phone, nickname, password).
- Profile management (full name, age, languages, experience).
- Event browsing & registration.
- Viewing and deleting registered events.

**Admin Features:**
- Creating & managing events (title, description, tasks, benefits, capacity, etc.).
- Viewing registrations for each event and approving/rejecting/reserving them.
- Dashboard with an overview of events and volunteer data.

The backend is deployed on Render, and the frontend references the Render API URLs directly.

## Folder Structure

```
VOLUNTEERPL/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── auth_controller.py
│   │   │   ├── event_controller.py
│   │   │   └── user_controller.py
│   │   ├── database/
│   │   │   └── mongodb.py
│   │   ├── models/
│   │   │   ├── event.py
│   │   │   ├── registration.py
│   │   │   └── user.py
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── events.py
│   │   │   ├── registrations.py
│   │   │   └── users.py
│   │   ├── schemas/
│   │   │   ├── event_schema.py
│   │   │   ├── registration_schema.py
│   │   │   └── user_schema.py
│   │   ├── utils/
│   │   │   └── security.py
│   │   ├── config.py
│   │   └── main.py
│   ├── .env
│   ├── requirements.txt
│   └── Procfile
├── frontend/
│   ├── assets/
│   │   ├── logo.jpg
│   │   └── ...
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── ...
│   ├── admin.html
│   ├── create_event.html
│   └── ...
└── README.md
```

## Features

### Volunteer:
- Sign up & login via phone + password.
- Profile management.
- Event browsing & advanced filtering.
- Event registration & status viewing.
- Manage registrations.

### Admin:
- Create/manage events.
- Monitor and handle registrations.
- Event capacity management.
- Dashboard overview.

## Technologies Used

**Backend:**
- FastAPI, Uvicorn
- Motor (MongoDB)
- Python-Dotenv, PyJWT, Passlib (bcrypt)

**Frontend:**
- HTML, CSS, JavaScript, Bootstrap 5

**Database:**
- MongoDB Atlas

**Deployment:**
- Render, GitHub

## Installation & Running Locally

Clone the repo, create `.env` with MongoDB & JWT secrets, install dependencies, and start backend/frontend locally.

### Backend:

```bash
git clone [repo-url]
cd backend
pip install -r requirements.txt

# .env file
MONGO_DETAILS=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

```bash
uvicorn main:app --reload
```

### Frontend:

```bash
cd frontend
python -m http.server 8001
```

Open [http://localhost:8001](http://localhost:8001).

## Render Deployment

### Backend:
- Deploy as a Web Service on Render (connect GitHub repo).
- Backend URL provided by Render.

### Frontend:
- Deploy as Static Site on Render.

## Frontend Usage

- Browse events, register, view event details.
- Registration API calls to backend.

## API Documentation

- Swagger UI: `[backend-url]/docs`
- ReDoc: `[backend-url]/redoc`

## Contributing
Pull requests and issues are welcome.

## License
MIT License.
