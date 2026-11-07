# Chapter 6: Testing, Integrity Verification & Business Intelligence

## 6.1 The Formal DBMS Testing Plan
To guarantee that the relational schema, SQL triggers, check constraints, and ACID transactions uphold domain invariants, seven formal test cases were executed against the database:

| Test ID | Test Scenario | Input / Action | Expected Result | Actual Result | Verification Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Sell more than available stock | Request $Quantity = 600$ when Batch #1001 has $450$ units | Rejected: Check constraint & trigger block sale; non-negative stock enforced. | Transaction rolled back with `[Insufficient Stock]` message. | **PASSED** |
| **TC-02** | Dispense from expired batch | Attempt sale of Batch #3001 (Brufen expired `2026-09-15`) | Rejected: Expiry Guard trigger blocks insertion into `InvoiceItem`. | Aborted with `[Expiry Guard]` exception. | **PASSED** |
| **TC-03** | Sell regulated medicine above DRAP MRP | Attempt sale of Panadol at PKR $4.50$ when DRAP MRP is $3.50$ | Rejected: Price Ceiling Guard trigger rejects insert. | Aborted with `[DRAP Price Ceiling]` violation. | **PASSED** |
| **TC-04** | Dispense controlled drug without prescription | Attempt sale of Xanax 0.5mg without linking a `PrescriptionID` | Rejected: Regulatory logic aborts transaction. | Blocked: `[Prescription Required]` exception raised. | **PASSED** |
| **TC-05** | Temporal price adjustment | Insert new price for Medicine #1 (PKR $3.80$, effective today) | Old PriceHistory record has `EffectiveTo` set to today; new record opened. | Trigger/Transaction auto-closes previous record cleanly. | **PASSED** |
| **TC-06** | Delete medicine with active invoices / batches | Execute `DELETE FROM Medicine WHERE MedicineID = 1;` | Rejected: Blocked by referential integrity (`ON DELETE RESTRICT`). | Database raises `sqlite3.IntegrityError: FOREIGN KEY constraint failed`. | **PASSED** |
| **TC-07** | Lossless reconstruction test | Join `Medicine` $\bowtie$ `Category` $\bowtie$ `Manufacturer` $\bowtie$ `Batch` | Original universal relation reconstructed with zero spurious rows. | Row count and attribute values match original domain instances. | **PASSED** |

---

## 6.2 Security, Data Integrity & Access Control

### 1. Password Security
Staff passwords are never saved in plain text. Passwords pass through cryptographic one-way hashing (`SHA-256` or `bcrypt`) prior to persistence in `Staff.PasswordHash`.

### 2. Role-Based Access Control (RBAC)
The database and API enforce role separation:
- **Admin (`Role = 'Admin'`):** Full read/write access across medicine registration, manufacturer catalog, staff accounts, price adjustments, and financial analytics.
- **Pharmacist (`Role = 'Pharmacist'`):** Authorized to manage batches, record prescriptions, approve supplier purchase orders, and monitor expiry queues.
- **Cashier (`Role = 'Cashier'`):** Restricted strictly to Point-of-Sale (POS) invoice generation and customer record creation.

### 3. ACID Transaction Guarantees
The `SellMedicine` transaction ensures atomicity across multi-item bills:
- **Atomicity:** Either all line items are recorded and stock deducted, or the entire transaction is rolled back if any check fails.
- **Consistency:** All triggers (`trg_block_expired_batch_sale`, `trg_enforce_price_ceiling`, `trg_validate_and_deduct_stock`) ensure no invalid state is reached.
- **Isolation:** Transaction isolation prevents dirty reads or race conditions during simultaneous batch checkouts.
- **Durability:** Committed transactions persist safely in SQLite write-ahead logging (WAL) / PostgreSQL write logs.

---

## 6.3 Business Intelligence (BI) & Analytical Insights

The PMS incorporates an OLAP decision layer powered by SQL views and window functions:

### 1. Window Function Price Trend (LAG)
Tracks price momentum across historical DRAP notifications:
```sql
SELECT 
    m.Name,
    ph.EffectiveFrom,
    ph.SellingPrice,
    LAG(ph.SellingPrice, 1) OVER (PARTITION BY ph.MedicineID ORDER BY ph.EffectiveFrom) AS PrevPrice,
    ROUND(ph.SellingPrice - LAG(ph.SellingPrice, 1) OVER (PARTITION BY ph.MedicineID ORDER BY ph.EffectiveFrom), 2) AS Delta
FROM PriceHistory ph
JOIN Medicine m ON ph.MedicineID = m.MedicineID;
```

### 2. Expiry Risk Valuation
Calculates the exact monetary risk of stock expiring within 30 days:
```sql
SELECT 
    SUM(QuantityInStock * PurchasePrice) AS CapitalAtRiskPKR,
    COUNT(*) AS BatchesExpiringCount
FROM Batch
WHERE QuantityInStock > 0 AND ExpiryDate <= DATE('now', '+30 day');
```

### 3. Automated Generic Drug Substitution
Identifies cheaper alternatives sharing identical salt and strength, empowering pharmacies to offer price relief to consumers while maintaining medical efficacy.
