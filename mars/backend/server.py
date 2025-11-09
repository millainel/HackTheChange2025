from flask import Flask, request
from flask_cors import CORS
import psycopg2
import os
import json
import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# If you prefer env vars, wire these up; the get_db_connection below currently uses literals.
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "mars_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))

# ---------- DB Connection ----------
def get_db_connection():
    """
    Returns a psycopg2 connection. Caller is responsible for closing it.
    """
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT,
    )

# ---------- Password Utilities ----------
def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def check_password(plain_password: str, hashed_password: str) -> bool:
    """
    Returns True if the plain password matches the stored bcrypt hash.
    Returns False (without throwing) if the stored value isn't a valid hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, AttributeError):
        # Stored value isn't a valid bcrypt hash or is None/not a string
        return False

# ---------- Queries / Helpers ----------
def username_exists(username: str) -> bool:
    uname = (username or "").strip()
    if not uname:
        return False

    sql = """
        SELECT EXISTS(
            SELECT 1 FROM person
            WHERE LOWER(username) = LOWER(%s)
        );
    """

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (uname,))
            exists = cur.fetchone()[0]
            return bool(exists)
    except Exception as e:
        print("username_exists error:", e)
        # Be conservative; don't block signups because of a hiccup.
        return False
    finally:
        if conn:
            conn.close()

def add_person(
    fname: str,
    lname: str,
    gender: str,
    birth_date: str,   # 'YYYY-MM-DD' or None
    email: str,
    address: str,
    phone: str,
    username: str,
    password: str,     # already hashed by caller
    emergency_contact_name: str,
    emergency_contact_phone: str,
    blood_type: str,
    medical_note: str,
    allergy_note: str,  # singular in Python; maps to 'allergy_notes' column in DB
    device_id: str,
) -> int:
    """
    Inserts a row into public.person and returns the new person_id, or -1 on failure.
    NOTE: 'password' should already be a bcrypt hash.
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
            allergy_notes,
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
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                sql,
                (
                    fname,
                    lname,
                    gender,
                    birth_date,
                    email,
                    address,
                    phone,
                    username,
                    password,  # already hashed
                    emergency_contact_name,
                    emergency_contact_phone,
                    blood_type,
                    medical_note,
                    allergy_note,
                    device_id,
                ),
            )
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
    sql = """
        SELECT p.person_id
        FROM person p
        WHERE p.username = %s
        LIMIT 1;
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (username,))
            row = cur.fetchone()
            return int(row[0]) if row else None
    except Exception as e:
        print("get_person_id_by_username error:", e)
        return None
    finally:
        if conn:
            conn.close()

def get_person_pw_by_username(username: str):
    """
    Returns the stored password hash for a person by exact username,
    or None if not found.
    """
    sql = """
        SELECT password
        FROM person
        WHERE username = %s
        LIMIT 1;
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (username,))
            row = cur.fetchone()
            return row[0] if row else None
    except Exception as e:
        print("get_person_pw_by_username error:", e)
        return None
    finally:
        if conn:
            conn.close()

def get_employee_pw_by_usr(username: str):
    """
    Returns the stored password hash for an officer/employee by exact username,
    or None if not found.
    """
    if not username:
        return None

    sql = """
        SELECT password
        FROM employee
        WHERE username = %s
        LIMIT 1;
    """

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (username,))
            row = cur.fetchone()
            return row[0] if row else None
    except Exception as e:
        print("get_employee_pw_by_usr error:", e)
        return None
    finally:
        if conn:
            conn.close()

def add_employee(username: str, password: str) -> int:
    """
    Adds an employee. This function hashes the password internally.
    """
    sql = """
        INSERT INTO employee (username, password)
        VALUES (%s, %s)
        RETURNING employee_id;
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (username, hash_password(password)))
            row = cur.fetchone()
        conn.commit()
        if not row:
            return -1
        return int(row[0])
    except Exception as e:
        if conn:
            conn.rollback()
        print("add_employee error:", e)
        return -1
    finally:
        if conn:
            conn.close()

def get_person_by_id(person_id: str):
    sql = """
        SELECT *
        FROM person p
        WHERE p.person_id = %s;
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (person_id,))
            fetched_row = cur.fetchone()
            if not fetched_row:
                return None
            return {
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
                "device_id": fetched_row[15],
            }
    except Exception as e:
        print("get_person_by_id error:", e)
        return None
    finally:
        if conn:
            conn.close()

