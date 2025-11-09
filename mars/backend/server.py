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
    return conn


@app.route('/PersonalLogin',methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400
