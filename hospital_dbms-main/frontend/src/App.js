
/* This source code includes the complete frontend interface react code which includes complete API functionality, state and effect management, lucide-react imported modules,
rendering and page components, etc.*/

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Building2, Pill, FileText, Plus, Search, Edit, Trash2, Eye, X, Save } from 'lucide-react';
// Import the real API functions
import { 
    getPatients, 
    createPatient, 
    updatePatient, 
    deletePatient,
    getAppointments,
    createAppointment,
    getDoctors,
    getDepartments,
    getMedications,
    getMedication,      
    createMedication,    
    updateMedication,   
    deleteMedication    
} from './api';

const MedipolHospitalSystem = () => {
const [activeTab, setActiveTab] = useState('home');
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [editingItem, setEditingItem] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// State for all data
const [appointments, setAppointments] = useState([]);
const [doctors, setDoctors] = useState([]);
const [departments, setDepartments] = useState([]);
const [patients, setPatients] = useState([]);
const [medications, setMedications] = useState([]);

// Form states - Individual states to prevent re-render issues
const [appointmentPatient, setAppointmentPatient] = useState('');
const [appointmentDoctor, setAppointmentDoctor] = useState('');
const [appointmentDate, setAppointmentDate] = useState('');
const [appointmentTime, setAppointmentTime] = useState('');
const [appointmentStatus, setAppointmentStatus] = useState('Scheduled');

const [patientName, setPatientName] = useState('');
const [patientBirthDate, setPatientBirthDate] = useState('');
const [patientPhone, setPatientPhone] = useState('');
const [patientAddress, setPatientAddress] = useState('');

const [medicationName, setMedicationName] = useState('');
const [medicationQuantity, setMedicationQuantity] = useState('');
const [medicationType, setMedicationType] = useState('');
const [medicationExpirationDate, setMedicationExpirationDate] = useState('');

// Load initial data using real API
useEffect(() => {
    const loadData = async () => {
    setLoading(true);
    setError('');
    try {
        const [patientsData, doctorsData, departmentsData, medicationsData, appointmentsData] = await Promise.all([
        getPatients(),
        getDoctors(),
        getDepartments(),
        getMedications(),
        getAppointments()
        ]);
        
// Transform API response data to match frontend format 
        setPatients(patientsData.data.map(patient => ({
        id: patient.patient_id,
        name: `${patient.patient_name} ${patient.ppatient_surname}`, 
        phone: patient.phone || 'N/A',
        address: patient.address || 'N/A',
        birthDate: patient.bdate || 'Not specified' 
        })));

        setDoctors(doctorsData.data.map(doctor => ({
        id: doctor.doctor_id,
        name: `${doctor.doctor_name} ${doctor.doctor_surname}`,
        specialty: 'General Medicine', 
        department_name: doctor.department_name || 'Not Assigned' 
        })));

        setDepartments(departmentsData.data.map(dept => ({
        name: dept.department_name,
        capacity: dept.capacity || 50,
        currentPatients: Math.floor(Math.random() * (dept.capacity || 50)) // Random for demo
        })));

        setMedications(medicationsData.data.map(med => ({
        id: med.medication_name,
        name: med.medication_name,
        quantity: med.quantity || 0,
        type: 'Tablet', // Default medication type
        expiration_date: med.expiration_date
        })));

        setAppointments(appointmentsData.data.map(apt => ({
        id: apt.appointment_id,
        patient: apt.patient_name ? `${apt.patient_name} ${apt.ppatient_surname}` : 'Unknown Patient', 
        doctor: apt.doctor_name ? `${apt.doctor_name} ${apt.doctor_surname}` : 'Unknown Doctor',
        date: apt.appointment_date || new Date().toISOString().split('T')[0],
        time: '10:00', 
        status: apt.status || 'Scheduled'
        })));

    } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data from server. Please check your backend connection.');
    } finally {
        setLoading(false);
    }
    };

    loadData();
}, []);

