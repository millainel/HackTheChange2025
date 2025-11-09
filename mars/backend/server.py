from flask import Flask, request
from flask_cors import CORS
import psycopg2
import os
import random
import json
import re

import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "your_database")
DB_USER = os.getenv("DB_USER", "your_username")
DB_PASS = os.getenv("DB_PASS", "your_password")

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    return conn.cursor()

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8') 

def check_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def add_medical_record(person_id: int, blood_type:str, medical_note: str) -> int:
    cursor = get_db_connection()
    insert_query = """
        INSERT INTO medical_history (person_id, blood_type, medical_note)
        VALUES (%s, %s, %s)
        RETURNING note_id;
    """
    cursor.execute(insert_query, (person_id, blood_type, medical_note))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        return -1
    new_id = int(fetched_row[0])

    cursor.close()
    return new_id   

def add_allergies(person_id: str, allergy_note: str) -> int:
    cursor = get_db_connection()
    insert_query = """
        INSERT INTO allergies (person_id, allergy_note)
        VALUES (%s, %s)
        RETURNING allergy_id;
    """
    cursor.execute(insert_query, (person_id, allergy_note))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        return -1
    new_id = int(fetched_row[0])

    cursor.close()
    return new_id 
    
def add_person(fname: str, lname: str, gender: str, birth_date: str,  # format 'YYYY-MM-DD'
    email: str, address: str, phone: str, username: str, password: str, emergency_contact_name: str,
    emergency_contact_phone: str) -> int:

    cursor = get_db_connection()
    insert_query = """
        INSERT INTO person (
            fname,
            lname,
            gender,
            birth_date,
            email,
            address,
            phone,
            username,
            password,
            emergency_contact_name,
            emergency_contact_phone
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING person_id;
    """
    cursor.execute(
        insert_query,
        (
            fname,
            lname,
            gender,
            birth_date,
            email,
            address,
            phone,
            username,
            password,
            emergency_contact_name,
            emergency_contact_phone
        )
    )
    fetched_row = cursor.fetchone()
    cursor.close()

    if not fetched_row:
        return -1

    return int(fetched_row[0])   

def get_person_id_by_username(username: str):
    cursor = get_db_connection()
    select_query = """
        SELECT p.person_id
        FROM person p
        WHERE p.username = %s;
"""
    cursor.execute(select_query, (username,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
    return int(fetched_row[0])

def get_person_pw_by_username(username: str) -> str:
    cursor = get_db_connection()
    select_query = """
        SELECT p.password
        FROM person p
        WHERE p.username = %s;
"""
    cursor.execute(select_query, (username,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
    return str(fetched_row[0])

def get_employee_pw_by_usr(username: str):
    cursor = get_db_connection()
    select_query = """
        SELECT e.password
        FROM employee e
        WHERE e.username = %s;
"""
    cursor.execute(select_query, (username,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
    return str(fetched_row[0])

def add_employee(username: str, password: str) -> int:
    cursor = get_db_connection()
    insert_query = """
        INSERT INTO employee (username, password)
        VALUES (%s, %s)
        RETURNING employee_id;
    """
    cursor.execute(insert_query, (username, hash_password(password)))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        return -1
    new_id = int(fetched_row[0])

    cursor.close()
    return new_id  


def get_person_by_id(person_id: str):
    cursor = get_db_connection()
    select_query = """
        SELECT
            p.person_id,
            p.fname,
            p.lname,
            p.gender,
            p.birth_date,
            p.email,
            p.address,
            p.phone,
            p.username,
            p.password,
            p.emergency_contact_name,
            p.emergency_contact_phone,
            m.blood_type,
            m.medical_note,
            a.allergy_notes
        FROM person p
        LEFT JOIN medical_history m ON p.person_id = m.person_id
        LEFT JOIN allergies a ON p.person_id = a.person_id
        WHERE p.person_id = %s;
    """
    cursor.execute(select_query, (person_id,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
    medical_history = {
        "blood_type": fetched_row[12],
        "medical_note": fetched_row[13],
    }
    person = {
        "person_id": fetched_row[0],
        "fname": fetched_row[1],
        "lname": fetched_row[2],
        "gender": fetched_row[3],
        "birth_date": fetched_row[4],
        "email": fetched_row[5],
        "address": fetched_row[6],
        "phone": fetched_row[7],
        "username": fetched_row[8],
        "password": fetched_row[9],
        "emergency_contact_name": fetched_row[10],
        "emergency_contact_phone": fetched_row[11],
        "medical_history": medical_history,
        "allergies": fetched_row[14]
    }
    cursor.close()
    return person


@app.route('/PersonalLogin',methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400