def get_person_by_dev_id(device_id: str):
    sql = """
        SELECT *
        FROM person p
        WHERE p.device_id = %s;
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(sql, (device_id,))
            fetched_row = cur.fetchone()
            if not fetched_row:
                return None
            return {
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
                "device_id": fetched_row[15],
            }
    except Exception as e:
        print("get_person_by_dev_id error:", e)
        return None
    finally:
        if conn:
            conn.close()

# ---------- Routes ----------
@app.route("/check_username", methods=["POST"])
def check_username():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return {"exists": False, "message": "No username provided"}, 400

    exists = username_exists(username)
    return {
        "exists": exists,
        "message": "Username already taken" if exists else "Username available",
    }, 200

@app.route("/PersonalLogin", methods=["POST"])
def Personlogin():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Missing username or password."}, 400

    stored_hash = get_person_pw_by_username(username)
    if not stored_hash:
        return {"success": False, "message": "User not found."}, 404

    if check_password(password, stored_hash):
        person_id = get_person_id_by_username(username)
        # Optionally return person info (without password) if desired:
        # person = get_person_by_id(person_id)
        # if person: person.pop("password", None)
        return {"success": True, "message": "Logged in successfully!"}, 200
    else:
        return {"success": False, "message": "Incorrect password."}, 401

@app.route("/POLogin", methods=["POST"])
def POlogin():
    data = request.get_json(silent=True) or {}
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

@app.route("/CustomerFillable", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

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
    allergy_note = data.get("allergy_note")  # maps to DB's allergy_notes column
    device_id = data.get("device_id")

    # Validate required fields
    required_fields = [fname, lname, gender, address, username, password, blood_type, device_id]
    if any(field in (None, "") for field in required_fields):
        return {"success": False, "message": "Missing required fields."}, 400

    # Hash the password BEFORE inserting
    hashed_pw = hash_password(password)

    try:
        new_person_id = add_person(
            fname,
            lname,
            gender,
            birth_date,
            email,
            address,
            phone,
            username,
            hashed_pw,
            emergency_contact_name,
            emergency_contact_phone,
            blood_type,
            medical_note,
            allergy_note,
            device_id,
        )

        if new_person_id == -1:
            return {"success": False, "message": "Failed to create account."}, 500

        return {"success": True, "message": "Signed up!", "person_id": new_person_id}, 201
    except Exception as e:
        return {"success": False, "message": str(e)}, 500

@app.route("/POViewPage", methods=["POST"])
def get_person_by_device():
    """
    Given a device_id in the POST body, returns the associated person (sans password).
    """
    data = request.get_json(silent=True) or {}
    device_id = data.get("device_id")
    if not device_id:
        return {"success": False, "message": "Missing device id."}, 400

    person = get_person_by_dev_id(device_id)
    if not person:
        return {"success": False, "message": "Person not found."}, 404

    person.pop("password", None)
    return {"success": True, "person": person}, 200

@app.route("/PersonByUsername", methods=["POST"])
def person_by_username():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return {"success": False, "message": "Missing username."}, 400

    person_id = get_person_id_by_username(username)
    if not person_id:
        return {"success": False, "message": "User not found."}, 404

    person = get_person_by_id(person_id)
    if not person:
        return {"success": False, "message": "Person not found."}, 404

    person.pop("password", None)
    return {"success": True, "person": person}, 200

@app.route("/PersonUpdate", methods=["POST"])
def person_update():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    fields = data.get("fields") or {}

    if not username:
        return {"success": False, "message": "Missing username."}, 400
    if not isinstance(fields, dict) or not fields:
        return {"success": False, "message": "No fields provided to update."}, 400

    key_map = {
        "fname": "fname",
        "lname": "lname",
        "gender": "gender",
        "birth_date": "birth_date",
        "email": "email",
        "address": "address",
        "phone": "phone",
        "emergency_contact_name": "emergency_contact_name",
        "emergency_contact_phone": "emergency_contact_phone",
        "medical_note": "medical_note",
        "blood_type": "blood_type",
        "allergy_note": "allergy_notes",   
        "allergy_notes": "allergy_notes",
    }

    updates, values = [], []
    for k, v in fields.items():
        col = key_map.get(k)
        if col is None:
            continue
        updates.append(f"{col} = %s")
        values.append(v)

    if not updates:
        return {"success": False, "message": "No valid fields to update."}, 400

    select_sql = "SELECT person_id FROM person WHERE LOWER(username) = LOWER(%s) LIMIT 1;"
    update_sql = f"UPDATE person SET {', '.join(updates)} WHERE LOWER(username) = LOWER(%s) RETURNING person_id;"

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(select_sql, (username,))
            row = cur.fetchone()
            if not row:
                return {"success": False, "message": "User not found."}, 404
            cur.execute(update_sql, (*values, username))
            ret = cur.fetchone()
        conn.commit()

        person = get_person_by_id(ret[0]) if ret else None
        if not person:
            return {"success": False, "message": "Failed to load updated person."}, 500
        person.pop("password", None)
        return {"success": True, "person": person}, 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("person_update error:", e)
        return {"success": False, "message": "Update failed."}, 500
    finally:
        if conn:
            conn.close()



if __name__ == "__main__":
    # add_employee("officer1", "officer1")  # one-time helper, if needed
    app.run(host="0.0.0.0", port=5001, debug=True)
