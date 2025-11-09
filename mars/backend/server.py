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


    
def add_person(fname: str, lname: str, gender: str, birth_date: str,  # format 'YYYY-MM-DD'
    email: str, address: str, phone: str, username: str, password: str, emergency_contact_name: str,
    emergency_contact_phone: str, blood_type:str, medical_note: str, allergy_note: str) -> int:

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
            emergency_contact_phone,
            blood_type,
            medical_note,
            allergy_note
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            hash_password(password),
            emergency_contact_name,
            emergency_contact_phone,
            blood_type,
            medical_note,
            allergy_note
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
        SELECT *
        FROM person p
        WHERE p.person_id = %s;
    """
    cursor.execute(select_query, (person_id,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
 
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
        "blood_type": fetched_row[12],
        "medical_note": fetched_row[13],
        "allergy_note": fetched_row[14]
    }
    cursor.close()
    return person


@app.route('/PersonalLogin',methods=['POST'])
def Personlogin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400

    stored_hash = get_person_pw_by_username(username)
    if not stored_hash:
        return {"success": False, "message": "User not found."}, 404

    if check_password(password, stored_hash):
        person_id = get_person_id_by_username(username)
        person = get_person_by_id(person_id)
        return {"success": True, "message": "Logged in successfully!"}, 200 # tbh could change this to returning person?
    else:
        return {"success": False, "message": "Incorrect password."}, 401
 
@app.route('/POLogin',methods=['POST'])
def POlogin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400

    stored_hash = get_employee_pw_by_usr(username)
    if not stored_hash:
        return {"success": False, "message": "User not found."}, 404

    if check_password(password, stored_hash):

        return {"success": True, "message": "Logged in!!"}, 200
    else:
        return {"success": False, "message": "Incorrect password!"}, 401
     

@app.route('/CustomerFillable', methods=['POST'])
def signup():
    data = request.get_json()

    fname = data.get("fname")
    lname = data.get("lname")
    gender = data.get("gender")
    birth_date = data.get("birth_date")
    email = data.get("email")
    address = data.get("address")
    phone = data.get("phone")
    username = data.get("username")
    password = data.get("password")
    emergency_contact_name = data.get("emergency_contact_name")
    emergency_contact_phone = data.get("emergency_contact_phone")
    blood_type = data.get("blood_type")
    medical_note = data.get("medical_note")
    allergy_note = data.get("allergy_note")

    # make sure they filled stuff out
    required_fields = [fname, lname, gender, address, username, password, blood_type]
    if any(field is None for field in required_fields):
        return {"success": False, "message": "Missing required fields."}, 400


    hashed_pw = hash_password(password)


    try:
        new_person_id = add_person(
            fname, lname, gender, birth_date, email, address, phone,
            username, hashed_pw, emergency_contact_name, emergency_contact_phone,
            blood_type, medical_note, allergy_note
        )

        if new_person_id == -1:
            return {"success": False, "message": "Failed to create account LOL sucks to suck fr."}, 500

        #otherwise good
        return {"success": True, "message": "Signed up!"}, 201 # culd return person id instead or smth?

    except Exception as e:
        return {"success": False, "message": str(e)}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
