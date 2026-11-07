-- ============================================================================
-- Pharmaceutical Management System (PMS)
-- Script 03: Comprehensive Sample Dataset (35+ Realistic Medicines & Relations)
-- Context: DRAP (Drug Regulatory Authority of Pakistan) Two-Tier Pricing Schema
-- ============================================================================

-- Clean out existing data in reverse order
DELETE FROM MarketReference;
DELETE FROM SupplierQuote;
DELETE FROM PriceHistory;
DELETE FROM InvoiceItem;
DELETE FROM Invoice;
DELETE FROM Staff;
DELETE FROM Prescription;
DELETE FROM Customer;
DELETE FROM PurchaseOrderItem;
DELETE FROM PurchaseOrder;
DELETE FROM Batch;
DELETE FROM Supplier;
DELETE FROM MedicineSalt;
DELETE FROM Salt;
DELETE FROM Medicine;
DELETE FROM Manufacturer;
DELETE FROM Category;

-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
INSERT INTO Category (CategoryID, CategoryName) VALUES
(1, 'Analgesics & Antipyretics'),
(2, 'Antibiotics & Antimicrobials'),
(3, 'Cardiovascular & Antihypertensives'),
(4, 'Gastrointestinal & Antacids'),
(5, 'Antidiabetics'),
(6, 'Respiratory & Antiallergic'),
(7, 'Central Nervous System (CNS) & Sedatives'),
(8, 'Lipid Lowering / Statins'),
(9, 'Vitamins & Supplements'),
(10, 'Dermatologicals');

-- ----------------------------------------------------------------------------
-- 2. Manufacturers
-- ----------------------------------------------------------------------------
INSERT INTO Manufacturer (ManufacturerID, ManufacturerName, Country) VALUES
(1, 'GlaxoSmithKline (GSK) Pakistan', 'Pakistan'),
(2, 'Abbott Laboratories Pakistan', 'Pakistan'),
(3, 'Getz Pharma (Pvt) Ltd', 'Pakistan'),
(4, 'The Searle Company Limited', 'Pakistan'),
(5, 'Sami Pharmaceuticals', 'Pakistan'),
(6, 'Hilton Pharma Limited', 'Pakistan'),
(7, 'Ferozsons Laboratories', 'Pakistan'),
(8, 'Martin Dow Marker', 'Pakistan'),
(9, 'Sanofi-Aventis Pakistan', 'Pakistan'),
(10, 'Pfizer Pakistan Limited', 'Pakistan');

-- ----------------------------------------------------------------------------
-- 3. Chemical Salts (Active Pharmaceutical Ingredients / Formulas)
-- ----------------------------------------------------------------------------
INSERT INTO Salt (SaltID, SaltName) VALUES
(101, 'Paracetamol'),
(102, 'Ibuprofen'),
(103, 'Amoxicillin + Clavulanic Acid'),
(104, 'Amoxicillin'),
(105, 'Omeprazole'),
(106, 'Esomeprazole'),
(107, 'Amlodipine Besylate'),
(108, 'Losartan Potassium'),
(109, 'Metformin Hydrochloride'),
(110, 'Ciprofloxacin'),
(111, 'Levofloxacin'),
(112, 'Cefixime'),
(113, 'Cetirizine Dihydrochloride'),
(114, 'Montelukast Sodium'),
(115, 'Atorvastatin Calcium'),
(116, 'Rosuvastatin Calcium'),
(117, 'Aspirin (Acetylsalicylic Acid)'),
(118, 'Clopidogrel Bisulfate'),
(119, 'Alprazolam'),
(120, 'Tramadol Hydrochloride'),
(121, 'Azithromycin'),
(122, 'Sitagliptin Phosphate'),
(123, 'Fexofenadine'),
(124, 'Domperidone'),
(125, 'Ascorbic Acid (Vitamin C)');

-- ----------------------------------------------------------------------------
-- 4. Medicines (35 domain-accurate medicines with Regulated/Deregulated status)
-- ----------------------------------------------------------------------------
INSERT INTO Medicine (MedicineID, Name, CategoryID, ManufacturerID, PricingCategory, RequiresPrescription, ReorderLevel) VALUES
-- Analgesics & Antipyretics
(1, 'Panadol 500mg Tablet', 1, 1, 'Regulated', 0, 100),
(2, 'Febrol 500mg Tablet', 1, 4, 'Regulated', 0, 50),
(3, 'Calpol 250mg Suspension', 1, 1, 'Regulated', 0, 40),
(4, 'Brufen 400mg Tablet', 1, 2, 'Regulated', 0, 80),
(5, 'Profen 400mg Tablet', 1, 3, 'Regulated', 0, 40),
(6, 'Disprin 300mg Soluble', 1, 8, 'Regulated', 0, 60),

