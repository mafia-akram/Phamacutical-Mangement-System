# Chapter 5: Anomalies & Decomposition Criteria

## 5.1 The Danger of Denormalization: The Universal `Sales` Table
Consider an amateur design where all facts are clumped into a single mega-table:

$$\text{UniversalSales}(\text{InvoiceID}, \text{Date}, \text{CustomerName}, \text{CustomerPhone}, \text{MedicineName}, \text{Category}, \text{Manufacturer}, \text{SupplierName}, \text{Quantity}, \text{Price})$$

### The Three Classic Relational Anomalies:

#### 1. Update Anomaly
- **Phenomenon:** If customer "Ali Raza" updates his mobile phone number, and has visited the pharmacy 50 times, his phone number is redundantly duplicated across 50 independent rows.
- **Consequence:** If an application updates only 49 rows due to a system crash or query omission, the database enters an inconsistent state where the system cannot determine Ali Raza's true phone number.

#### 2. Insertion Anomaly
- **Phenomenon:** The pharmacy acquires a brand-new antibiotic, "Cefspan 400mg", from manufacturer "Searle".
- **Consequence:** In the universal table, the primary key includes $\text{InvoiceID}$. Because no patient has purchased Cefspan yet, we cannot insert the medicine into the database without inserting a dummy/null $\text{InvoiceID}$, violating Entity Integrity. The pharmacy cannot catalogue its stock!

#### 3. Deletion Anomaly
- **Phenomenon:** Customer "Zubair Shah" returns an item and his only invoice is cancelled and deleted from the database.
- **Consequence:** Deleting that single invoice row also purges the existence of the rare medicine he bought, its manufacturer details, and the supplier's contact information from the database, because they were stored solely within that invoice tuple.

---

## 5.2 Formal Decomposition Criteria

Decomposition is guided strictly by functional dependencies rather than arbitrary column splitting. A valid decomposition must satisfy two fundamental theorems:

### 1. Lossless Join Property (Guaranteed Data Reconstruction)
A decomposition of relation $R$ into $\{R_1, R_2\}$ is a **lossless-join decomposition** with respect to functional dependency set $F$ if and only if:
$$(R_1 \cap R_2) \rightarrow R_1 \quad \text{or} \quad (R_1 \cap R_2) \rightarrow R_2$$
That is, the intersection of the two relations must form a **superkey** of at least one of the decomposed relations.

#### Mathematical Verification:
Consider decomposing:
$$\text{MedicineMaster}(\text{MedicineID}, \text{Name}, \text{CategoryID}, \text{CategoryName})$$
into:
- $R_1 = \text{Medicine}(\text{MedicineID}, \text{Name}, \text{CategoryID})$
- $R_2 = \text{Category}(\text{CategoryID}, \text{CategoryName})$

1. Intersection:
   $$R_1 \cap R_2 = \{\text{CategoryID}\}$$
2. Functional Dependency in $R_2$:
   $$\text{CategoryID} \rightarrow \text{CategoryName}$$
3. Closure:
   $$\{\text{CategoryID}\}^+ \text{ in } R_2 = \{\text{CategoryID}, \text{CategoryName}\} = R_2$$

Because $R_1 \cap R_2$ is a candidate key (superkey) of $R_2$, the decomposition is **guaranteed to be lossless**. Joining $R_1$ and $R_2$ on $\text{CategoryID}$ will yield the exact original relation without producing spurious tuples.

---

### 2. Dependency Preservation Property
A decomposition $D = \{R_1, R_2, \dots, R_k\}$ is **dependency preserving** if:
$$(F_1 \cup F_2 \cup \dots \cup F_k)^+ = F^+$$
Where $F_i$ represents the projection of functional dependencies onto relation $R_i$.

#### Practical Importance:
When a transaction executes an `INSERT` or `UPDATE`, the DBMS can verify that no functional dependency is violated simply by enforcing keys and unique constraints inside the single targeted table, without having to perform expensive joins across multiple disk pages.

#### Verification in PMS:
- $\text{MedicineID} \rightarrow \text{CategoryID}$ is enforced via the primary key of `Medicine`.
- $\text{CategoryID} \rightarrow \text{CategoryName}$ is enforced via the primary key of `Category`.
- $\{\text{InvoiceID}, \text{BatchID}\} \rightarrow \{\text{Quantity}, \text{UnitPrice}\}$ is enforced via the composite primary key of `InvoiceItem`.

Because every original functional dependency in $F$ is directly mapped to a primary key constraint of an individual relation in our final BCNF schema, **dependency preservation is 100% satisfied**.
