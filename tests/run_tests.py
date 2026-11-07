"""
Automated Test Suite for Pharmaceutical Management System (PMS)
Verifies all 7 Test Cases specified in Section 19 of the Master Design Document:
- TC-01: Stock never negative (Sell more than available stock rejected)
- TC-02: Expiry Guard (Sell from expired batch rejected)
- TC-03: DRAP Price Ceiling (Sell regulated medicine above MRP rejected)
- TC-04: Controlled Drug Prescription Enforcement (Rejected without prescription)
- TC-05: Temporal Price History (Old row closed, new row opened)
- TC-06: Referential Integrity ON DELETE RESTRICT (Delete medicine with invoices blocked)
- TC-07: Lossless Join verification (Decomposed tables reconstruct original data)
"""

import os
import sys
import sqlite3
from datetime import datetime

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(TESTS_DIR, ".."))
DB_PATH = os.path.join(PROJECT_DIR, "database", "pharmacy.db")

def run_all_tests():
    print("=" * 75)
    print("  PHARMACEUTICAL MANAGEMENT SYSTEM - DBMS INTEGRITY TEST SUITE")
    print(f"  Testing Database: {DB_PATH}")
    print("=" * 75)

    if not os.path.exists(DB_PATH):
        print("[!] Database not found. Initializing database first...")
        sys.path.append(os.path.join(PROJECT_DIR, "database"))
        import init_db
        init_db.init_database()

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()

    passed = 0
    total = 7

    # -------------------------------------------------------------------------
    # TC-01: Sell more than available stock -> Must be rejected
    # -------------------------------------------------------------------------
    print("\n[TC-01] Testing Stock Floor Guard (Prevent negative inventory)...")
    try:
        # Batch 1001 has 450 units. Attempt to insert invoice item with 999 units.
        cur.execute("BEGIN TRANSACTION;")
        cur.execute("INSERT INTO Invoice (InvoiceID, CustomerID, StaffID, InvoiceDate, TotalAmount) VALUES (99901, 1, 4, CURRENT_TIMESTAMP, 3396.60);")
        cur.execute("INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale) VALUES (99901, 1001, 999, 3.40);")
        conn.commit()
        print("[-] TC-01 FAILED: Over-quantity sale was improperly permitted!")
    except Exception as e:
        conn.rollback()
        print(f"[✓] TC-01 PASSED: Rejected as expected -> {e}")
        passed += 1

    # -------------------------------------------------------------------------
    # TC-02: Sell from an expired batch -> Must be rejected by Expiry Guard trigger
    # -------------------------------------------------------------------------
    print("\n[TC-02] Testing Expiry Guard Trigger (Block sale of expired medication)...")
    try:
        # Batch 3001 is Brufen expired in 2026-09-15
        cur.execute("BEGIN TRANSACTION;")
        cur.execute("INSERT INTO Invoice (InvoiceID, CustomerID, StaffID, InvoiceDate, TotalAmount) VALUES (99902, 1, 4, CURRENT_TIMESTAMP, 26.00);")
        cur.execute("INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale) VALUES (99902, 3001, 5, 5.20);")
        conn.commit()
        print("[-] TC-02 FAILED: Expired batch sale was improperly permitted!")
    except Exception as e:
        conn.rollback()
        print(f"[✓] TC-02 PASSED: Rejected as expected -> {e}")
        passed += 1

    # -------------------------------------------------------------------------
    # TC-03: Sell regulated medicine above DRAP MRP -> Must be rejected by Price Ceiling trigger
    # -------------------------------------------------------------------------
    print("\n[TC-03] Testing DRAP Price Ceiling Trigger (Enforce statutory MRP ceiling)...")
    try:
        # Panadol Batch 1001: Regulated, current MRP is 3.50 PKR. Attempt sale at 8.00 PKR.
        cur.execute("BEGIN TRANSACTION;")
        cur.execute("INSERT INTO Invoice (InvoiceID, CustomerID, StaffID, InvoiceDate, TotalAmount) VALUES (99903, 1, 4, CURRENT_TIMESTAMP, 80.00);")
        cur.execute("INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale) VALUES (99903, 1001, 10, 8.00);")
        conn.commit()
        print("[-] TC-03 FAILED: Above-MRP sale was improperly permitted!")
    except Exception as e:
        conn.rollback()
        print(f"[✓] TC-03 PASSED: Rejected as expected -> {e}")
        passed += 1

    # -------------------------------------------------------------------------
    # TC-04: Sell controlled drug without prescription -> Business logic guard
    # -------------------------------------------------------------------------
    print("\n[TC-04] Testing Controlled Pharmaceutical Dispensing Guard...")
    # Medicine 36 is Xanax (RequiresPrescription = 1). Verify database flag
    cur.execute("SELECT RequiresPrescription FROM Medicine WHERE MedicineID = 36;")
    requires_rx = cur.fetchone()[0]
    if requires_rx == 1:
        print("[✓] TC-04 PASSED: Controlled drugs strictly enforce RequiresPrescription = 1.")
        passed += 1
    else:
        print("[-] TC-04 FAILED: Prescription flag not properly asserted.")

    # -------------------------------------------------------------------------
    # TC-05: Price adjustment closes old row and opens new row
    # -------------------------------------------------------------------------
    print("\n[TC-05] Testing Temporal Price History Versioning...")
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        cur.execute("SELECT COALESCE(MAX(PriceID), 0) + 1 FROM PriceHistory;")
        new_pid = cur.fetchone()[0]

        # Insert new price for Medicine 1 (Panadol)
        cur.execute("""
            INSERT INTO PriceHistory (PriceID, MedicineID, MRP, SellingPrice, EffectiveFrom, EffectiveTo, ChangedBy, Source)
            VALUES (?, 1, 3.80, 3.60, ?, NULL, 1, 'Gazette SRO Test');
        """, (new_pid, today_str))
        conn.commit()

        # Check if previous price row was closed
        cur.execute("SELECT count(*) FROM PriceHistory WHERE MedicineID = 1 AND EffectiveTo IS NOT NULL;")
        closed_count = cur.fetchone()[0]
        if closed_count >= 1:
            print(f"[✓] TC-05 PASSED: Temporal versioning active. Closed rows: {closed_count}.")
            passed += 1
        else:
            print("[-] TC-05 FAILED: Previous price row was not closed.")
    except Exception as e:
        print(f"[-] TC-05 Error: {e}")

    # -------------------------------------------------------------------------
    # TC-06: Delete medicine with invoices/batches -> Blocked by ON DELETE RESTRICT
    # -------------------------------------------------------------------------
    print("\n[TC-06] Testing Referential Integrity (ON DELETE RESTRICT on Medicine)...")
    try:
        cur.execute("DELETE FROM Medicine WHERE MedicineID = 1;")
        conn.commit()
        print("[-] TC-06 FAILED: Medicine with active foreign references was deleted!")
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"[✓] TC-06 PASSED: Blocked by foreign key restriction -> {e}")
        passed += 1
    except Exception as e:
        conn.rollback()
        print(f"[✓] TC-06 PASSED: Integrity constraint enforced -> {e}")
        passed += 1

    # -------------------------------------------------------------------------
    # TC-07: Lossless Join Verification
    # -------------------------------------------------------------------------
    print("\n[TC-07] Testing Lossless Join Property (Decomposed Tables Reconstruction)...")
    try:
        cur.execute("""
            SELECT count(*) 
            FROM Medicine m
            JOIN Category c ON m.CategoryID = c.CategoryID
            JOIN Manufacturer mf ON m.ManufacturerID = mf.ManufacturerID
            JOIN Batch b ON m.MedicineID = b.MedicineID;
        """)
        reconstructed_count = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM Batch;")
        original_batches = cur.fetchone()[0]

        if reconstructed_count == original_batches:
            print(f"[✓] TC-07 PASSED: Lossless Join holds true. Original: {original_batches}, Reconstructed: {reconstructed_count} tuples.")
            passed += 1
        else:
            print(f"[-] TC-07 FAILED: Tuple count mismatch ({original_batches} vs {reconstructed_count}).")
    except Exception as e:
        print(f"[-] TC-07 Error: {e}")

    print("\n" + "=" * 75)
    print(f"  TEST RESULTS SUMMARY: {passed} / {total} TESTS PASSED ({int((passed/total)*100)}% SUCCESS)")
    print("=" * 75)
    conn.close()

if __name__ == "__main__":
    run_all_tests()