-- Antibiotics
(7, 'Augmentin 625mg Tablet', 2, 1, 'Regulated', 1, 50),
(8, 'Curam 625mg Tablet', 2, 3, 'Regulated', 1, 30),
(9, 'Amoxil 500mg Capsule', 2, 1, 'Regulated', 1, 40),
(10, 'Novidat 500mg Tablet', 2, 5, 'Deregulated', 1, 45),
(11, 'Ciproxin 500mg Tablet', 2, 10, 'Deregulated', 1, 25),
(12, 'Leflox 500mg Tablet', 2, 3, 'Deregulated', 1, 35),
(13, 'Cravit 500mg Tablet', 2, 9, 'Deregulated', 1, 20),
(14, 'Cefspan 400mg Capsule', 2, 4, 'Regulated', 1, 30),
(15, 'Azomax 500mg Tablet', 2, 3, 'Deregulated', 1, 30),

-- Gastrointestinal
(16, 'Risek 20mg Capsule', 4, 3, 'Regulated', 0, 70),
(17, 'Omee 20mg Capsule', 4, 5, 'Regulated', 0, 40),
(18, 'Nexum 20mg Tablet', 4, 3, 'Deregulated', 0, 50),
(19, 'Motilium 10mg Tablet', 4, 8, 'Deregulated', 0, 40),

-- Cardiovascular & Antihypertensives
(20, 'Sofvasc 5mg Tablet', 3, 4, 'Regulated', 1, 60),
(21, 'Norvasc 5mg Tablet', 3, 10, 'Regulated', 1, 30),
(22, 'Eziday 50mg Tablet', 3, 4, 'Regulated', 1, 40),
(23, 'Loprin 75mg Tablet', 3, 4, 'Regulated', 0, 50),
(24, 'Lowplat 75mg Tablet', 3, 4, 'Regulated', 1, 40),

-- Antidiabetics
(25, 'Glucophage 500mg Tablet', 5, 8, 'Regulated', 1, 80),
(26, 'Neodipar 500mg Tablet', 5, 9, 'Regulated', 1, 40),
(27, 'Januvia 100mg Tablet', 5, 10, 'Deregulated', 1, 20),

-- Respiratory & Antiallergic
(28, 'Zyrtec 10mg Tablet', 6, 1, 'Deregulated', 0, 50),
(29, 'Rigix 10mg Tablet', 6, 5, 'Deregulated', 0, 40),
(30, 'Montiget 10mg Tablet', 6, 3, 'Deregulated', 0, 40),
(31, 'Myteka 10mg Tablet', 6, 6, 'Deregulated', 0, 30),
(32, 'Telfast 120mg Tablet', 6, 9, 'Deregulated', 0, 35),

-- Lipid Lowering
(33, 'Lipiget 20mg Tablet', 8, 3, 'Deregulated', 1, 40),
(34, 'Atorva 20mg Tablet', 8, 5, 'Deregulated', 1, 30),
(35, 'Rovista 10mg Tablet', 8, 4, 'Deregulated', 1, 35),

-- Controlled CNS / Pain (Strict prescription required)
(36, 'Xanax 0.5mg Tablet', 7, 10, 'Regulated', 1, 20),
(37, 'Tramal 50mg Capsule', 7, 4, 'Regulated', 1, 25);