// CRUD Operations using real API 
const handleCreate = async (type, data) => {
    try {
    setLoading(true);
    let newItem;
    
    switch (type) {
        case 'patient':

        const patientData = {
            patient_name: data.name.split(' ')[0] || 'Unknown',
            ppatient_surname: data.name.split(' ').slice(1).join(' ') || 'Unknown', 
            bdate: data.birthDate, 
            phone: data.phone,
            address: data.address
        };
        
        const createdPatient = await createPatient(patientData);
        newItem = {
            id: createdPatient.data.patient_id,
            name: `${createdPatient.data.patient_name} ${createdPatient.data.ppatient_surname}`, 
            phone: createdPatient.data.phone,
            address: createdPatient.data.address,
            birthDate: createdPatient.data.bdate 
        };
        setPatients(prev => [...prev, newItem]);
        break;
        
        case 'appointment':
// Find actual patient and doctor IDs from names
        const selectedPatient = patients.find(p => p.name === data.patient);
        const selectedDoctor = doctors.find(d => d.name === data.doctor);
        
        if (!selectedPatient) {
            throw new Error('Please select a valid patient');
        }
        if (!selectedDoctor) {
            throw new Error('Please select a valid doctor');
        }
        
        const appointmentData = {
            patient_id: selectedPatient.id,
            doctor_id: selectedDoctor.id,
            appointment_date: data.date,
            status: data.status,
            appointment_cost: 100.00 // Default cost per appoinment
        };
        
        const createdAppointment = await createAppointment(appointmentData);
        newItem = {
            id: createdAppointment.data.appointment_id,
            patient: data.patient,
            doctor: data.doctor,
            date: data.date,
            time: data.time,
            status: data.status
        };
        setAppointments(prev => [...prev, newItem]);
        break;
        
        case 'medication':
// Use actual API call instead of local state only
        const medicationData = {
            medication_name: data.name,
            quantity: parseInt(data.quantity) || 0,
            expiration_date: data.expiration_date 
        };
        
        const createdMedication = await createMedication(medicationData);
        newItem = {
            id: createdMedication.data.medication_name,
            name: createdMedication.data.medication_name,
            quantity: createdMedication.data.quantity,
            type: data.type,
            expiration_date: createdMedication.data.expiration_date 
        };
        setMedications(prev => [...prev, newItem]);
        break;
        
        default:
        break;
    }
    
    setShowModal(false);
    resetForms();
    } catch (error) {
    console.error('Failed to create:', error);
    setError(`Failed to create ${type}: ${error.message}`);
    } finally {
    setLoading(false);
    }
};

const handleUpdate = async (type, id, data) => {
    try {
    setLoading(true);
    let updatedItem;
    
    switch (type) {
        case 'patient':
// The correct column names based on database which were replaced from mock data before
        const patientData = {
            patient_name: data.name.split(' ')[0] || 'Unknown',
            ppatient_surname: data.name.split(' ').slice(1).join(' ') || 'Unknown', 
            bdate: data.birthDate, 
            phone: data.phone,
            address: data.address
        };
        
        const updatedPatient = await updatePatient(id, patientData);
        updatedItem = {
            id: updatedPatient.data.patient_id,
            name: `${updatedPatient.data.patient_name} ${updatedPatient.data.ppatient_surname}`, 
            phone: updatedPatient.data.phone,
            address: updatedPatient.data.address,
            birthDate: updatedPatient.data.bdate 
        };
        setPatients(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
        
        case 'appointment':
// For appointments, local state will be updated for now (no API endpoint)
        updatedItem = { id, ...data };
        setAppointments(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
        
        case 'medication':
// The actual API call instead of local state only
        const medicationUpdateData = {
            medication_name: data.name,
            quantity: parseInt(data.quantity) || 0,
            expiration_date: data.expiration_date 
        };
        
        const updatedMedication = await updateMedication(id, medicationUpdateData);
        updatedItem = {
            id: updatedMedication.data.medication_name,
            name: updatedMedication.data.medication_name,
            quantity: updatedMedication.data.quantity,
            type: data.type,
            expiration_date: updatedMedication.data.expiration_date 
        };
        setMedications(prev => prev.map(item => item.id === id ? updatedItem : item));
        break;
        
        default:
        break;
    }
    
    setShowModal(false);
    setEditingItem(null);
    resetForms();
    } catch (error) {
    console.error('Failed to update:', error);
    setError(`Failed to update ${type}: ${error.message}`);
    } finally {
    setLoading(false);
    }
};

const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
    setLoading(true);
    
    switch (type) {
        case 'patient':
        await deletePatient(id);
        setPatients(prev => prev.filter(item => item.id !== id));
        break;
        
        case 'appointment':
// For appointments, local state will be updated since API doesn't have delete endpoint
        setAppointments(prev => prev.filter(item => item.id !== id));
        break;
        
        case 'medication':
// The actual API call instead of local state only
        await deleteMedication(id);
        setMedications(prev => prev.filter(item => item.id !== id));
        break;
        
        default:
        break;
    }
    } catch (error) {
    console.error('Failed to delete:', error);
    setError(`Failed to delete ${type}: ${error.message}`);
    } finally {
    setLoading(false);
    }
};

