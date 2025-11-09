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

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

def get_db_connection():
    conn = psycopg2.connect(
         dbname="mars_db", user="postgres", password="postgres", host="localhost", port=5432

    )
    return conn

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8') 

def check_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def username_exists(username: str) -> bool:
    uname = (username or "").strip()
    if not uname:
        return False

    sql = """
        SELECT EXISTS(
          SELECT 1 FROM person
          -- choose exact or case-insensitive:
          -- WHERE username = %s
          WHERE LOWER(username) = LOWER(%s)
        );
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (uname,))
            exists = cur.fetchone()[0]  # bool
            return bool(exists)
    except Exception as e:
        print("username_exists error:", e)
        # be conservative in /check_username (we returned 200 anyway).
        # Here we can also return False to avoid blocking the user if DB hiccups.
        return False
    finally:
        if conn:
            conn.close()

@app.route('/check_username', methods=['POST'])
def check_username():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return {"exists": False, "message": "No username provided"}, 400

    exists = username_exists(username)
    return {
        "exists": exists,
        "message": "Username already taken" if exists else "Username available"
    }, 200


import psycopg2

def add_person(
    fname: str,
    lname: str,
    gender: str,
    birth_date: str,  # 'YYYY-MM-DD' or None
    email: str,
    address: str,
    phone: str,
    username: str,
    password: str,  # raw; we will hash here
    emergency_contact_name: str,
    emergency_contact_phone: str,
    blood_type: str,
    medical_note: str,
    allergy_note: str,   # <-- singular to match column name
    device_id: str,
) -> int:
    """
    Inserts a row into public.person and returns the new person_id, or -1 on failure.
    """
    sql = """
        INSERT INTO public.person (
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
            allergy_notes,           -- <-- make sure this column exists in the DB
            device_id
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s
        )
        RETURNING person_id;
    """

    conn = None
    try:
        conn = get_db_connection()            # MUST return a connection, not a cursor
        with conn.cursor() as cur:
            cur.execute(sql, (
                fname,
                lname,
                gender,
                birth_date,
                email,
                address,
                phone,
                username,
                hash_password(password),       # hash here; then DO NOT hash in the route
                emergency_contact_name,
                emergency_contact_phone,
                blood_type,
                medical_note,
                allergy_note,
                device_id,
            ))
            row = cur.fetchone()
        conn.commit()                        

        if not row or row[0] is None:
            return -1
        return int(row[0])

    except Exception as e:
        if conn:
            conn.rollback()
        print("add_person error:", e)
        return -1

    finally:
        if conn:
            conn.close()

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
        "allergy_note": fetched_row[14],
        "device_id": fetched_row[15]
    }
    cursor.close()
    return person

def get_person_by_dev_id(device_id: str):
    cursor = get_db_connection()
    select_query = """
        SELECT *
        FROM person p
        WHERE p.device_id = %s;
    """
    cursor.execute(select_query, (device_id,))
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
        "allergy_note": fetched_row[14],
        "device_id": fetched_row[15]
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
    allergy_notes = data.get("allergy_note")
    device_id = data.get("device_id")

    # make sure they filled stuff out
    required_fields = [fname, lname, gender, address, username, password, blood_type, device_id]
    if any(field is None for field in required_fields):
        return {"success": False, "message": "Missing required fields."}, 400
    
    #check username taken
    # pw = get_person_pw_by_username(username)
    # if pw != -1:
    #     return {"success": False, "message": "Username already taken."}, 400
    
    #check password
    # if len(password) < 8:
    #     return {"success": False, "message": "Error: Password must be at least 8 characters long."}, 400
    # if not any(char.isdigit() for char in password):
    #     return {"success": False, "message": "Error: Password needs a digit."}, 400
    # if not any(char.isupper() for char in password):
    #     return {"success": False, "message": "Error: Password needs an upper case."}, 400
    # if not any(char.islower() for char in password):
    #     return {"success": False, "message": "Error: Password needs a lower case."}, 400
    # if not any(char in "!@#$%^&*()-_=+[];:,<.>/?|`~" for char in password):
    #     return {"success": False, "message": "Error: Password needs a special character. (!@#$%^&*()-_=+[];:,<.>/?|`~)"}, 400


    hashed_pw = hash_password(password)


    try:
        new_person_id = add_person(
            fname, lname, gender, birth_date, email, address, phone,
            username, hashed_pw, emergency_contact_name, emergency_contact_phone,
            blood_type, medical_note, allergy_notes, device_id
        )

        if new_person_id == -1:
            return {"success": False, "message": "Failed to create account LOL sucks to suck fr."}, 500

        #otherwise good
        return {"success": True, "message": "Signed up!"}, 201 # culd return person id instead or smth?

    except Exception as e:
        return {"success": False, "message": str(e)}, 500


@app.route('/POViewPage', methods=['POST'])
# def get_person_by_username():
#     data = request.get_json()
#     username = data.get("username")
#     if not username:
#         return {"success": False, "message": "Missing username."}, 400

#     person_id = get_person_id_by_username(username)
#     if not person_id:
#         return {"success": False, "message": "User not found."}, 404

#     person = get_person_by_id(person_id)
#     if not person:
#         return {"success": False, "message": "Person not found."}, 404

#     # REMOVE THEIR PASSWORD
#     person.pop("password", None)

#     return {"success": True, "person": person}, 200

def get_person_by_device():
    data = request.get_json()
    device_id = data.get("device_id")
    if not device_id:
        return {"success": False, "message": "Missing device id."}, 400

    person = get_person_by_dev_id(device_id)

    if not person:
        return {"success": False, "message": "Person not found."}, 404

    # REMOVE THEIR PASSWORD
    person.pop("password", None)

    return {"success": True, "person": person}, 200



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