-- ----------------------------------------------------------------------------
-- 5. MedicineSalt Mapping (enables Cheaper Substitute recommendation)
-- ----------------------------------------------------------------------------
INSERT INTO MedicineSalt (MedicineID, SaltID, Strength) VALUES
(1, 101, '500mg'),  -- Panadol -> Paracetamol
(2, 101, '500mg'),  -- Febrol -> Paracetamol (Substitute of Panadol)
(3, 101, '250mg/5ml'),
(4, 102, '400mg'),  -- Brufen -> Ibuprofen
(5, 102, '400mg'),  -- Profen -> Ibuprofen (Substitute of Brufen)
(6, 117, '300mg'),  -- Disprin -> Aspirin
(7, 103, '625mg'),  -- Augmentin -> Amox+Clav
(8, 103, '625mg'),  -- Curam -> Amox+Clav (Substitute of Augmentin)
(9, 104, '500mg'),  -- Amoxil -> Amoxicillin
(10, 110, '500mg'), -- Novidat -> Ciprofloxacin
(11, 110, '500mg'), -- Ciproxin -> Ciprofloxacin (Substitute of Novidat)
(12, 111, '500mg'), -- Leflox -> Levofloxacin
(13, 111, '500mg'), -- Cravit -> Levofloxacin (Substitute of Leflox)
(14, 112, '400mg'), -- Cefspan -> Cefixime
(15, 121, '500mg'), -- Azomax -> Azithromycin
(16, 105, '20mg'),  -- Risek -> Omeprazole
(17, 105, '20mg'),  -- Omee -> Omeprazole (Substitute of Risek)
(18, 106, '20mg'),  -- Nexum -> Esomeprazole
(19, 124, '10mg'),  -- Motilium -> Domperidone
(20, 107, '5mg'),   -- Sofvasc -> Amlodipine
(21, 107, '5mg'),   -- Norvasc -> Amlodipine (Substitute of Sofvasc)
(22, 108, '50mg'),  -- Eziday -> Losartan
(23, 117, '75mg'),   -- Loprin -> Low-dose Aspirin
(24, 118, '75mg'),  -- Lowplat -> Clopidogrel
(25, 109, '500mg'), -- Glucophage -> Metformin
(26, 109, '500mg'), -- Neodipar -> Metformin (Substitute of Glucophage)
(27, 122, '100mg'), -- Januvia -> Sitagliptin
(28, 113, '10mg'),  -- Zyrtec -> Cetirizine
(29, 113, '10mg'),  -- Rigix -> Cetirizine (Substitute of Zyrtec)
(30, 114, '10mg'),  -- Montiget -> Montelukast
(31, 114, '10mg'),  -- Myteka -> Montelukast (Substitute of Montiget)
(32, 123, '120mg'), -- Telfast -> Fexofenadine
(33, 115, '20mg'),  -- Lipiget -> Atorvastatin
(34, 115, '20mg'),  -- Atorva -> Atorvastatin (Substitute of Lipiget)
(35, 116, '10mg'),  -- Rovista -> Rosuvastatin
(36, 119, '0.5mg'), -- Xanax -> Alprazolam
(37, 120, '50mg');  -- Tramal -> Tramadol

-- ----------------------------------------------------------------------------
-- 6. Suppliers
-- ----------------------------------------------------------------------------
INSERT INTO Supplier (SupplierID, SupplierName, Phone, Address) VALUES
(1, 'Allied Pharma Distributors', '021-34567890', 'Shahrah-e-Faisal, Karachi'),
(2, 'Medix Wholesalers & Logistics', '042-37890123', 'Mall Road, Lahore'),
(3, 'Khyber MedSupply Co.', '091-5823411', 'University Road, Peshawar'),
(4, 'Capital Drug Agency', '051-2299881', 'Blue Area, Islamabad'),
(5, 'Sindh Health Solutions', '022-2615599', 'Saddar, Hyderabad');

