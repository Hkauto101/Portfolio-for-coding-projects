# Hospital DBMS Backend

## Project Overview

This project is a backend implementation of a simple Hospital Database Management System (DBMS). The goal is to manage key hospital entities such as Patients, Doctors, Appointments, Treatments, Medications, and Departments efficiently. The system exposes RESTful API endpoints to interact with the data, supporting CRUD operations and basic business logic like cost calculations.

The backend is built with **Python** using the **FlaskAPI** framework and connects to a **PostgreSQL** database. We use **SQLAlchemy** for ORM (Object-Relational Mapping), and **Pydantic** models for data validation.

---

## Current Project Structure

hospital_backend/
├── app/
│ ├── main.py # Application entry point, initializes FlaskAPI app and routes
│ ├── models/ # SQLAlchemy ORM models representing database tables
│ ├── schemas/ # Pydantic schemas for request validation and response serialization
│ ├── crud/ # Business logic: functions for Create, Read, Update, Delete operations
│ ├── api/ # API route definitions, grouped by entity
│ ├── db.py # Database connection setup and session management
│ └── utils/ # Utility helper functions (e.g., cost calculation)
├── requirements.txt # List of Python dependencies for the project
├── README.md # Project overview and instructions (this file)
└── .env # Environment variables (database URL, secrets, etc.)

### Key directories and files explained:

- **app/main.py**: Starts the FlaskAPI server and includes all API routers.
- **app/models/**: Contains SQLAlchemy classes that map to the database tables (Patient, Doctor, Appointment, etc.).
- **app/schemas/**: Pydantic models that define how data is validated coming into and out of the API.
- **app/crud/**: Implements the database operations with minimal business logic, e.g. creating or fetching patients, assigning doctors to appointments, etc.
- **app/api/**: Organizes API endpoints logically by entity (e.g., patient.py, doctor.py) to keep routes maintainable.
- **app/db.py**: Manages the database engine and session lifecycle.
- **app/utils/**: Contains helper functions such as calculating treatment costs based on related entities.
- **.env**: Holds sensitive information such as database connection string, not tracked by Git.

---

## What Has Been Implemented So Far

- Basic project structure set up with FlaskAPI and SQLAlchemy.
- Connection to PostgreSQL database configured via environment variables.
- Initial SQLAlchemy models defined for all core entities: Patient, Doctor, Appointment, Treatment, Medication, Department.
- Basic CRUD operations created for these entities, with API routes limited to 3–4 per entity.
- Minimal business logic included, such as treatment cost calculation based on medications.
- Git repository set up and connected to GitHub for collaborative development.

---

## Next Steps

- Implement API endpoints for the remaining entities.
- Add authentication and user management (optional for this project).
- Expand business logic as needed for treatment and appointment workflows.
- Write tests for API endpoints and database operations.
- Connect frontend with backend APIs for a complete system.

---



## How to Run the Project Locally
Make sure you have the following installed on your system:

Python 3.8+ (Download from python.org)
Node.js & npm (Download from nodejs.org)
PostgreSQL (Download from postgresql.org)

Setup Instructions:

### Step 1: Extract the Project

Unzip the project folder to your desired location
Navigate to the extracted folder in your terminal/command prompt

### Step 2: Database Setup

Create a PostgreSQL database for the hospital system:

Example: CREATE DATABASE medipol_hospital;

Note your database credentials (username, password, host, port)

### Step 3: Backend Setup (Flask API)

1) Navigate to the backend folder

2) Create a virtual environment (recommended):

Windows:

python -m venv hospital_env
hospital_env\Scripts\activate

macOS/Linux:

python3 -m venv hospital_env
source hospital_env/bin/activate

Install Python dependencies:
bashpip install -r requirements.txt

Create environment file:

Create a .env file in the backend folder
Add your PostgreSQL connection details:

envDB_HOST=localhost
DB_NAME=medipol_hospital
DB_USER=postgres
DB_PASSWORD=75Maqptmn
DB_PORT=5432
FLASK_APP=app.py
FLASK_ENV=development
Note: Replace the database credentials with your own PostgreSQL setup:

DB_PASSWORD: Use your actual PostgreSQL password
DB_USER: Use your PostgreSQL username (default is usually postgres)
DB_NAME: You can keep medipol_hospital or create a different database name


Run the Flask API server:
bashpython app.py
The backend API will start on http://localhost:5000

### Step 4: Frontend Setup (React)
(refer to README.md file of frontend folder)

