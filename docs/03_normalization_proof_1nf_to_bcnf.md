# Chapter 3: Normalization Proof (1NF to BCNF & 4NF)

## 3.1 Normal Forms Hierarchy & Theoretical Conditions

| Normal Form | Formal Condition | Anomaly / Structural Flaw Eliminated |
| :--- | :--- | :--- |
| **1NF** | All attribute domains contain only **atomic (indivisible)** values; no repeating groups or nested arrays. | Non-atomic structures, array fields, variable-length records. |
| **2NF** | In 1NF and **no non-prime attribute is partially dependent** on any candidate key (all non-prime attributes depend on the whole candidate key). | Partial functional dependencies on composite candidate keys. |
| **3NF** | In 2NF and for every non-trivial FD $X \rightarrow A$, either $X$ is a **superkey** or $A$ is a **prime attribute** (part of a candidate key). | Transitive dependencies ($X \rightarrow Y \rightarrow Z$). |
| **BCNF** | For every non-trivial FD $X \rightarrow Y$, the determinant $X$ must be a **superkey**. | Non-superkey determinants, overlapping candidate key anomalies. |
| **4NF** | For every non-trivial Multivalued Dependency (MVD) $X \twoheadrightarrow Y$, $X$ must be a **superkey**. | Independent multi-valued redundancy in a single relation. |

---

## 3.2 Step-by-Step Normalization Journey

### Step 1: First Normal Form (1NF) Resolution
In poorly designed systems, an invoice table often stores an array or comma-separated string of medicines purchased:
$$\text{FlawedInvoice}(\text{InvoiceID}, \text{InvoiceDate}, \text{CustomerName}, \text{MedicinesPurchased})$$
Where `MedicinesPurchased` contains `"Panadol (2), Augmentin (1), Brufen (3)"`.
- **Violation:** Violates atomicity of the relational model. Searching for sales of "Augmentin" requires error-prone string parsing (`LIKE '%Augmentin%'`), preventing index optimization.
- **1NF Decomposition:** Unfold repeating groups into discrete tuples:
  $$\text{InvoiceLine}(\text{InvoiceID}, \text{MedicineID}, \text{InvoiceDate}, \text{CustomerName}, \text{Quantity}, \text{UnitPrice})$$
  Candidate Key: $\{\text{InvoiceID}, \text{MedicineID}\}$.

---

### Step 2: Second Normal Form (2NF) Resolution
In $\text{InvoiceLine}$, the candidate key is composite: $\{\text{InvoiceID}, \text{MedicineID}\}$.
Examine the functional dependencies:
- $f_1: \text{InvoiceID} \rightarrow \{\text{InvoiceDate}, \text{CustomerID}\}$
- $f_2: \text{MedicineID} \rightarrow \{\text{MedicineName}\}$
- $f_3: \{\text{InvoiceID}, \text{MedicineID}\} \rightarrow \{\text{Quantity}, \text{UnitPriceAtSale}\}$

#### Flaw:
- `InvoiceDate` and `CustomerID` depend only on $\text{InvoiceID}$, which is a strict subset of the candidate key (a **partial dependency**).
- `MedicineName` depends only on $\text{MedicineID}$ (a **partial dependency**).

#### 2NF Decomposition:
To achieve 2NF, each partial dependency is isolated into its own relation whose primary key is the partial determinant:
1. $\text{Invoice}(\underline{\text{InvoiceID}}, \text{InvoiceDate}, \text{CustomerID})$
2. $\text{Medicine}(\underline{\text{MedicineID}}, \text{MedicineName})$
3. $\text{InvoiceItem}(\underline{\text{InvoiceID}, \text{MedicineID}}, \text{Quantity}, \text{UnitPriceAtSale})$

---

### Step 3: Third Normal Form (3NF) Resolution
Consider the relation:
$$\text{Medicine}(\underline{\text{MedicineID}}, \text{Name}, \text{CategoryID}, \text{CategoryName}, \text{ManufacturerID}, \text{ManufacturerName}, \text{Country})$$

Candidate Key: $\{\text{MedicineID}\}$.
Examine dependencies:
- $\text{MedicineID} \rightarrow \text{CategoryID}$
- $\text{CategoryID} \rightarrow \text{CategoryName}$
- $\text{MedicineID} \rightarrow \text{ManufacturerID}$
- $\text{ManufacturerID} \rightarrow \{\text{ManufacturerName}, \text{Country}\}$

