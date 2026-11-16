"""
Pharmaceutical Management System (PMS) - Backend Server
Zero-external-dependency, production-grade REST API and Static File Server.
Utilizes Python standard library (http.server, sqlite3, json, hashlib).
Runs out-of-the-box on any Python 3.8+ installation.
"""

import os
import json
import sqlite3
import hashlib
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Base Directories
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
DB_PATH = os.path.join(PROJECT_DIR, "database", "pharmacy.db")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")

def get_db():
    """Returns a connection to the SQLite database with row factory and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def hash_pw(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

class PMSRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def _read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            return json.loads(body)
        return {}

    def _send_json(self, data, status=200):
        self._set_headers(status, "application/json")
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

    def _send_error(self, message, status=400):
        self._set_headers(status, "application/json")
        self.wfile.write(json.dumps({"error": message, "success": False}).encode('utf-8'))

    # =========================================================================
    # GET Handlers
    # =========================================================================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. API: System Dashboard Metrics
        if path == "/api/dashboard/metrics":
            conn = get_db()
            cur = conn.cursor()
            
            # Today's Sales
            cur.execute("""
                SELECT COALESCE(SUM(TotalAmount), 0) AS TodaySales, COUNT(*) AS InvoicesCount 
                FROM Invoice 
                WHERE DATE(InvoiceDate) = DATE('now')
            """)
            today_data = dict(cur.fetchone())

            # Expiring Count
            cur.execute("SELECT COUNT(*) FROM ExpiringSoon")
            expiring_count = cur.fetchone()[0]

            # Low Stock Count
            cur.execute("SELECT COUNT(*) FROM LowStock")
            low_stock_count = cur.fetchone()[0]

            # Price Alerts Count (MRP violations or negative margins)
            cur.execute("SELECT COUNT(*) FROM PriceComplianceAndCompetitiveness WHERE RegulatoryStatus LIKE 'VIOLATION%'")
            mrp_violations = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM MarginReport WHERE MarginHealth = 'LOSS ALERT'")
            loss_alerts = cur.fetchone()[0]

            # Total Inventory Value
            cur.execute("SELECT ROUND(SUM(QuantityInStock * PurchasePrice), 2) FROM Batch")
            total_inventory_val = cur.fetchone()[0] or 0.0

            conn.close()
            return self._send_json({
                "today_sales": today_data["TodaySales"],
                "today_invoices": today_data["InvoicesCount"],
                "expiring_batches_count": expiring_count,
                "low_stock_count": low_stock_count,
                "mrp_violations": mrp_violations,
                "loss_alerts": loss_alerts,
                "total_inventory_value": total_inventory_val
            })

        # 2. API: Medicines List (with Categories, Manufacturers, and Current Selling Price)
        elif path == "/api/medicines":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    m.MedicineID,
                    m.Name,
                    m.PricingCategory,
                    m.RequiresPrescription,
                    m.ReorderLevel,
                    c.CategoryID,
                    c.CategoryName,
                    mf.ManufacturerID,
                    mf.ManufacturerName,
                    ph.MRP,
                    ph.SellingPrice,
                    COALESCE((SELECT SUM(QuantityInStock) FROM Batch b WHERE b.MedicineID = m.MedicineID AND b.ExpiryDate > DATE('now')), 0) AS TotalStock
                FROM Medicine m
                JOIN Category c ON m.CategoryID = c.CategoryID
                JOIN Manufacturer mf ON m.ManufacturerID = mf.ManufacturerID
                LEFT JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL
                ORDER BY m.Name ASC
            """)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 3. API: Batches (Optionally filtered by medicineId)
        elif path == "/api/batches":
            med_id = query.get("medicineId", [None])[0]
            conn = get_db()
            cur = conn.cursor()
            sql = """
                SELECT 
                    b.BatchID,
                    b.MedicineID,
                    m.Name AS MedicineName,
                    s.SupplierName,
                    b.ExpiryDate,
                    b.QuantityInStock,
                    b.PurchasePrice,
                    CASE 
                        WHEN b.ExpiryDate < DATE('now') THEN 'EXPIRED'
                        WHEN julianday(b.ExpiryDate) - julianday('now') <= 30 THEN 'EXPIRING SOON'
                        ELSE 'ACTIVE'
                    END AS Status
                FROM Batch b
                JOIN Medicine m ON b.MedicineID = m.MedicineID
                JOIN Supplier s ON b.SupplierID = s.SupplierID
            """
            params = []
            if med_id:
                sql += " WHERE b.MedicineID = ?"
                params.append(med_id)
            sql += " ORDER BY b.ExpiryDate ASC"
            
            cur.execute(sql, params)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 4. API: Expiring Stock Report View
        elif path == "/api/batches/expiring":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM ExpiringSoon ORDER BY ExpiryDate ASC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 5. API: Low Stock Report View
        elif path == "/api/reports/low-stock":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM LowStock ORDER BY ShortfallUnits DESC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 6. API: Daily Sales View
        elif path == "/api/reports/daily-sales":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM DailySales ORDER BY SaleDate DESC LIMIT 30")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 7. API: Margin Report View
        elif path == "/api/reports/margins":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM MarginReport ORDER BY MarginPercentage ASC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 8. API: Price Alerts & Compliance View
        elif path == "/api/reports/price-alerts":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM PriceComplianceAndCompetitiveness ORDER BY VarianceFromMRP DESC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 9. API: Price History for a specific medicine
        elif path.startswith("/api/prices/") and path.endswith("/history"):
            parts = path.split("/")
            med_id = parts[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    ph.PriceID,
                    ph.MedicineID,
                    ph.MRP,
                    ph.SellingPrice,
                    ph.EffectiveFrom,
                    ph.EffectiveTo,
                    st.StaffName AS ChangedByName,
                    ph.Source
                FROM PriceHistory ph
                JOIN Staff st ON ph.ChangedBy = st.StaffID
                WHERE ph.MedicineID = ?
                ORDER BY ph.EffectiveFrom DESC
            """, (med_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 10. API: Supplier Quotes Comparison for a medicine
        elif path.startswith("/api/suppliers/compare/"):
            parts = path.split("/")
            med_id = parts[4]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    sq.QuoteID,
                    s.SupplierName,
                    s.Phone,
                    sq.QuotedPrice,
                    sq.QuoteDate
                FROM SupplierQuote sq
                JOIN Supplier s ON sq.SupplierID = s.SupplierID
                WHERE sq.MedicineID = ?
                ORDER BY sq.QuotedPrice ASC
            """, (med_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 11. API: Cheaper Substitutes for a medicine
        elif path.startswith("/api/medicines/") and path.endswith("/substitutes"):
            parts = path.split("/")
            med_id = parts[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                SELECT * FROM SubstituteMedicines
                WHERE OriginalMedicineID = ?
                ORDER BY CustomerSavingsPerUnit DESC
            """, (med_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return self._send_json(rows)

        # 12. API: Reference metadata (Categories, Manufacturers, Suppliers, Customers, Prescriptions)
        elif path == "/api/metadata":
            conn = get_db()
            cur = conn.cursor()
            categories = [dict(r) for r in cur.execute("SELECT * FROM Category ORDER BY CategoryName").fetchall()]
            manufacturers = [dict(r) for r in cur.execute("SELECT * FROM Manufacturer ORDER BY ManufacturerName").fetchall()]
            suppliers = [dict(r) for r in cur.execute("SELECT * FROM Supplier ORDER BY SupplierName").fetchall()]
            customers = [dict(r) for r in cur.execute("SELECT * FROM Customer ORDER BY CustomerName").fetchall()]
            prescriptions = [dict(r) for r in cur.execute("""
                SELECT p.PrescriptionID, p.CustomerID, c.CustomerName, p.DoctorName, p.PrescriptionDate 
                FROM Prescription p
                JOIN Customer c ON p.CustomerID = c.CustomerID
                ORDER BY p.PrescriptionDate DESC
            """).fetchall()]
            conn.close()
            return self._send_json({
                "categories": categories,
                "manufacturers": manufacturers,
                "suppliers": suppliers,
                "customers": customers,
                "prescriptions": prescriptions
            })

        # 13. Static Frontend Files Serving
        else:
            file_name = "index.html" if path in ["/", ""] else path.lstrip("/")
            full_path = os.path.join(FRONTEND_DIR, file_name)
            
            if os.path.exists(full_path) and os.path.isfile(full_path):
                ext = os.path.splitext(full_path)[1].lower()
                mimes = {
                    ".html": "text/html",
                    ".css": "text/css",
                    ".js": "application/javascript",
                    ".json": "application/json",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".svg": "image/svg+xml"
                }
                content_type = mimes.get(ext, "text/plain")
                self._set_headers(200, content_type)
                with open(full_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                # Fallback to index.html for Single-Page Application routing
                index_path = os.path.join(FRONTEND_DIR, "index.html")
                if os.path.exists(index_path):
                    self._set_headers(200, "text/html")
                    with open(index_path, "rb") as f:
                        self.wfile.write(f.read())
                else:
                    self._send_error("File Not Found", 404)

    # =========================================================================
    # POST Handlers
    # =========================================================================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        # 1. API: Authentication / Login
        if path == "/api/auth/login":
            username = body.get("username", "").strip()
            password = body.get("password", "").strip()
            if not username or not password:
                return self._send_error("Username and password are required.", 400)

            hashed = hash_pw(password)
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                SELECT StaffID, StaffName, Role, Username 
                FROM Staff 
                WHERE Username = ? AND (PasswordHash = ? OR PasswordHash = ?)
            """, (username, hashed, password)) # Allows both hashed and demo plain-input
            staff = cur.fetchone()
            conn.close()

            if staff:
                return self._send_json({
                    "success": True,
                    "token": f"pms-jwt-token-{staff['StaffID']}",
                    "user": dict(staff)
                })
            else:
                return self._send_error("Invalid username or password.", 401)

        # 2. API: Create New Medicine
        elif path == "/api/medicines":
            name = body.get("name")
            category_id = body.get("categoryId")
            manufacturer_id = body.get("manufacturerId")
            pricing_cat = body.get("pricingCategory", "Regulated")
            req_prescription = 1 if body.get("requiresPrescription") else 0
            reorder_level = int(body.get("reorderLevel", 50))
            initial_price = float(body.get("sellingPrice", 10.0))
            mrp = float(body.get("mrp")) if body.get("mrp") else None

            if not name or not category_id or not manufacturer_id:
                return self._send_error("Missing required medicine attributes.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                cur.execute("SELECT COALESCE(MAX(MedicineID), 0) + 1 FROM Medicine")
                new_id = cur.fetchone()[0]

                cur.execute("""
                    INSERT INTO Medicine (MedicineID, Name, CategoryID, ManufacturerID, PricingCategory, RequiresPrescription, ReorderLevel)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (new_id, name, category_id, manufacturer_id, pricing_cat, req_prescription, reorder_level))

                # Add initial price history
                cur.execute("SELECT COALESCE(MAX(PriceID), 0) + 1 FROM PriceHistory")
                price_id = cur.fetchone()[0]
                cur.execute("""
                    INSERT INTO PriceHistory (PriceID, MedicineID, MRP, SellingPrice, EffectiveFrom, ChangedBy, Source)
                    VALUES (?, ?, ?, ?, DATE('now'), 1, 'Initial Launch Entry')
                """, (price_id, new_id, mrp, initial_price))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "medicineId": new_id, "message": "Medicine created successfully."})
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        # 3. API: Point-of-Sale Complete Sale Transaction (SellMedicine ACID Transaction)
        elif path == "/api/sales":
            customer_id = body.get("customerId", 1)
            staff_id = body.get("staffId", 4)
            prescription_id = body.get("prescriptionId")
            items = body.get("items", []) # List of {batchId, quantity, unitPrice}

            if not items:
                return self._send_error("Cart is empty. Please select medicine batches to sell.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                conn.execute("BEGIN TRANSACTION;")

                # Calculate total and validate each item
                total_amount = 0.0
                validated_items = []

                for item in items:
                    batch_id = item.get("batchId")
                    qty = int(item.get("quantity", 1))

                    # 1. Fetch Batch, Medicine and Current Pricing info
                    cur.execute("""
                        SELECT 
                            b.BatchID,
                            b.ExpiryDate,
                            b.QuantityInStock,
                            b.PurchasePrice,
                            m.MedicineID,
                            m.Name AS MedicineName,
                            m.PricingCategory,
                            m.RequiresPrescription,
                            ph.MRP,
                            ph.SellingPrice
                        FROM Batch b
                        JOIN Medicine m ON b.MedicineID = m.MedicineID
                        LEFT JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL
                        WHERE b.BatchID = ?
                    """, (batch_id,))
                    record = cur.fetchone()

                    if not record:
                        raise ValueError(f"Batch ID #{batch_id} not found in pharmacy database.")

                    unit_price = float(item.get("unitPrice", record["SellingPrice"]))

                    # Constraint Check A: Expiry Guard
                    current_date = datetime.now().strftime("%Y-%m-%d")
                    if record["ExpiryDate"] < current_date:
                        raise ValueError(f"Safety Violation: Batch #{batch_id} for '{record['MedicineName']}' is EXPIRED ({record['ExpiryDate']}). Sale blocked.")

                    # Constraint Check B: Stock Guard
                    if record["QuantityInStock"] < qty:
                        raise ValueError(f"Stock Violation: Insufficient stock for '{record['MedicineName']}'. Available: {record['QuantityInStock']}, Requested: {qty}.")

                    # Constraint Check C: Prescription Requirement Guard
                    if record["RequiresPrescription"] == 1 and not prescription_id:
                        raise ValueError(f"Regulatory Violation: Medicine '{record['MedicineName']}' requires a valid doctor prescription. None was provided.")

                    # Constraint Check D: Price Ceiling Guard (DRAP Maximum Retail Price)
                    if record["PricingCategory"] == "Regulated" and record["MRP"] is not None and unit_price > record["MRP"]:
                        raise ValueError(f"Price Ceiling Violation: Unit price {unit_price} PKR exceeds Government DRAP MRP limit of {record['MRP']} PKR for '{record['MedicineName']}'.")

                    line_total = qty * unit_price
                    total_amount += line_total
                    validated_items.append({
                        "batchId": batch_id,
                        "quantity": qty,
                        "unitPrice": unit_price,
                        "medicineName": record["MedicineName"]
                    })

                # Insert Invoice Master
                cur.execute("SELECT COALESCE(MAX(InvoiceID), 0) + 1 FROM Invoice")
                invoice_id = cur.fetchone()[0]

                cur.execute("""
                    INSERT INTO Invoice (InvoiceID, CustomerID, StaffID, PrescriptionID, InvoiceDate, TotalAmount)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
                """, (invoice_id, customer_id, staff_id, prescription_id if prescription_id else None, total_amount))

                # Insert Invoice Line Items (Database trigger trg_deduct_batch_stock_after_sale decrements Batch stock automatically)
                for vi in validated_items:
                    cur.execute("""
                        INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale)
                        VALUES (?, ?, ?, ?)
                    """, (invoice_id, vi["batchId"], vi["quantity"], vi["unitPrice"]))

                conn.commit()
                conn.close()
                return self._send_json({
                    "success": True,
                    "invoiceId": invoice_id,
                    "totalAmount": round(total_amount, 2),
                    "message": "Sale transaction completed successfully and inventory updated."
                })

            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        # 4. API: Record New Price / Update MRP
        elif path == "/api/prices":
            medicine_id = body.get("medicineId")
            selling_price = float(body.get("sellingPrice", 0.0))
            mrp = float(body.get("mrp")) if body.get("mrp") else None
            changed_by = int(body.get("changedBy", 1))
            source = body.get("source", "DRAP Regulatory Update")

            if not medicine_id or selling_price <= 0:
                return self._send_error("Valid Medicine ID and Selling Price are required.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                now_str = datetime.now().strftime("%Y-%m-%d")

                # Close previous open price record
                cur.execute("""
                    UPDATE PriceHistory 
                    SET EffectiveTo = ? 
                    WHERE MedicineID = ? AND EffectiveTo IS NULL
                """, (now_str, medicine_id))

                # Insert new price record
                cur.execute("SELECT COALESCE(MAX(PriceID), 0) + 1 FROM PriceHistory")
                new_price_id = cur.fetchone()[0]

                cur.execute("""
                    INSERT INTO PriceHistory (PriceID, MedicineID, MRP, SellingPrice, EffectiveFrom, EffectiveTo, ChangedBy, Source)
                    VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
                """, (new_price_id, medicine_id, mrp, selling_price, now_str, changed_by, source))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "message": "Price updated and temporal history recorded."})
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        # 5. API: Add Stock / Create New Batch
        elif path == "/api/batches":
            medicine_id = body.get("medicineId")
            supplier_id = body.get("supplierId")
            expiry_date = body.get("expiryDate")
            quantity = int(body.get("quantity", 0))
            purchase_price = float(body.get("purchasePrice", 0.0))

            if not medicine_id or not supplier_id or not expiry_date or quantity <= 0:
                return self._send_error("All batch fields must be specified and quantity > 0.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                cur.execute("SELECT COALESCE(MAX(BatchID), 0) + 1 FROM Batch")
                new_batch_id = cur.fetchone()[0]

                cur.execute("""
                    INSERT INTO Batch (BatchID, MedicineID, SupplierID, ExpiryDate, QuantityInStock, PurchasePrice)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (new_batch_id, medicine_id, supplier_id, expiry_date, quantity, purchase_price))

                conn.commit()
                conn.close()
                return self._send_json({"success": True, "batchId": new_batch_id, "message": "New stock batch received."})
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        # 6. API: Add New Customer
        elif path == "/api/customers":
            name = body.get("name")
            phone = body.get("phone")
            if not name or not phone:
                return self._send_error("Customer name and phone number are required.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                cur.execute("SELECT COALESCE(MAX(CustomerID), 0) + 1 FROM Customer")
                new_cid = cur.fetchone()[0]
                cur.execute("INSERT INTO Customer (CustomerID, CustomerName, Phone) VALUES (?, ?, ?)", (new_cid, name, phone))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "customerId": new_cid, "message": "Customer registered."})
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        # 7. API: Add New Prescription
        elif path == "/api/prescriptions":
            customer_id = body.get("customerId")
            doctor_name = body.get("doctorName")
            date_str = body.get("prescriptionDate", datetime.now().strftime("%Y-%m-%d"))

            if not customer_id or not doctor_name:
                return self._send_error("Customer and doctor name are required.", 400)

            conn = get_db()
            cur = conn.cursor()
            try:
                cur.execute("SELECT COALESCE(MAX(PrescriptionID), 0) + 1 FROM Prescription")
                new_pid = cur.fetchone()[0]
                cur.execute("""
                    INSERT INTO Prescription (PrescriptionID, CustomerID, DoctorName, PrescriptionDate)
                    VALUES (?, ?, ?, ?)
                """, (new_pid, customer_id, doctor_name, date_str))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "prescriptionId": new_pid, "message": "Prescription recorded."})
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)

        else:
            return self._send_error("Endpoint not found", 404)

    # =========================================================================
    # DELETE Handlers (Tests Referential Integrity ON DELETE RESTRICT)
    # =========================================================================
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/medicines/"):
            med_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            try:
                # Attempt delete - if foreign keys exist in Batch or InvoiceItem, SQLite raises IntegrityError
                cur.execute("DELETE FROM Medicine WHERE MedicineID = ?", (med_id,))
                conn.commit()
                conn.close()
                return self._send_json({"success": True, "message": f"Medicine #{med_id} deleted."})
            except sqlite3.IntegrityError as e:
                conn.rollback()
                conn.close()
                return self._send_error(f"Referential Integrity Enforced: Cannot delete medicine because dependent batches, quotes or invoices exist. (ON DELETE RESTRICT)", 409)
            except Exception as e:
                conn.rollback()
                conn.close()
                return self._send_error(str(e), 400)
        else:
            return self._send_error("Endpoint not found", 404)


def run_server(port=None):
    if port is None:
        port = int(os.environ.get("PORT", "5000"))
        
    # Ensure database exists
    if not os.path.exists(DB_PATH):
        print("[!] Database not found. Running database initializer...")
        import sys
        sys.path.append(os.path.join(PROJECT_DIR, "database"))
        import init_db
        init_db.init_database()

    server_address = ('', port)
    httpd = HTTPServer(server_address, PMSRequestHandler)
    print("=" * 70)
    print("  PHARMACEUTICAL MANAGEMENT SYSTEM (PMS) - BACKEND SERVER")
    print(f"  Server listening on: http://localhost:{port}")
    print(f"  Database connected: {DB_PATH}")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