const resetForms = () => {
// Reset forms for each state element of every tab for API responsiveness

    setAppointmentPatient('');
    setAppointmentDoctor('');
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentStatus('Scheduled');
    

    setPatientName('');
    setPatientBirthDate(''); 
    setPatientPhone('');
    setPatientAddress('');
    

    setMedicationName('');
    setMedicationQuantity('');
    setMedicationType('');
    setMedicationExpirationDate('');
};

const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
    switch (type) {
        case 'appointment':
        setAppointmentPatient(item.patient || '');
        setAppointmentDoctor(item.doctor || '');
        setAppointmentDate(item.date || '');
        setAppointmentTime(item.time || '');
        setAppointmentStatus(item.status || 'Scheduled');
        break;
        case 'patient':
        setPatientName(item.name || '');
        setPatientBirthDate(item.birthDate || ''); 
        setPatientPhone(item.phone || '');
        setPatientAddress(item.address || '');
        break;
        case 'medication':
        setMedicationName(item.name || '');
        setMedicationQuantity(item.quantity || '');
        setMedicationType(item.type || '');
        setMedicationExpirationDate(item.expiration_date || ''); 
        break;
        default:
        break;
    }
    } else {
    resetForms();
    }
    
    setShowModal(true);
};

const Logo = () => (
    <div className="flex items-center space-x-3">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
        <div className="w-8 h-8 relative">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded-full opacity-80"></div>
            <div className="absolute w-4 h-4 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-white rounded-t"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-white rounded-b"></div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-2 bg-white rounded-l"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-2 bg-white rounded-r"></div>
        </div>
    </div>
    <div>
        <h1 className="text-2xl font-bold text-blue-800">MEDIPOL</h1>
        <p className="text-sm text-gray-600">Hospital Management System</p>
    </div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
        <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
    </div>
    </div>
);

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    </button>
);

const ActionButton = ({ icon: Icon, label, variant = 'primary', onClick, disabled = false }) => {
    const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
    };
    
    return (
    <button 
        onClick={onClick}
        disabled={disabled || loading}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </button>
    );
};