#### Flaw:
Although $\text{MedicineID}$ determines all attributes, `CategoryName` depends on `MedicineID` **transitively** through `CategoryID`.
Similarly, `ManufacturerName` and `Country` depend transitively through `ManufacturerID`.
Neither $\text{CategoryID}$ nor $\text{ManufacturerID}$ is a superkey of relation $\text{Medicine}$, and $\text{CategoryName}$ is not prime. This violates 3NF!

#### 3NF Decomposition:
Separate the transitive chains into independent relations:
1. $\text{Category}(\underline{\text{CategoryID}}, \text{CategoryName})$
2. $\text{Manufacturer}(\underline{\text{ManufacturerID}}, \text{ManufacturerName}, \text{Country})$
3. $\text{Medicine}(\underline{\text{MedicineID}}, \text{Name}, \text{CategoryID}^*, \text{ManufacturerID}^*)$

Now, in each decomposed relation, every non-key attribute depends directly on the primary key, satisfying 3NF.

---

### Step 4: Boyce-Codd Normal Form (BCNF) Verification
A relation is in BCNF if for every non-trivial functional dependency $X \rightarrow Y$, $X$ is a **superkey**.

Let us audit every relation in the final PMS database schema:

1. **Category**:
   - Dependency: $\text{CategoryID} \rightarrow \text{CategoryName}$.
   - Determinant $\text{CategoryID}$ is the Primary Key (Superkey). **$\implies$ BCNF satisfied.**
2. **Manufacturer**:
   - Dependency: $\text{ManufacturerID} \rightarrow \{\text{ManufacturerName}, \text{Country}\}$.
   - Determinant is Primary Key. **$\implies$ BCNF satisfied.**
3. **Medicine**:
   - Dependency: $\text{MedicineID} \rightarrow \{\text{Name}, \text{CategoryID}, \text{ManufacturerID}, \text{PricingCategory}, \text{RequiresPrescription}, \text{ReorderLevel}\}$.
   - Determinant $\text{MedicineID}$ is Primary Key. **$\implies$ BCNF satisfied.**
4. **Batch**:
   - Dependency: $\text{BatchID} \rightarrow \{\text{MedicineID}, \text{SupplierID}, \text{ExpiryDate}, \text{QuantityInStock}, \text{PurchasePrice}\}$.
   - Determinant $\text{BatchID}$ is Primary Key. **$\implies$ BCNF satisfied.**
5. **InvoiceItem**:
   - Dependency: $\{\text{InvoiceID}, \text{BatchID}\} \rightarrow \{\text{Quantity}, \text{UnitPriceAtSale}\}$.
   - Determinant $\{\text{InvoiceID}, \text{BatchID}\}$ is Primary Key. **$\implies$ BCNF satisfied.**
6. **PriceHistory**:
   - Dependency: $\text{PriceID} \rightarrow \{\text{MedicineID}, \text{MRP}, \text{SellingPrice}, \text{EffectiveFrom}, \text{EffectiveTo}, \text{ChangedBy}, \text{Source}\}$.
   - Determinant $\text{PriceID}$ is Primary Key. **$\implies$ BCNF satisfied.**
7. **Staff**:
   - Dependency 1: $\text{StaffID} \rightarrow \{\text{StaffName}, \text{Role}, \text{Username}, \text{PasswordHash}\}$.
   - Dependency 2: $\text{Username} \rightarrow \{\text{StaffID}, \text{StaffName}, \text{Role}, \text{PasswordHash}\}$.
   - Both determinants ($\text{StaffID}$ and $\text{Username}$) are candidate keys (superkeys). **$\implies$ BCNF satisfied.**

Since every determinant across all relations is a superkey, the schema is strictly in **Boyce-Codd Normal Form (BCNF)**.

---

## 3.3 Fourth Normal Form (4NF) & Multivalued Dependencies
Consider what would happen if a single medicine can have multiple Active Pharmaceutical Ingredients (Salts) AND multiple dosage indications (Indications), modeled as:
$$\text{MedFormula}(\text{MedicineID}, \text{SaltID}, \text{Indication})$$

If a medicine has 2 salts and 3 therapeutic indications, and these two sets of facts are mutually independent:
$$\text{MedicineID} \twoheadrightarrow \text{SaltID} \quad \text{and} \quad \text{MedicineID} \twoheadrightarrow \text{Indication}$$
Storing them in a single relation requires $2 \times 3 = 6$ tuples, introducing massive Cartesian join redundancy.
- **4NF Resolution:** We isolate the multivalued facts into dedicated binary junction tables:
  $$\text{MedicineSalt}(\underline{\text{MedicineID}, \text{SaltID}}, \text{Strength})$$
This guarantees the design is entirely free from multivalued dependency anomalies.
