from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT')
    )
    return conn

def json_response(data=None, message="", status=200):
    return jsonify({
        "data": data,
        "message": message,
        "status": status
    }), status

# PATIENTS
@app.route('/api/patients', methods=['GET'])
def get_patients():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('SELECT * FROM Patient ORDER BY patient_id;')
    patients = cur.fetchall()
    
    cur.close()
    conn.close()
    return json_response(patients)

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('SELECT * FROM Patient WHERE patient_id = %s;', (patient_id,))
    patient = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not patient:
        return json_response(None, "Patient not found", 404)
    return json_response(patient)

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.get_json()
    required = ['patient_name', 'ppatient_surname']  # Fixed: removed patient_id, use correct column name
    if not all(field in data for field in required):
        return json_response(None, "Missing required fields", 400)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            # Fixed: removed patient_id (auto-generated), use correct column names
            'INSERT INTO Patient (patient_name, ppatient_surname, bdate, phone, address) '
            'VALUES (%s, %s, %s, %s, %s) RETURNING *;',
            (data['patient_name'], data['ppatient_surname'],
            data.get('bdate'), data.get('phone'), data.get('address'))
        )
        new_patient = cur.fetchone()
        conn.commit()
        return json_response(new_patient, "Patient created", 201)
    except psycopg2.IntegrityError:
        conn.rollback()
        return json_response(None, "Patient already exists", 400)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            # Fixed: use correct column names
            'UPDATE Patient SET patient_name = %s, ppatient_surname = %s, bdate = %s, phone = %s, address = %s '
            'WHERE patient_id = %s RETURNING *;',
            (data.get('patient_name'), data.get('ppatient_surname'),
            data.get('bdate'), data.get('phone'), data.get('address'), patient_id)
        )
        updated_patient = cur.fetchone()
        conn.commit()
        
        if not updated_patient:
            return json_response(None, "Patient not found", 404)
        return json_response(updated_patient, "Patient updated", 200)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('DELETE FROM Patient WHERE patient_id = %s;', (patient_id,))
        if cur.rowcount == 0:
            return json_response(None, "Patient not found", 404)
        conn.commit()
        return json_response(None, "Patient deleted", 200)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()


# DOCTORS - Updated to include department information
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Join with Works_In and Department tables to get department name
    cur.execute('''
        SELECT d.doctor_id, d.doctor_name, d.doctor_surname, dep.department_name
        FROM Doctor d
        LEFT JOIN Works_In wi ON d.doctor_id = wi.doctor_id
        LEFT JOIN Department dep ON wi.department_name = dep.department_name
        ORDER BY d.doctor_id;
    ''')
    doctors = cur.fetchall()
    
    cur.close()
    conn.close()
    return json_response(doctors)

# DEPARTMENTS
@app.route('/api/departments', methods=['GET'])
def get_departments():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('SELECT * FROM Department ORDER BY department_id;')
    departments = cur.fetchall()
    
    cur.close()
    conn.close()
    return json_response(departments)

# APPOINTMENTS
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        SELECT a.*, p.patient_name, p.ppatient_surname, d.doctor_name, d.doctor_surname 
        FROM Appointment a
        JOIN Patient p ON a.patient_id = p.patient_id
        JOIN Assigned ass ON a.appointment_id = ass.appointment_id
        JOIN Doctor d ON ass.doctor_id = d.doctor_id
        ORDER BY a.appointment_date;
    ''')
    appointments = cur.fetchall()
    
    cur.close()
    conn.close()
    return json_response(appointments)

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    required = ['patient_id', 'doctor_id', 'appointment_date']  # Fixed: removed appointment_id requirement
    if not all(field in data for field in required):
        return json_response(None, "Missing required fields", 400)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Start transaction
        cur.execute('BEGIN')
        
        # Create appointment - let appointment_id auto-generate
        cur.execute(
            'INSERT INTO Appointment (patient_id, status, appointment_cost, appointment_date, diagnoses) '
            'VALUES (%s, %s, %s, %s, %s) RETURNING *;',
            (data['patient_id'], data.get('status', 'Scheduled'),
            data.get('appointment_cost', 100.00), data['appointment_date'], data.get('diagnoses'))
        )
        new_appointment = cur.fetchone()
        
        # Assign doctor
        cur.execute(
            'INSERT INTO Assigned (doctor_id, appointment_id) VALUES (%s, %s);',
            (data['doctor_id'], new_appointment['appointment_id'])
        )
        
        conn.commit()
        return json_response(new_appointment, "Appointment created", 201)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

# MEDICATIONS
@app.route('/api/medications', methods=['GET'])
def get_medications():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('SELECT * FROM Medication ORDER BY medication_name;')
    medications = cur.fetchall()
    
    cur.close()
    conn.close()
    return json_response(medications)

@app.route('/api/medications', methods=['POST'])
def create_medication():
    data = request.get_json()
    required = ['medication_name', 'expiration_date']
    if not all(field in data for field in required):
        return json_response(None, "Missing required fields", 400)
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            'INSERT INTO Medication (medication_name, expiration_date, quantity) '
            'VALUES (%s, %s, %s) RETURNING *;',
            (data['medication_name'], data['expiration_date'], data.get('quantity', 0))
        )
        new_medication = cur.fetchone()
        conn.commit()
        return json_response(new_medication, "Medication created", 201)
    except psycopg2.IntegrityError:
        conn.rollback()
        return json_response(None, "Medication already exists", 400)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

@app.route('/api/medications/<medication_name>', methods=['PUT'])
def update_medication(medication_name):
    data = request.get_json()
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            'UPDATE Medication SET expiration_date = %s, quantity = %s '
            'WHERE medication_name = %s RETURNING *;',
            (data.get('expiration_date'), data.get('quantity'), medication_name)
        )
        updated_medication = cur.fetchone()
        conn.commit()
        
        if not updated_medication:
            return json_response(None, "Medication not found", 404)
        return json_response(updated_medication, "Medication updated", 200)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

@app.route('/api/medications/<medication_name>', methods=['DELETE'])
def delete_medication(medication_name):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('DELETE FROM Medication WHERE medication_name = %s;', (medication_name,))
        if cur.rowcount == 0:
            return json_response(None, "Medication not found", 404)
        conn.commit()
        return json_response(None, "Medication deleted", 200)
    except Exception as e:
        conn.rollback()
        return json_response(None, str(e), 400)
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)