const Modal = ({ title, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
            onClick={() => {
            setShowModal(false);
            setEditingItem(null);
            resetForms();
            }}
            className="text-gray-400 hover:text-gray-600"
        >
            <X className="w-5 h-5" />
        </button>
        </div>
        {children}
    </div>
    </div>
);

const handleFormSubmit = (e) => {
    e.preventDefault();
    
    let formData;
    switch (modalType) {
    case 'appointment':
        formData = {
        patient: appointmentPatient,
        doctor: appointmentDoctor,
        date: appointmentDate,
        time: appointmentTime,
        status: appointmentStatus
        };
        break;
    case 'patient':
        formData = {
        name: patientName,
        birthDate: patientBirthDate, 
        phone: patientPhone,
        address: patientAddress
        };
        break;
    case 'medication':
        formData = {
        name: medicationName,
        quantity: medicationQuantity,
        type: medicationType,
        expiration_date: medicationExpirationDate 
        };
        break;
    default:
        return;
    }

    if (editingItem) {
    handleUpdate(modalType, editingItem.id, formData);
    } else {
    handleCreate(modalType, formData);
    }
};

// Error Display Component
const ErrorMessage = () => {
    if (!error) return null;
    return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> {error}
        <button 
        className="float-right text-red-500 hover:text-red-700"
        onClick={() => setError('')}
        >
        ×
        </button>
    </div>
    );
};

// Loading Indicator with tailwind CSS animation style
const LoadingSpinner = () => {
    if (!loading) return null;
    return (
    <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
    </div>
    );
};

// Home Page component 