-- ----------------------------------------------------------------------------
-- 7. Batches (Inventory tracking with Expired, Expiring Soon, and Healthy Batches)
-- ----------------------------------------------------------------------------
INSERT INTO Batch (BatchID, MedicineID, SupplierID, ExpiryDate, QuantityInStock, PurchasePrice) VALUES
-- Healthy active stock
(1001, 1, 1, '2027-12-31', 450, 2.80),    -- Panadol
(1002, 1, 2, '2027-08-15', 300, 2.75),    -- Panadol (alternate batch)
(1003, 2, 2, '2027-11-20', 200, 2.10),    -- Febrol (cheaper brand)
(1004, 3, 1, '2027-05-10', 85, 85.00),    -- Calpol Syrup
(1005, 4, 2, '2027-09-30', 250, 4.20),    -- Brufen 400mg
(1006, 5, 3, '2027-10-15', 180, 3.40),    -- Profen 400mg
(1007, 6, 1, '2027-04-18', 320, 2.20),    -- Disprin
(1008, 7, 1, '2027-06-25', 120, 38.50),   -- Augmentin 625mg
(1009, 8, 3, '2027-08-14', 90, 28.00),    -- Curam 625mg
(1010, 9, 1, '2027-07-20', 160, 12.00),   -- Amoxil 500mg
(1011, 10, 2, '2027-10-05', 110, 24.00),  -- Novidat 500mg
(1012, 11, 4, '2027-09-12', 45, 36.00),   -- Ciproxin 500mg
(1013, 12, 3, '2027-11-01', 95, 32.00),   -- Leflox 500mg
(1014, 13, 1, '2027-03-30', 40, 52.00),   -- Cravit 500mg
(1015, 14, 4, '2027-12-15', 60, 68.00),   -- Cefspan 400mg
(1016, 15, 3, '2027-07-07', 85, 44.00),   -- Azomax 500mg
(1017, 16, 3, '2027-12-01', 220, 18.00),  -- Risek 20mg
(1018, 17, 5, '2027-10-10', 140, 11.50),  -- Omee 20mg
(1019, 18, 3, '2027-08-20', 150, 26.00),  -- Nexum 20mg
(1020, 19, 2, '2027-09-05', 90, 7.50),    -- Motilium
(1021, 20, 4, '2027-11-25', 160, 7.20),   -- Sofvasc 5mg
(1022, 21, 1, '2027-10-30', 50, 14.50),   -- Norvasc 5mg
(1023, 22, 4, '2027-12-30', 110, 12.00),  -- Eziday 50mg
(1024, 23, 4, '2027-06-15', 250, 1.80),   -- Loprin 75mg
(1025, 24, 4, '2027-09-18', 130, 8.50),   -- Lowplat 75mg
(1026, 25, 2, '2027-11-15', 300, 3.20),   -- Glucophage 500mg
(1027, 26, 5, '2027-10-12', 180, 2.40),   -- Neodipar 500mg
(1028, 27, 1, '2027-07-28', 40, 65.00),   -- Januvia 100mg
(1029, 28, 1, '2027-08-30', 140, 8.20),   -- Zyrtec 10mg
(1030, 29, 5, '2027-09-22', 110, 5.50),   -- Rigix 10mg
(1031, 30, 3, '2027-12-10', 90, 24.00),   -- Montiget 10mg
(1032, 31, 2, '2027-10-14', 65, 22.00),   -- Myteka 10mg
(1033, 32, 1, '2027-09-09', 80, 16.50),   -- Telfast 120mg
(1034, 33, 3, '2027-11-18', 120, 21.00),  -- Lipiget 20mg
(1035, 34, 5, '2027-10-25', 90, 14.00),   -- Atorva 20mg
(1036, 35, 4, '2027-12-05', 85, 27.50),   -- Rovista 10mg
(1037, 36, 1, '2027-05-30', 60, 8.50),    -- Xanax 0.5mg
(1038, 37, 4, '2027-06-20', 70, 15.00),   -- Tramal 50mg

-- Special test batches: Expiring soon (Within 30 days)
(2001, 7, 2, '2026-11-20', 18, 38.00),    -- Augmentin expiring in ~17 days!
(2002, 16, 1, '2026-11-28', 25, 17.50),   -- Risek expiring in ~25 days!
(2003, 1, 3, '2026-12-01', 35, 2.60),     -- Panadol expiring in 28 days!

-- Special test batches: Expired stock (Strictly blocked from sale by trigger)
(3001, 4, 1, '2026-09-15', 50, 4.00),     -- Brufen Expired!
(3002, 9, 2, '2026-08-01', 30, 11.50);    -- Amoxil Expired!

-- Low stock sample medicines: Set quantity below reorder level for alert testing
INSERT INTO Batch (BatchID, MedicineID, SupplierID, ExpiryDate, QuantityInStock, PurchasePrice) VALUES
(4001, 14, 4, '2027-04-10', 12, 68.00),   -- Cefspan stock=12 (Reorder level=30)
(4002, 27, 1, '2027-05-15', 8, 65.00);    -- Januvia stock=8 (Reorder level=20)

