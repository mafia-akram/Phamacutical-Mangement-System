# Chapter 2: Functional Dependencies & Attribute Closures

## 2.1 Formal Definition of Functional Dependency (FD)
In a relational schema $R$, a functional dependency $X \rightarrow Y$ holds over $R$ if and only if for every legal instance $r(R)$, whenever two tuples $t_1, t_2 \in r$ agree on attribute set $X$, they must also agree on attribute set $Y$:
$$t_1[X] = t_2[X] \implies t_1[Y] = t_2[Y]$$
Here, $X$ is termed the **determinant**, and $Y$ is the **dependent**.

---

## 2.2 Domain Functional Dependencies
From the pharmaceutical business rules and domain entities, we establish the following fundamental FDs:

1. **Medicine Specification:**
   $$\text{MedicineID} \rightarrow \{\text{MedicineName}, \text{CategoryID}, \text{ManufacturerID}, \text{PricingCategory}, \text{RequiresPrescription}, \text{ReorderLevel}\}$$

2. **Category Master:**
   $$\text{CategoryID} \rightarrow \{\text{CategoryName}\}$$

3. **Manufacturer Master:**
   $$\text{ManufacturerID} \rightarrow \{\text{ManufacturerName}, \text{Country}\}$$

4. **Batch Physical Lot:**
   $$\text{BatchID} \rightarrow \{\text{MedicineID}, \text{SupplierID}, \text{ExpiryDate}, \text{QuantityInStock}, \text{PurchasePrice}\}$$

5. **Supplier Master:**
   $$\text{SupplierID} \rightarrow \{\text{SupplierName}, \text{Phone}, \text{Address}\}$$

6. **Customer Master:**
   $$\text{CustomerID} \rightarrow \{\text{CustomerName}, \text{Phone}\}$$

7. **Prescription Master:**
   $$\text{PrescriptionID} \rightarrow \{\text{CustomerID}, \text{DoctorName}, \text{PrescriptionDate}\}$$

8. **Staff Authentication:**
   $$\text{StaffID} \rightarrow \{\text{StaffName}, \text{Role}, \text{Username}, \text{PasswordHash}\}$$
   $$\text{Username} \rightarrow \{\text{StaffID}, \text{StaffName}, \text{Role}, \text{PasswordHash}\} \quad (\text{Alternate Candidate Key})$$

9. **Invoice Header:**
   $$\text{InvoiceID} \rightarrow \{\text{CustomerID}, \text{StaffID}, \text{PrescriptionID}, \text{InvoiceDate}, \text{TotalAmount}\}$$

10. **Invoice Line Item:**
    $$\{\text{InvoiceID}, \text{BatchID}\} \rightarrow \{\text{Quantity}, \text{UnitPriceAtSale}\}$$

11. **Temporal Drug Pricing:**
    $$\{\text{MedicineID}, \text{EffectiveFrom}\} \rightarrow \{\text{MRP}, \text{SellingPrice}, \text{EffectiveTo}, \text{ChangedBy}, \text{Source}\}$$

12. **Supplier B2B Quotation:**
    $$\{\text{SupplierID}, \text{MedicineID}, \text{QuoteDate}\} \rightarrow \{\text{QuotedPrice}\}$$

13. **Chemical Salt Definition:**
    $$\text{SaltID} \rightarrow \{\text{SaltName}\}$$

14. **Medicine Salt Composition:**
    $$\{\text{MedicineID}, \text{SaltID}\} \rightarrow \{\text{Strength}\}$$

15. **Market Reference Benchmark:**
    $$\{\text{MedicineID}, \text{RecordedDate}, \text{Source}\} \rightarrow \{\text{AvgMarketPrice}\}$$

---

## 2.3 Armstrong's Axioms and Inference Rules

Given a set of functional dependencies $F$, the closure $F^+$ is the set of all dependencies logically implied by $F$. This is derived using Armstrong's sound and complete inference axioms:

1. **Axiom of Reflexivity:**
   If $Y \subseteq X$, then $X \rightarrow Y$.
2. **Axiom of Augmentation:**
   If $X \rightarrow Y$, then $XZ \rightarrow YZ$ for any attribute set $Z$.