const HomePage = () => (
    <div className="space-y-8">
    <ErrorMessage />
    <LoadingSpinner />
    
    {/* About Section */}
    <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About MEDIPOL Hospital Database System</h2>
        <p className="text-gray-600 leading-relaxed">
        Welcome to the MEDIPOL Hospital Management System - an optimized database solution designed to streamline 
        hospital operations and enhance patient care. Our comprehensive system manages patient records, doctor schedules, 
        appointments, treatments, and departmental resources with efficiency and security at its core.
        </p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Patient Management</h3>
            <p className="text-sm text-gray-600">Comprehensive patient records and history</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Appointment Scheduling</h3>
            <p className="text-sm text-gray-600">Efficient booking and scheduling system</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Treatment Tracking</h3>
            <p className="text-sm text-gray-600">Complete treatment and medication records</p>
        </div>
        </div>
    </section>

    {/* Statistics */}
    <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={patients.length.toString()} icon={Users} color="border-blue-500" />
        <StatCard title="Active Doctors" value={doctors.length.toString()} icon={Users} color="border-green-500" />
        <StatCard title="Departments" value={departments.length.toString()} icon={Building2} color="border-purple-500" />
        <StatCard title="Today's Appointments" value={appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length.toString()} icon={Calendar} color="border-orange-500" />
    </div>

    {/* Quick Actions */}
    <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
            onClick={() => openModal('appointment')}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
        >
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-800">Schedule Appointment</h4>
            <p className="text-sm text-gray-600">Book new patient appointment</p>
        </button>
        <button 
            onClick={() => openModal('patient')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
        >
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-800">Add Patient</h4>
            <p className="text-sm text-gray-600">Register new patient</p>
        </button>
        <button 
            onClick={() => setActiveTab('doctors')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
        >
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-800">Doctor Schedule</h4>
            <p className="text-sm text-gray-600">View doctor availability</p>
        </button>
        <button 
            onClick={() => openModal('medication')}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
        >
            <Pill className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-800">Add Medication</h4>
            <p className="text-sm text-gray-600">Manage medication inventory</p>
        </button>
        </div>
    </section>
    </div>
);

// Appointment Page component 

const AppointmentsPage = () => {
    const filteredAppointments = appointments.filter(apt =>
        apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ErrorMessage />
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Appointments ({appointments.length})</h2>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <ActionButton icon={Plus} label="New Appointment" onClick={() => openModal('appointment')} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {appointment.patient}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {appointment.doctor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {appointment.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {appointment.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <ActionButton 
                                        icon={Edit} 
                                        label="Edit" 
                                        variant="secondary" 
                                        onClick={() => openModal('appointment', appointment)} 
                                    />
                                    <ActionButton 
                                        icon={Eye} 
                                        label="View" 
                                        variant="secondary" 
                                        onClick={() => alert(`Appointment Details:\n\nPatient: ${appointment.patient}\nDoctor: ${appointment.doctor}\nDate: ${appointment.date}\nTime: ${appointment.time}\nStatus: ${appointment.status}`)} 
                                    />
                                    <ActionButton 
                                        icon={Trash2} 
                                        label="Delete" 
                                        variant="danger" 
                                        onClick={() => handleDelete('appointment', appointment.id)} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Patients Page component 
const PatientsPage = () => {
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ErrorMessage />
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Patients ({patients.length})</h2>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <ActionButton icon={Plus} label="New Patient" onClick={() => openModal('patient')} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {patient.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {patient.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {patient.birthDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <ActionButton 
                                        icon={Edit} 
                                        label="Edit" 
                                        variant="secondary" 
                                        onClick={() => openModal('patient', patient)} 
                                    />
                                    <ActionButton 
                                        icon={Calendar} 
                                        label="Book" 
                                        variant="primary" 
                                        onClick={() => openModal('appointment', { patient: patient.name })} 
                                    />
                                    <ActionButton 
                                        icon={Trash2} 
                                        label="Delete" 
                                        variant="danger" 
                                        onClick={() => handleDelete('patient', patient.id)} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Medications Page component 

const MedicationsPage = () => {
    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.type && med.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
    <div className="space-y-6">
        <ErrorMessage />
        <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Medications ({medications.length})</h2>
        <div className="flex space-x-3">
            <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
            <ActionButton icon={Plus} label="Add Medication" onClick={() => openModal('medication')} />
        </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => (
            <div key={medication.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{medication.name}</h3>
                    <p className="text-sm text-gray-600">{medication.type || 'Not Specified'}</p>
                </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                medication.quantity > 100 ? 'bg-green-100 text-green-800' :
                medication.quantity > 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
                }`}>
                {medication.quantity} units
                </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Expires:</span> {medication.expiration_date || 'Not specified'}
            </p>
            <div className="flex space-x-2">
                <ActionButton icon={Edit} label="Edit" variant="secondary" onClick={() => openModal('medication', medication)} />
                <ActionButton icon={Trash2} label="Delete" variant="danger" onClick={() => handleDelete('medication', medication.id)} />
            </div>
            </div>
        ))}
        </div>
    </div>
    );
};

// Doctors Page component 

const DoctorsPage = () => (
    <div className="space-y-6">
    <ErrorMessage />
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Doctors ({doctors.length})</h2>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
        <div key={doctor.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
            </div>
            <div className="space-y-2 text-sm">
            <p><span className="font-medium">Department:</span> {doctor.department_name}</p>
            </div>
            <div className="mt-4 flex space-x-2">
            <ActionButton 
                icon={Eye} 
                label="View" 
                variant="secondary" 
                onClick={() => alert(`Viewing details for ${doctor.name}\n\nSpecialty: ${doctor.specialty}\nDepartment: ${doctor.department_name}`)}
            />
            <ActionButton 
                icon={Calendar} 
                label="Schedule" 
                variant="primary" 
                onClick={() => {
                setActiveTab('appointments');
                openModal('appointment', { doctor: doctor.name });
                }}
            />
            </div>
        </div>
        ))}
    </div>
    </div>
);

const DepartmentsPage = () => (
    <div className="space-y-6">
    <ErrorMessage />
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Departments ({departments.length})</h2>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
        <div key={dept.name} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{dept.name}</h3>
            <Building2 className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-3">
            <div>
                <div className="flex justify-between text-sm mb-1">
                <span>Capacity</span>
                <span>{dept.currentPatients}/{dept.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${(dept.currentPatients / dept.capacity) * 100}%`}}
                ></div>
                </div>
            </div>
            </div>
            <div className="mt-4 flex space-x-2">
            <ActionButton 
                icon={Eye} 
                label="View" 
                variant="secondary" 
                onClick={() => alert(`Department: ${dept.name}\n\nCapacity: ${dept.currentPatients}/${dept.capacity} patients\nOccupancy: ${Math.round((dept.currentPatients / dept.capacity) * 100)}%`)}
            />
            </div>
        </div>
        ))}
    </div>
    </div>
);
// rendering component for displaying page information when switched between different pages 

const renderContent = () => {
    switch (activeTab) {
    case 'home': return <HomePage />;
    case 'appointments': return <AppointmentsPage />;
    case 'doctors': return <DoctorsPage />;
    case 'departments': return <DepartmentsPage />;
    case 'patients': return <PatientsPage />;
    case 'medications': return <MedicationsPage />;
    default: return <HomePage />;
    }
};

// rendering component for showing input/modal boxes for each page 

const renderModalContent = () => {
    switch (modalType) {
        case 'appointment':
            return (
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <select
                            value={appointmentPatient}
                            onChange={(e) => setAppointmentPatient(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a patient</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.name}>{patient.name}</option>
                            ))}
                        </select>
                        {patients.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">No patients available. Please add a patient first.</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                        <select
                            value={appointmentDoctor}
                            onChange={(e) => setAppointmentDoctor(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a doctor</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={appointmentStatus}
                            onChange={(e) => setAppointmentStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex space-x-3">
                        <button type="submit" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                            <Save className="w-4 h-4" />
                            <span>{editingItem ? "Update" : "Create"}</span>
                        </button>
                        <button 
                            type="button"
                            className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetForms();
                            }}
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </form>
            );

        case 'patient':
            return (
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Enter patient full name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                        <input
                            type="date"
                            value={patientBirthDate}
                            onChange={(e) => setPatientBirthDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder="+90 532 123 4567"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={patientAddress}
                            onChange={(e) => setPatientAddress(e.target.value)}
                            placeholder="Enter address"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button type="submit" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                            <Save className="w-4 h-4" />
                            <span>{editingItem ? "Update" : "Create"}</span>
                        </button>
                        <button 
                            type="button"
                            className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetForms();
                            }}
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </form>
            );

        case 'medication':
            return (
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                        <input
                            type="text"
                            value={medicationName}
                            onChange={(e) => setMedicationName(e.target.value)}
                            placeholder="Enter medication name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            value={medicationQuantity}
                            onChange={(e) => setMedicationQuantity(e.target.value)}
                            placeholder="Enter quantity"
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <input
                            type="text"
                            value={medicationType}
                            onChange={(e) => setMedicationType(e.target.value)}
                            placeholder="e.g., Tablet, Capsule, Syrup"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                        <input
                            type="date"
                            value={medicationExpirationDate}
                            onChange={(e) => setMedicationExpirationDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button type="submit" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                            <Save className="w-4 h-4" />
                            <span>{editingItem ? "Update" : "Create"}</span>
                        </button>
                        <button 
                            type="button"
                            className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
                            onClick={() => {
                                setShowModal(false);
                                setEditingItem(null);
                                resetForms();
                            }}
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </form>
            );

        default:
            return null;
    }
};

//  rendering component which renders the main dashboard layout including the main content and modals

return (
    <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-600">System Administrator</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
            </div>
            </div>
        </div>
        </div>
    </header>

    {/* Navigation */}
    <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 py-4 overflow-x-auto">
            <TabButton id="home" label="Home" icon={Building2} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <TabButton id="appointments" label="Appointments" icon={Calendar} isActive={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
            <TabButton id="doctors" label="Doctors" icon={Users} isActive={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} />
            <TabButton id="departments" label="Departments" icon={Building2} isActive={activeTab === 'departments'} onClick={() => setActiveTab('departments')} />
            <TabButton id="patients" label="Patients" icon={Users} isActive={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
            <TabButton id="medications" label="Medications" icon={Pill} isActive={activeTab === 'medications'} onClick={() => setActiveTab('medications')} />
        </div>
        </div>
    </nav>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
    </main>

    {/* Modal */}
    {showModal && (
        <Modal title={`${editingItem ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}>
        {renderModalContent()}
        </Modal>
    )}

    </div>
);
};

export default MedipolHospitalSystem;