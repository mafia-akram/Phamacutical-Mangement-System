# Chapter 1: Business Rules & Domain Architecture

## 1.1 Introduction to the Problem Domain
A modern commercial pharmacy handles thousands of micro-transactions, inventory shifts, and regulatory compliance checks daily. Improperly modeled databases in healthcare cause devastating operational failures:
- Dispensing expired medication to patients.
- Selling controlled or narcotic drugs without verified doctor prescriptions.
- Violating statutory Maximum Retail Price (MRP) ceilings established by government bodies such as the **Drug Regulatory Authority of Pakistan (DRAP)**.
- Inaccurate physical stock counts caused by partial updates and anomalous records.
- Inability to trace batch origins during manufacturer recalls.

The **Pharmaceutical Management System (PMS)** bridges real-world pharmaceutical logistics and pure relational database theory using the formal relational design pipeline:
$$\text{Real-World Domain} \longrightarrow \text{Business Rules} \longrightarrow \text{Functional Dependencies} \longrightarrow \text{Attribute Closure \& Keys} \longrightarrow \text{Anomaly Elimination} \longrightarrow \text{BCNF Relations}$$

---

## 1.2 Comprehensive Business Rules

### Rule 1: Unique Medicine Identity
Every medicine possesses a unique surrogate identifier `MedicineID`. Trade names, packaging types, and strengths are distinct catalog entities.

### Rule 2: Strict Categorization and Sourcing
Each medicine belongs to exactly one therapeutic category (e.g., *Analgesics*, *Antibiotics*, *Antihypertensives*) and is manufactured by exactly one pharmaceutical manufacturer. A category or manufacturer can produce many medicines ($1 : M$).

### Rule 3: Batch-Wise Inventory Tracking
Medicines are never tracked as an undifferentiated aggregate count. Stock is strictly maintained by **Batch**:
- Each batch has a distinct manufacturing lot, an immutable expiry date, a supplier acquisition cost, and a remaining physical quantity.
- A single medicine can have multiple active batches in stock with varying expiry dates.

### Rule 4: Multi-Vendor Sourcing & Quotations
A supplier can supply many medicines, and a medicine can be procured from multiple approved wholesale distributors ($M : N$). Each vendor submits dated price quotes, allowing real-time discovery of the cheapest supplier.

### Rule 5: Multi-Item Invoicing
An invoice records a sale to a customer. An invoice can contain many medicine batches, and any batch can appear across many customer invoices ($M : N$ resolved through `InvoiceItem`).

### Rule 6: Expiry Guard Constraint
**An expired batch cannot be sold under any circumstances.** Database triggers must immediately abort any transaction attempting to sell units from a batch whose `ExpiryDate < CURRENT_DATE`.

### Rule 7: Controlled Drug Prescription Enforcement
A prescription-only (Schedule G / Narcotic / Controlled) medicine cannot be dispensed without a valid prescription record authored by a licensed doctor. OTC (Over-The-Counter) medicines may be dispensed without a prescription.

### Rule 8: Non-Negative Stock Invariant
Physical stock cannot become negative ($QuantityInStock \ge 0$). Any sale exceeding available batch stock is aborted atomically.

### Rule 9: DRAP Price Ceiling Compliance
For all medicines classified as `Regulated`, the selling price charged to a consumer can **never exceed the Maximum Retail Price (MRP)** notified in the official government Gazette / SRO.

### Rule 10: Temporal Price History & Audit Trail
Prices of medicines change due to raw material inflation, exchange rates, and statutory revisions. Price changes must not overwrite historical data. Every price adjustment must be recorded with its `EffectiveFrom` and `EffectiveTo` timestamps to ensure historical financial audits and margin calculations remain historically accurate.

### Rule 11: Negative Margin & Profit Floor Alert
Selling prices set below wholesale acquisition costs must immediately trigger an executive loss alert.

### Rule 12: Generic Formula (Salt) Substitution
Multiple commercial brand names share identical Active Pharmaceutical Ingredients (APIs or chemical salts) and dosages. The system must provide instant substitute discovery, guiding cashiers and patients toward cheaper, therapeutically equivalent generic alternatives.
