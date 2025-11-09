from flask import Flask, request
from flask_cors import CORS
import psycopg2
import os
import random
import json
import re

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

def add_person(name: str, email: str, address: str, phone: str) -> int:
    cursor = get_db_connection()
    insert_query = """
        INSERT INTO persons (name, email, address, phone)
        VALUES (%s, %s, %s, %s), RETURNING person_id;
    """
    cursor.execute(insert_query, (name, email, address, phone))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        return -1
    
    # else get the first element of the fetched row
    new_id = int(fetched_row[0])
    cursor.close()
    return new_id




def add_medical_record(person_id: int, blood_type:str, medical_history: str) -> bool:
    cursor = get_db_connection()
    insert_query = """
        INSERT INTO medical_records (person_id, blood_type, medical_history)
        VALUES (%s, %s, %s);
    """
    cursor.execute(insert_query, (person_id, blood_type, medical_history))
    fethed_row = cursor.fetchone()
    if not fethed_row:
        return -1
    new_id = int(fethed_row[0])

    cursor.close()
    return new_id   

def get_person_by_username(name: str):
    cursor = get_db_connection()
    select_query = """
        SELECT person_id, name, email, address, phone
        FROM persons
        WHERE name = %s;
    """
    cursor.execute(select_query, (name,))
    fetched_row = cursor.fetchone()
    if not fetched_row:
        cursor.close()
        return None
    
    # unpack the row into a dictionary
    person = {
        "person_id": fetched_row[0],
        "name": fetched_row[1],
        "email": fetched_row[2],
        "address": fetched_row[3],
        "phone": fetched_row[4]
    }
    cursor.close()
    return person
# add the join and join every table return everything in a dictionary format





@app.route('/PersonalLogin',methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400
