"""
Automated Database Initialization Script for Pharmaceutical Management System (PMS)
Builds SQLite database `pharmacy.db` and populates all tables, constraints, views, and triggers.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pharmacy.db")

SQL_FILES = [
    "01_schema.sql",
    "02_constraints_indexes.sql",
    "03_sample_data.sql",
    "04_views_queries.sql",
    "05_triggers_procedures.sql"
]

def init_database():
    print(f"[*] Initializing Pharmaceutical Database at: {DB_PATH}")
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("[+] Removed old database file.")
        except Exception as e:
            print(f"[-] Note removing old db: {e}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    for sql_file in SQL_FILES:
        file_path = os.path.join(BASE_DIR, sql_file)
        print(f"[>] Executing {sql_file}...")
        with open(file_path, "r", encoding="utf-8") as f:
            script_content = f.read()
        
        # Execute script
        try:
            cursor.executescript(script_content)
            print(f"[✓] {sql_file} successfully executed.")
        except Exception as err:
            print(f"[!] Error in {sql_file}: {err}")
            raise err

    conn.commit()
    
    # Verify counts
    cursor.execute("SELECT count(*) FROM Medicine")
    med_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM Batch")
    batch_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM Invoice")
    inv_count = cursor.fetchone()[0]

    print("\n--- DATABASE INITIALIZATION SUMMARY ---")
    print(f"Total Medicines Registered: {med_count}")
    print(f"Total Batches Tracked:      {batch_count}")
    print(f"Total Invoices Seeded:      {inv_count}")
    print("Database initialization complete! Ready for backend and frontend.")

    conn.close()

if __name__ == "__main__":
    init_database()