3. **Axiom of Transitivity:**
   If $X \rightarrow Y$ and $Y \rightarrow Z$, then $X \rightarrow Z$.

### Derived Rules:
- **Union:** If $X \rightarrow Y$ and $X \rightarrow Z$, then $X \rightarrow YZ$.
- **Decomposition:** If $X \rightarrow YZ$, then $X \rightarrow Y$ and $X \rightarrow Z$.
- **Pseudotransitivity:** If $X \rightarrow Y$ and $WY \rightarrow Z$, then $WX \rightarrow Z$.

### Transitivity Example:
From Rule 1: $\text{MedicineID} \rightarrow \text{CategoryID}$  
From Rule 2: $\text{CategoryID} \rightarrow \text{CategoryName}$  
By **Transitivity**:
$$\text{MedicineID} \rightarrow \text{CategoryName}$$
In an unnormalized single-table design, this transitive dependency causes severe update and deletion anomalies, proving the mathematical necessity of decomposition.

---

## 2.4 Attribute Closure Computation and Candidate Keys

### Definitions
- **Superkey:** An attribute set $K$ such that $K^+ = R$ (the closure contains all attributes of relation $R$).
- **Candidate Key:** A minimal superkey (no proper subset $K' \subset K$ satisfies $(K')^+ = R$).
- **Primary Key:** The candidate key designated by the database designer for physical table indexing.
- **Alternate Key:** A candidate key not chosen as the primary key (e.g., `Username` in `Staff`).

### Worked Example: `InvoiceLine` Relation
Consider the unnormalized relation:
$$\text{InvoiceLine}(\text{InvoiceID}, \text{MedicineID}, \text{InvoiceDate}, \text{CustomerID}, \text{MedicineName}, \text{Quantity}, \text{UnitPriceAtSale})$$

With the given dependencies:
- $f_1: \text{InvoiceID} \rightarrow \{\text{InvoiceDate}, \text{CustomerID}\}$
- $f_2: \text{MedicineID} \rightarrow \{\text{MedicineName}\}$
- $f_3: \{\text{InvoiceID}, \text{MedicineID}\} \rightarrow \{\text{Quantity}, \text{UnitPriceAtSale}\}$

#### Step-by-Step Closure Computation of $\{\text{InvoiceID}, \text{MedicineID}\}$:
1. **Initialize:**
   $$X^{(0)} = \{\text{InvoiceID}, \text{MedicineID}\}$$
2. **Apply $f_1$:**
   Since $\text{InvoiceID} \in X^{(0)}$, add $\{\text{InvoiceDate}, \text{CustomerID}\}$:
   $$X^{(1)} = \{\text{InvoiceID}, \text{MedicineID}, \text{InvoiceDate}, \text{CustomerID}\}$$
3. **Apply $f_2$:**
   Since $\text{MedicineID} \in X^{(1)}$, add $\{\text{MedicineName}\}$:
   $$X^{(2)} = \{\text{InvoiceID}, \text{MedicineID}, \text{InvoiceDate}, \text{CustomerID}, \text{MedicineName}\}$$
4. **Apply $f_3$:**
   Since $\{\text{InvoiceID}, \text{MedicineID}\} \subseteq X^{(2)}$, add $\{\text{Quantity}, \text{UnitPriceAtSale}\}$:
   $$X^{(3)} = \{\text{InvoiceID}, \text{MedicineID}, \text{InvoiceDate}, \text{CustomerID}, \text{MedicineName}, \text{Quantity}, \text{UnitPriceAtSale}\} = R$$

#### Minimality Check:
- Closure of $\{\text{InvoiceID}\}^+ = \{\text{InvoiceID}, \text{InvoiceDate}, \text{CustomerID}\} \neq R$
- Closure of $\{\text{MedicineID}\}^+ = \{\text{MedicineID}, \text{MedicineName}\} \neq R$

Since no proper subset determines $R$, $\{\text{InvoiceID}, \text{MedicineID}\}$ is a **minimal superkey**, therefore it is the unique **Candidate Key**.
Because $f_1$ and $f_2$ exhibit determinants that are proper subsets of the candidate key, the relation violates **Second Normal Form (2NF)** and must be decomposed.
