-- ============================================================================
-- Pharmaceutical Management System (PMS)
-- Script 01: Relational Schema DDL
-- Standard SQL-92 / ANSI SQL (Compatible with PostgreSQL, MySQL, SQLite)
-- ============================================================================

-- Drop tables in reverse topological order if rebuilding
DROP TABLE IF EXISTS MarketReference;
DROP TABLE IF EXISTS SupplierQuote;
DROP TABLE IF EXISTS PriceHistory;
DROP TABLE IF EXISTS InvoiceItem;
DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Prescription;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS PurchaseOrderItem;
DROP TABLE IF EXISTS PurchaseOrder;
DROP TABLE IF EXISTS Batch;
DROP TABLE IF EXISTS Supplier;
DROP TABLE IF EXISTS MedicineSalt;
DROP TABLE IF EXISTS Salt;
DROP TABLE IF EXISTS Medicine;
DROP TABLE IF EXISTS Manufacturer;
DROP TABLE IF EXISTS Category;

-- 1. Category Table
CREATE TABLE Category (
    CategoryID INT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Manufacturer Table
CREATE TABLE Manufacturer (
    ManufacturerID INT PRIMARY KEY,
    ManufacturerName VARCHAR(150) NOT NULL,
    Country VARCHAR(100) NOT NULL DEFAULT 'Pakistan'
);

-- 3. Medicine Table
-- PricingCategory: 'Regulated' (DRAP maximum retail price ceiling enforced) or 'Deregulated'
-- RequiresPrescription: 1 (True) or 0 (False)
CREATE TABLE Medicine (
    MedicineID INT PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    CategoryID INT NOT NULL,
    ManufacturerID INT NOT NULL,
    PricingCategory VARCHAR(20) NOT NULL CHECK (PricingCategory IN ('Regulated', 'Deregulated')),
    RequiresPrescription SMALLINT NOT NULL DEFAULT 0 CHECK (RequiresPrescription IN (0, 1)),
    ReorderLevel INT NOT NULL DEFAULT 50 CHECK (ReorderLevel >= 0),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) ON DELETE RESTRICT,
    FOREIGN KEY (ManufacturerID) REFERENCES Manufacturer(ManufacturerID) ON DELETE RESTRICT
);

-- 4. Salt (Formula) Table
CREATE TABLE Salt (
    SaltID INT PRIMARY KEY,
    SaltName VARCHAR(150) NOT NULL UNIQUE
);

-- 5. MedicineSalt (Junction Table: M:N relationship between Medicine and Salt)
CREATE TABLE MedicineSalt (
    MedicineID INT NOT NULL,
    SaltID INT NOT NULL,
    Strength VARCHAR(50) NOT NULL, -- e.g. '500mg', '10mg/5ml'
    PRIMARY KEY (MedicineID, SaltID),
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE CASCADE,
    FOREIGN KEY (SaltID) REFERENCES Salt(SaltID) ON DELETE RESTRICT
);

-- 6. Supplier Table
CREATE TABLE Supplier (
    SupplierID INT PRIMARY KEY,
    SupplierName VARCHAR(150) NOT NULL,
    Phone VARCHAR(30) NOT NULL,
    Address VARCHAR(255) NOT NULL
);

-- 7. Batch Table (Inventory tracked strictly batch-wise with expiry)
CREATE TABLE Batch (
    BatchID INT PRIMARY KEY,
    MedicineID INT NOT NULL,
    SupplierID INT NOT NULL,
    ExpiryDate DATE NOT NULL,
    QuantityInStock INT NOT NULL CHECK (QuantityInStock >= 0),
    PurchasePrice DECIMAL(10, 2) NOT NULL CHECK (PurchasePrice >= 0),
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE RESTRICT,
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID) ON DELETE RESTRICT
);

-- 8. PurchaseOrder Table
CREATE TABLE PurchaseOrder (
    POID INT PRIMARY KEY,
    SupplierID INT NOT NULL,
    OrderDate DATE NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Received', 'Cancelled')),
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID) ON DELETE RESTRICT
);

