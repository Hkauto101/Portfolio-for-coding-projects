
-- patient
CREATE TABLE Patient (  
    patient_id SERIAL NOT NULL PRIMARY KEY, --pk
    patient_name VARCHAR(50) NOT NULL,
    ppatient_surname VARCHAR(50) NOT NULL,
    bdate DATE,
    phone VARCHAR(15),
    address TEXT
);

-- doctors
CREATE TABLE Doctor (
    doctor_id SERIAL NOT NULL PRIMARY KEY,  --pk
    doctor_name VARCHAR(50) NOT NULL,
    doctor_surname VARCHAR(50) NOT NULL
);

-- department
CREATE TABLE Department (
    department_id SERIAL NOT NULL PRIMARY KEY,  --pk (sk)
    department_name VARCHAR(100) NOT NULL UNIQUE,
    capacity INTEGER
);

-- medication
CREATE TABLE Medication (
    medication_name VARCHAR(100) NOT NULL PRIMARY KEY,               -- PRIMARY KEY
    expiration_date DATE NOT NULL,
    quantity INTEGER
);

-- appointment relational schema
CREATE TABLE Appointment (
    appointment_id SERIAL NOT NULL PRIMARY KEY, --pk
    patient_id INTEGER NOT NULL,
    status VARCHAR(30),
    appointment_cost NUMERIC(10,2),
    appointment_date DATE,
    diagnoses TEXT,

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON DELETE CASCADE
);

-- treatment relational schema
CREATE TABLE Treatment (
    treatment_name VARCHAR(100) NOT NULL PRIMARY KEY,  -- PRIMARY KEY
    treatment_cost NUMERIC(10,2),
    department_id INTEGER,

    CONSTRAINT fk_treatment_department
        FOREIGN KEY (department_id) REFERENCES Department(department_id)
        ON DELETE SET NULL
);

-- book relational schema
CREATE TABLE Book (
    patient_id INTEGER NOT NULL,       -- fk        
    appointment_id INTEGER NOT NULL,   -- fk             

    PRIMARY KEY (patient_id, appointment_id),     -- composite pk

    CONSTRAINT fk_book_patient
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_appointment
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
        ON DELETE CASCADE
);


CREATE TABLE Assigned (
    doctor_id INTEGER NOT NULL,         -- fk
    appointment_id INTEGER NOT NULL,      -- fk

    PRIMARY KEY (doctor_id, appointment_id),    -- composite pk

    CONSTRAINT fk_assigned_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assigned_appointment
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
        ON DELETE CASCADE
);

-- turn into treatment schema
CREATE TABLE Turns (
    appointment_id INTEGER NOT NULL,                -- fk
    treatment_name VARCHAR(100) NOT NULL,         -- fk

    PRIMARY KEY (appointment_id, treatment_name),         -- composite pk

    CONSTRAINT fk_turns_appointment
        FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_turns_treatment
        FOREIGN KEY (treatment_name) REFERENCES Treatment(treatment_name)
        ON DELETE CASCADE
);

-- uses relationship
CREATE TABLE Uses (
    treatment_name VARCHAR(100) NOT NULL,              -- fk
    medication_name VARCHAR(100) NOT NULL,             -- fk

    PRIMARY KEY (treatment_name, medication_name),             -- composite pk

    CONSTRAINT fk_uses_treatment
        FOREIGN KEY (treatment_name) REFERENCES Treatment(treatment_name)
        ON DELETE CASCADE,

    CONSTRAINT fk_uses_medication
        FOREIGN KEY (medication_name) REFERENCES Medication(medication_name)
        ON DELETE CASCADE
);



CREATE TABLE Placed (
    patient_id INTEGER,                          -- fk
    department_name VARCHAR(100),                   -- fk
    place_date DATE,

    PRIMARY KEY (patient_id, department_name, place_date),   --pk

    CONSTRAINT fk_placed_patient
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_placed_department
        FOREIGN KEY (department_name) REFERENCES Department(department_name)
        ON DELETE CASCADE
);


CREATE TABLE Supervises (
    doctor_id INTEGER,                       -- fk
    treatment_name VARCHAR(100),                 -- fk

    PRIMARY KEY (doctor_id, treatment_name),           --pk

    CONSTRAINT fk_supervises_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_supervises_treatment
        FOREIGN KEY (treatment_name) REFERENCES Treatment(t_name)
        ON DELETE CASCADE
);



CREATE TABLE Works_In (
    doctor_id INTEGER,                               --fk  
    department_name VARCHAR(100),                 -- fk

    PRIMARY KEY (doctor_id, department_name),                  --pk

    CONSTRAINT fk_worksin_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_worksin_department
        FOREIGN KEY (department_name) REFERENCES Department(department_name)
        ON DELETE CASCADE
);

