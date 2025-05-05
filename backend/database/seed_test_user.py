#!/usr/bin/env python3
"""
Seed script to create a test user for development purposes
"""

import uuid
import hashlib
from db_connection import connect

def create_test_user():
    conn = connect()
    cur = conn.cursor()
    
    # Check if the test user already exists
    test_user_id = '9b069ca0-bbcb-4989-9fa1-06a9a02e9d20'  # The specific user ID we're using
    cur.execute("SELECT id FROM \"user\" WHERE id = %s", (test_user_id,))
    if cur.fetchone():
        print(f"Test user with ID {test_user_id} already exists")
        conn.close()
        return
    
    # Create a simple password hash (not secure, just for development)
    password = "testpassword"
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        # Insert the test user
        cur.execute(
            'INSERT INTO "user" (id, username, email, password_hash, role, first_name, last_name) VALUES (%s, %s, %s, %s, %s, %s, %s)',
            (test_user_id, "testuser", "test@example.com", password_hash, "student", "Test", "User")
        )
        conn.commit()
        print(f"Created test user with ID: {test_user_id}")
    except Exception as e:
        conn.rollback()
        print(f"Error creating test user: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_test_user()