-- 9. PurchaseOrderItem Table (Junction Table: M:N Purchase Order to Medicine)
CREATE TABLE PurchaseOrderItem (
    POID INT NOT NULL,
    MedicineID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    Cost DECIMAL(10, 2) NOT NULL CHECK (Cost >= 0),
    PRIMARY KEY (POID, MedicineID),
    FOREIGN KEY (POID) REFERENCES PurchaseOrder(POID) ON DELETE CASCADE,
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE RESTRICT
);

-- 10. Customer Table
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    CustomerName VARCHAR(150) NOT NULL,
    Phone VARCHAR(30) NOT NULL
);

-- 11. Prescription Table
CREATE TABLE Prescription (
    PrescriptionID INT PRIMARY KEY,
    CustomerID INT NOT NULL,
    DoctorName VARCHAR(150) NOT NULL,
    PrescriptionDate DATE NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE RESTRICT
);

-- 12. Staff Table (Roles: 'Admin', 'Pharmacist', 'Cashier')
CREATE TABLE Staff (
    StaffID INT PRIMARY KEY,
    StaffName VARCHAR(150) NOT NULL,
    Role VARCHAR(30) NOT NULL CHECK (Role IN ('Admin', 'Pharmacist', 'Cashier')),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL
);

-- 13. Invoice Table (Point-of-Sale Master)
CREATE TABLE Invoice (
    InvoiceID INT PRIMARY KEY,
    CustomerID INT NOT NULL,
    StaffID INT NOT NULL,
    PrescriptionID INT NULL,
    InvoiceDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (TotalAmount >= 0),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE RESTRICT,
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID) ON DELETE RESTRICT,
    FOREIGN KEY (PrescriptionID) REFERENCES Prescription(PrescriptionID) ON DELETE RESTRICT
);

-- 14. InvoiceItem Table (Point-of-Sale Line Details, batch-specific)
CREATE TABLE InvoiceItem (
    InvoiceID INT NOT NULL,
    BatchID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPriceAtSale DECIMAL(10, 2) NOT NULL CHECK (UnitPriceAtSale >= 0),
    PRIMARY KEY (InvoiceID, BatchID),
    FOREIGN KEY (InvoiceID) REFERENCES Invoice(InvoiceID) ON DELETE CASCADE,
    FOREIGN KEY (BatchID) REFERENCES Batch(BatchID) ON DELETE RESTRICT
);

-- 15. PriceHistory Table (Temporal table for regulatory audit and price trends)
CREATE TABLE PriceHistory (
    PriceID INT PRIMARY KEY,
    MedicineID INT NOT NULL,
    MRP DECIMAL(10, 2) NULL CHECK (MRP IS NULL OR MRP >= 0), -- DRAP regulated ceiling
    SellingPrice DECIMAL(10, 2) NOT NULL CHECK (SellingPrice >= 0),
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    ChangedBy INT NOT NULL,
    Source VARCHAR(100) NOT NULL DEFAULT 'DRAP Notification',
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE RESTRICT,
    FOREIGN KEY (ChangedBy) REFERENCES Staff(StaffID) ON DELETE RESTRICT
);

-- 16. SupplierQuote Table (B2B Price comparison)
CREATE TABLE SupplierQuote (
    QuoteID INT PRIMARY KEY,
    SupplierID INT NOT NULL,
    MedicineID INT NOT NULL,
    QuotedPrice DECIMAL(10, 2) NOT NULL CHECK (QuotedPrice > 0),
    QuoteDate DATE NOT NULL,
    FOREIGN KEY (SupplierID) REFERENCES Supplier(SupplierID) ON DELETE RESTRICT,
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE RESTRICT
);

-- 17. MarketReference Table (Competitive intelligence & market benchmarking)
CREATE TABLE MarketReference (
    RefID INT PRIMARY KEY,
    MedicineID INT NOT NULL,
    AvgMarketPrice DECIMAL(10, 2) NOT NULL CHECK (AvgMarketPrice >= 0),
    Source VARCHAR(100) NOT NULL, -- e.g. 'National Pharma Index', 'DRAP Survey'
    RecordedDate DATE NOT NULL,
    FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID) ON DELETE RESTRICT
);
