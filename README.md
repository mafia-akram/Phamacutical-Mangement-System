# Pharmaceutical Management System (PMS)
## Database Management Systems (DBMS) Term Project

A complete, production-grade **Pharmaceutical Management System** engineered on formal relational database design theory (1NF $\to$ 2NF $\to$ 3NF $\to$ BCNF $\to$ 4NF) with ACID transactional integrity, DRAP (Drug Regulatory Authority of Pakistan) two-tier pricing enforcement, temporal audit versioning, and real-time business intelligence.

---

## 📁 Project Architecture & Directory Structure

```
pharmacy-system/
├── database/
│   ├── 01_schema.sql               # 17 normalized relations with PK/FK/CHECK constraints
│   ├── 02_constraints_indexes.sql   # Performance indexes & integrity rules
│   ├── 03_sample_data.sql           # 35+ realistic medicines, batches, quotes, DRAP prices
│   ├── 04_views_queries.sql         # 7 analytical views & window function queries (LAG)
│   ├── 05_triggers_procedures.sql   # Expiry guard, price ceiling, stock triggers & transactions
│   └── init_db.py                  # Automated Python database builder
├── backend/
│   └── server.py                   # REST API server (Standard Library, zero npm/pip dependencies)
├── frontend/
│   ├── index.html                  # Interactive Single Page Web Interface
│   ├── app.js                      # Application logic, POS cart, substitute discovery
│   └── styles.css                  # Modern pharmaceutical dashboard theme + Print styles
├── docs/
│   ├── 01_business_rules.md        # Chapter 1: Real-world domain rules & policies
│   ├── 02_functional_dependencies_and_keys.md  # Chapter 2: FDs, Armstrong's axioms, closures
│   ├── 03_normalization_proof_1nf_to_bcnf.md   # Chapter 3: 1NF to BCNF proofs & 4NF note
│   ├── 04_relational_schema_and_erd.md         # Chapter 4: Relational DDL & Mermaid ERD
│   ├── 05_anomalies_and_decomposition.md       # Chapter 5: Anomalies & Lossless join proof
│   └── 06_testing_verification_and_bi.md       # Chapter 6: Testing plan & BI queries
├── tests/
│   └── run_tests.py                # Automated test runner for all 7 DBMS test cases
└── README.md                       # Master project guide
```

---

## 🚀 How to Run the Project

### 1. Initialize the Database
The project includes an automated database builder that creates `pharmacy.db` and loads all schemas, constraints, sample data, views, and triggers:
```bash
python database/init_db.py
```

### 2. Start the Backend & Web Application
Run the zero-dependency REST API server:
```bash
python backend/server.py
```
Open your web browser and navigate to:
```
http://localhost:5000
```
*(The server automatically hosts the complete frontend and REST API on port 5000).*

### 3. Run the DBMS Verification Test Suite
To automatically execute and verify all 7 formal test cases specified in the Master Design Document:
```bash
python tests/run_tests.py
```

---

## 💊 Key Features & DBMS Highlights

1. **Strict Boyce-Codd Normal Form (BCNF):**
   Every non-trivial functional dependency $X \rightarrow Y$ has a superkey as its determinant $X$. Zero redundancy, zero update/insertion/deletion anomalies.
2. **DRAP Statutory Price Ceiling:**
   Triggers intercept any Point-of-Sale invoice item attempting to sell a regulated drug above its Maximum Retail Price (MRP).
3. **Expiry Guard Trigger:**
   Transactions attempting to dispense from a batch whose `ExpiryDate < CURRENT_DATE` are immediately aborted.
4. **Temporal Price Versioning:**
   Automatic timestamping (`EffectiveFrom`, `EffectiveTo`) preserves historical pricing so prior audits and profit margins remain accurate.
5. **Generic Salt Substitution:**
   Junction table `MedicineSalt` allows instant discovery of cheaper brand alternatives sharing the exact same active formula and strength.
6. **Executive Business Intelligence (BI):**
   Dedicated SQL views calculate daily revenues, profit margin health, stock value at risk, and smart reorder quantities.