-- ----------------------------------------------------------------------------
-- 8. Staff Accounts (with SHA256 hashed passwords for demo; e.g. 'admin123', 'pass123')
-- ----------------------------------------------------------------------------
INSERT INTO Staff (StaffID, StaffName, Role, Username, PasswordHash) VALUES
(1, 'Dr. Tariq Mahmood', 'Admin', 'admin_tariq', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'), -- admin123
(2, 'Sarah Khan, PharmD', 'Pharmacist', 'pharm_sarah', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'), -- 123
(3, 'Muhammad Usman', 'Pharmacist', 'pharm_usman', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(4, 'Bilal Ahmed', 'Cashier', 'cashier_bilal', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(5, 'Ayesha Siddiqui', 'Cashier', 'cashier_ayesha', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

-- ----------------------------------------------------------------------------
-- 9. Customers
-- ----------------------------------------------------------------------------
INSERT INTO Customer (CustomerID, CustomerName, Phone) VALUES
(1, 'Ali Raza', '0300-1234567'),
(2, 'Fatima Noor', '0321-7654321'),
(3, 'Zubair Shah', '0333-9876543'),
(4, 'Dr. Amina Malik', '0345-4567890'),
(5, 'Kamran Akmal', '0312-3456789'),
(6, 'Hina Parvez', '0302-8877665');

-- ----------------------------------------------------------------------------
-- 10. Prescriptions
-- ----------------------------------------------------------------------------
INSERT INTO Prescription (PrescriptionID, CustomerID, DoctorName, PrescriptionDate) VALUES
(501, 1, 'Dr. A. R. Jamali, Consultant Pulmonologist', '2026-10-25'),
(502, 2, 'Dr. Nighat Mir, Cardiologist', '2026-10-28'),
(503, 3, 'Dr. Salman Hashmi, Diabetologist', '2026-11-01'),
(504, 5, 'Dr. Zafar Iqbal, Psychiatrist', '2026-11-02');

-- ----------------------------------------------------------------------------
-- 11. PriceHistory (DRAP Regulated Price Ceilings vs Selling Prices)
-- ----------------------------------------------------------------------------
INSERT INTO PriceHistory (PriceID, MedicineID, MRP, SellingPrice, EffectiveFrom, EffectiveTo, ChangedBy, Source) VALUES
-- Panadol 500mg
(1, 1, 3.20, 3.00, '2025-01-01', '2026-06-30', 1, 'DRAP SRO 2025-01'),
(2, 1, 3.50, 3.40, '2026-07-01', NULL, 1, 'DRAP SRO 2026-04'),

-- Febrol 500mg
(3, 2, 3.10, 2.70, '2026-01-01', NULL, 1, 'Searle Revision'),

-- Calpol
(4, 3, 110.00, 105.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Brufen 400mg
(5, 4, 5.50, 5.20, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),
(6, 5, 4.80, 4.20, '2026-01-01', NULL, 1, 'Company Price List'),

-- Disprin
(7, 6, 3.00, 2.80, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Augmentin 625mg
(8, 7, 52.00, 50.00, '2025-06-01', '2026-05-31', 1, 'DRAP SRO 2025-09'),
(9, 7, 56.50, 55.00, '2026-06-01', NULL, 1, 'DRAP SRO 2026-05'),

-- Curam 625mg (cheaper substitute)
(10, 8, 45.00, 40.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Amoxil 500mg
(11, 9, 16.00, 15.50, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Novidat (Deregulated: No DRAP ceiling)
(12, 10, NULL, 36.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),
(13, 11, NULL, 50.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),

-- Leflox & Cravit
(14, 12, NULL, 48.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),
(15, 13, NULL, 75.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),

-- Cefspan 400mg
(16, 14, 98.00, 95.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Azomax 500mg
(17, 15, NULL, 65.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),

-- Risek 20mg
(18, 16, 26.00, 25.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),
(19, 17, 20.00, 18.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Nexum 20mg
(20, 18, NULL, 38.00, '2026-01-01', NULL, 2, 'Market Deregulated Rate'),

-- Sofvasc & Norvasc
(21, 20, 10.50, 9.80, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),
(22, 21, 18.50, 18.00, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Glucophage
(23, 25, 4.50, 4.20, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),
(24, 26, 3.80, 3.40, '2026-01-01', NULL, 1, 'DRAP SRO 2026-01'),

-- Controlled Drugs
(25, 36, 12.00, 11.50, '2026-01-01', NULL, 1, 'DRAP Controlled Drug Ceiling'),
(26, 37, 22.00, 21.00, '2026-01-01', NULL, 1, 'DRAP Controlled Drug Ceiling');

-- ----------------------------------------------------------------------------
-- 12. Supplier Quotes (Multi-supplier price comparison)
-- ----------------------------------------------------------------------------
INSERT INTO SupplierQuote (QuoteID, SupplierID, MedicineID, QuotedPrice, QuoteDate) VALUES
(1, 1, 1, 2.75, '2026-10-01'),  -- Allied on Panadol
(2, 2, 1, 2.70, '2026-10-02'),  -- Medix on Panadol (Cheaper!)
(3, 4, 1, 2.80, '2026-10-05'),  -- Capital on Panadol
(4, 1, 7, 39.00, '2026-10-10'), -- Allied on Augmentin
(5, 2, 7, 37.50, '2026-10-12'), -- Medix on Augmentin (Cheaper!)
(6, 3, 16, 17.50, '2026-10-15'),-- Khyber on Risek (Cheapest!)
(7, 1, 16, 18.20, '2026-10-15'),-- Allied on Risek
(8, 2, 20, 7.10, '2026-10-18'), -- Medix on Sofvasc
(9, 4, 20, 6.95, '2026-10-18'), -- Capital on Sofvasc (Cheaper!)
(10, 2, 25, 3.10, '2026-10-20'),-- Medix on Glucophage
(11, 5, 25, 3.05, '2026-10-21');-- Sindh Health on Glucophage (Cheaper!)

-- ----------------------------------------------------------------------------
-- 13. Market Reference Prices (Benchmarking vs DRAP survey data)
-- ----------------------------------------------------------------------------
INSERT INTO MarketReference (RefID, MedicineID, AvgMarketPrice, Source, RecordedDate) VALUES
(1, 1, 3.40, 'DRAP Market Survey Q3', '2026-09-30'),
(2, 4, 5.25, 'National Pharma Index', '2026-09-30'),
(3, 7, 54.50, 'DRAP Pricing Benchmark', '2026-10-15'),
(4, 10, 38.00, 'Karachi Retailers Survey', '2026-10-01'),
(5, 16, 25.50, 'National Retail Benchmark', '2026-10-10'),
(6, 20, 9.90, 'DRAP Price Monitor', '2026-10-05'),
(7, 25, 4.30, 'National Pharma Index', '2026-10-20');

-- ----------------------------------------------------------------------------
-- 14. Purchase Orders & Items
-- ----------------------------------------------------------------------------
INSERT INTO PurchaseOrder (POID, SupplierID, OrderDate, Status) VALUES
(8001, 1, '2026-10-05', 'Received'),
(8002, 2, '2026-10-12', 'Received'),
(8003, 3, '2026-10-20', 'Received'),
(8004, 4, '2026-11-01', 'Approved');

INSERT INTO PurchaseOrderItem (POID, MedicineID, Quantity, Cost) VALUES
(8001, 1, 500, 2.80),
(8001, 7, 100, 38.50),
(8002, 4, 200, 4.20),
(8002, 10, 80, 24.00),
(8003, 16, 250, 18.00),
(8004, 20, 150, 7.20);

-- ----------------------------------------------------------------------------
-- 15. Invoices & Invoice Items (Sample transaction history)
-- ----------------------------------------------------------------------------
INSERT INTO Invoice (InvoiceID, CustomerID, StaffID, PrescriptionID, InvoiceDate, TotalAmount) VALUES
(9001, 1, 4, 501, '2026-10-28 10:15:00', 825.00),
(9002, 2, 4, 502, '2026-10-29 14:30:00', 392.00),
(9003, 3, 5, 503, '2026-11-01 16:45:00', 210.00),
(9004, 6, 4, NULL, '2026-11-02 11:20:00', 102.00),
(9005, 5, 5, 504, '2026-11-03 18:10:00', 230.00);

INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale) VALUES
-- Invoice 9001: Augmentin + Panadol
(9001, 1008, 14, 55.00),
(9001, 1001, 16, 3.40),

-- Invoice 9002: Sofvasc + Loprin
(9002, 1021, 30, 9.80),
(9002, 1024, 50, 1.96),

-- Invoice 9003: Glucophage
(9003, 1026, 50, 4.20),

-- Invoice 9004: Panadol + Disprin (OTC, no prescription needed)
(9004, 1001, 20, 3.40),
(9004, 1007, 12, 2.80),

-- Invoice 9005: Xanax (Requires Prescription 504)
(9005, 1037, 20, 11.50);
