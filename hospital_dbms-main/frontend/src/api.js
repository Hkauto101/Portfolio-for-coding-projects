const API_BASE = 'http://localhost:5000/api';

// Helper function for API calls
async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
}

// Patients API
export const getPatients = () => apiRequest('/patients');
export const getPatient = (id) => apiRequest(`/patients/${id}`);
export const createPatient = (patientData) => apiRequest('/patients', 'POST', patientData);
export const updatePatient = (id, patientData) => apiRequest(`/patients/${id}`, 'PUT', patientData);
export const deletePatient = (id) => apiRequest(`/patients/${id}`, 'DELETE');

// Appointments API
export const getAppointments = () => apiRequest('/appointments');
export const createAppointment = (appointmentData) => apiRequest('/appointments', 'POST', appointmentData);

// Doctors API
export const getDoctors = () => apiRequest('/doctors');

// Departments API
export const getDepartments = () => apiRequest('/departments');

// Medications API - FIXED: Added all CRUD endpoints
export const getMedications = () => apiRequest('/medications');
export const getMedication = (medicationName) => apiRequest(`/medications/${encodeURIComponent(medicationName)}`);
export const createMedication = (medicationData) => apiRequest('/medications', 'POST', medicationData);
export const updateMedication = (medicationName, medicationData) => apiRequest(`/medications/${encodeURIComponent(medicationName)}`, 'PUT', medicationData);
export const deleteMedication = (medicationName) => apiRequest(`/medications/${encodeURIComponent(medicationName)}`, 'DELETE');