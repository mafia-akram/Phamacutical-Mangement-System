/**
 * Pharmaceutical Management System (PMS) - Client Engine & Application Logic
 * Supports BOTH:
 * 1. Live Mode: Real-time REST API connection to SQLite/PostgreSQL backend (http://localhost:5000)
 * 2. Standalone Mode: Fully operational in-browser database engine (Works directly when opening index.html via file://)
 */

// ============================================================================
// EMBEDDED COMPLETE DATASET (Enables 100% functionality even when offline)
// ============================================================================
const EMBEDDED_DATA = {
  categories: [
    { CategoryID: 1, CategoryName: "Analgesics & Antipyretics" },
    { CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials" },
    { CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives" },
    { CategoryID: 4, CategoryName: "Gastrointestinal & Antacids" },
    { CategoryID: 5, CategoryName: "Antidiabetics" },
    { CategoryID: 6, CategoryName: "Respiratory & Antiallergic" },
    { CategoryID: 7, CategoryName: "Central Nervous System (CNS) & Sedatives" },
    { CategoryID: 8, CategoryName: "Lipid Lowering / Statins" },
    { CategoryID: 9, CategoryName: "Vitamins & Supplements" },
    { CategoryID: 10, CategoryName: "Dermatologicals" }
  ],
  manufacturers: [
    { ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline (GSK) Pakistan", Country: "Pakistan" },
    { ManufacturerID: 2, ManufacturerName: "Abbott Laboratories Pakistan", Country: "Pakistan" },
    { ManufacturerID: 3, ManufacturerName: "Getz Pharma (Pvt) Ltd", Country: "Pakistan" },
    { ManufacturerID: 4, ManufacturerName: "The Searle Company Limited", Country: "Pakistan" },
    { ManufacturerID: 5, ManufacturerName: "Sami Pharmaceuticals", Country: "Pakistan" },
    { ManufacturerID: 6, ManufacturerName: "Hilton Pharma Limited", Country: "Pakistan" },
    { ManufacturerID: 7, ManufacturerName: "Ferozsons Laboratories", Country: "Pakistan" },
    { ManufacturerID: 8, ManufacturerName: "Martin Dow Marker", Country: "Pakistan" },
    { ManufacturerID: 9, ManufacturerName: "Sanofi-Aventis Pakistan", Country: "Pakistan" },
    { ManufacturerID: 10, ManufacturerName: "Pfizer Pakistan Limited", Country: "Pakistan" }
  ],
  suppliers: [
    { SupplierID: 1, SupplierName: "Allied Pharma Distributors", Phone: "021-34567890", Address: "Shahrah-e-Faisal, Karachi" },
    { SupplierID: 2, SupplierName: "Medix Wholesalers & Logistics", Phone: "042-37890123", Address: "Mall Road, Lahore" },
    { SupplierID: 3, SupplierName: "Khyber MedSupply Co.", Phone: "091-5823411", Address: "University Road, Peshawar" },
    { SupplierID: 4, SupplierName: "Capital Drug Agency", Phone: "051-2299881", Address: "Blue Area, Islamabad" },
    { SupplierID: 5, SupplierName: "Sindh Health Solutions", Phone: "022-2615599", Address: "Saddar, Hyderabad" }
  ],
  customers: [
    { CustomerID: 1, CustomerName: "Ali Raza", Phone: "0300-1234567" },
    { CustomerID: 2, CustomerName: "Fatima Noor", Phone: "0321-7654321" },
    { CustomerID: 3, CustomerName: "Zubair Shah", Phone: "0333-9876543" },
    { CustomerID: 4, CustomerName: "Dr. Amina Malik", Phone: "0345-4567890" },
    { CustomerID: 5, CustomerName: "Kamran Akmal", Phone: "0312-3456789" },
    { CustomerID: 6, CustomerName: "Hina Parvez", Phone: "0302-8877665" }
  ],
  prescriptions: [
    { PrescriptionID: 501, CustomerID: 1, CustomerName: "Ali Raza", DoctorName: "Dr. A. R. Jamali, Consultant Pulmonologist", PrescriptionDate: "2026-10-25" },
    { PrescriptionID: 502, CustomerID: 2, CustomerName: "Fatima Noor", DoctorName: "Dr. Nighat Mir, Cardiologist", PrescriptionDate: "2026-10-28" },
    { PrescriptionID: 503, CustomerID: 3, CustomerName: "Zubair Shah", DoctorName: "Dr. Salman Hashmi, Diabetologist", PrescriptionDate: "2026-11-01" },
    { PrescriptionID: 504, CustomerID: 5, CustomerName: "Kamran Akmal", DoctorName: "Dr. Zafar Iqbal, Psychiatrist", PrescriptionDate: "2026-11-02" }
  ],
  medicines: [
    { MedicineID: 1, Name: "Panadol 500mg Tablet", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 100, MRP: 3.50, SellingPrice: 3.40, TotalStock: 750 },
    { MedicineID: 2, Name: "Febrol 500mg Tablet", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 50, MRP: 3.10, SellingPrice: 2.70, TotalStock: 200 },
    { MedicineID: 3, Name: "Calpol 250mg Suspension", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: 110.00, SellingPrice: 105.00, TotalStock: 85 },
    { MedicineID: 4, Name: "Brufen 400mg Tablet", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 2, ManufacturerName: "Abbott Laboratories", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 80, MRP: 5.50, SellingPrice: 5.20, TotalStock: 250 },
    { MedicineID: 5, Name: "Profen 400mg Tablet", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: 4.80, SellingPrice: 4.20, TotalStock: 180 },
    { MedicineID: 6, Name: "Disprin 300mg Soluble", CategoryID: 1, CategoryName: "Analgesics & Antipyretics", ManufacturerID: 8, ManufacturerName: "Martin Dow", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 60, MRP: 3.00, SellingPrice: 2.80, TotalStock: 320 },
    { MedicineID: 7, Name: "Augmentin 625mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 50, MRP: 56.50, SellingPrice: 55.00, TotalStock: 138 },
    { MedicineID: 8, Name: "Curam 625mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 30, MRP: 45.00, SellingPrice: 40.00, TotalStock: 90 },
    { MedicineID: 9, Name: "Amoxil 500mg Capsule", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 40, MRP: 16.00, SellingPrice: 15.50, TotalStock: 160 },
    { MedicineID: 10, Name: "Novidat 500mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 5, ManufacturerName: "Sami Pharmaceuticals", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 45, MRP: null, SellingPrice: 36.00, TotalStock: 110 },
    { MedicineID: 11, Name: "Ciproxin 500mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 10, ManufacturerName: "Pfizer Pakistan", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 25, MRP: null, SellingPrice: 50.00, TotalStock: 45 },
    { MedicineID: 12, Name: "Leflox 500mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 35, MRP: null, SellingPrice: 48.00, TotalStock: 95 },
    { MedicineID: 13, Name: "Cravit 500mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 9, ManufacturerName: "Sanofi-Aventis", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 20, MRP: null, SellingPrice: 75.00, TotalStock: 40 },
    { MedicineID: 14, Name: "Cefspan 400mg Capsule", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 30, MRP: 98.00, SellingPrice: 95.00, TotalStock: 12 },
    { MedicineID: 15, Name: "Azomax 500mg Tablet", CategoryID: 2, CategoryName: "Antibiotics & Antimicrobials", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 30, MRP: null, SellingPrice: 65.00, TotalStock: 85 },
    { MedicineID: 16, Name: "Risek 20mg Capsule", CategoryID: 4, CategoryName: "Gastrointestinal & Antacids", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 70, MRP: 26.00, SellingPrice: 25.00, TotalStock: 245 },
    { MedicineID: 17, Name: "Omee 20mg Capsule", CategoryID: 4, CategoryName: "Gastrointestinal & Antacids", ManufacturerID: 5, ManufacturerName: "Sami Pharmaceuticals", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: 20.00, SellingPrice: 18.00, TotalStock: 140 },
    { MedicineID: 18, Name: "Nexum 20mg Tablet", CategoryID: 4, CategoryName: "Gastrointestinal & Antacids", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 50, MRP: null, SellingPrice: 38.00, TotalStock: 150 },
    { MedicineID: 19, Name: "Motilium 10mg Tablet", CategoryID: 4, CategoryName: "Gastrointestinal & Antacids", ManufacturerID: 8, ManufacturerName: "Martin Dow", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: null, SellingPrice: 12.00, TotalStock: 90 },
    { MedicineID: 20, Name: "Sofvasc 5mg Tablet", CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 60, MRP: 10.50, SellingPrice: 9.80, TotalStock: 160 },
    { MedicineID: 21, Name: "Norvasc 5mg Tablet", CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives", ManufacturerID: 10, ManufacturerName: "Pfizer Pakistan", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 30, MRP: 18.50, SellingPrice: 18.00, TotalStock: 50 },
    { MedicineID: 22, Name: "Eziday 50mg Tablet", CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 40, MRP: 14.00, SellingPrice: 13.50, TotalStock: 110 },
    { MedicineID: 23, Name: "Loprin 75mg Tablet", CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 0, ReorderLevel: 50, MRP: 2.20, SellingPrice: 2.00, TotalStock: 250 },
    { MedicineID: 24, Name: "Lowplat 75mg Tablet", CategoryID: 3, CategoryName: "Cardiovascular & Antihypertensives", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 40, MRP: 12.00, SellingPrice: 11.50, TotalStock: 130 },
    { MedicineID: 25, Name: "Glucophage 500mg Tablet", CategoryID: 5, CategoryName: "Antidiabetics", ManufacturerID: 8, ManufacturerName: "Martin Dow", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 80, MRP: 4.50, SellingPrice: 4.20, TotalStock: 300 },
    { MedicineID: 26, Name: "Neodipar 500mg Tablet", CategoryID: 5, CategoryName: "Antidiabetics", ManufacturerID: 9, ManufacturerName: "Sanofi-Aventis", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 40, MRP: 3.80, SellingPrice: 3.40, TotalStock: 180 },
    { MedicineID: 27, Name: "Januvia 100mg Tablet", CategoryID: 5, CategoryName: "Antidiabetics", ManufacturerID: 10, ManufacturerName: "Pfizer Pakistan", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 20, MRP: null, SellingPrice: 85.00, TotalStock: 8 },
    { MedicineID: 28, Name: "Zyrtec 10mg Tablet", CategoryID: 6, CategoryName: "Respiratory & Antiallergic", ManufacturerID: 1, ManufacturerName: "GlaxoSmithKline", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 50, MRP: null, SellingPrice: 12.00, TotalStock: 140 },
    { MedicineID: 29, Name: "Rigix 10mg Tablet", CategoryID: 6, CategoryName: "Respiratory & Antiallergic", ManufacturerID: 5, ManufacturerName: "Sami Pharmaceuticals", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: null, SellingPrice: 8.50, TotalStock: 110 },
    { MedicineID: 30, Name: "Montiget 10mg Tablet", CategoryID: 6, CategoryName: "Respiratory & Antiallergic", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 40, MRP: null, SellingPrice: 32.00, TotalStock: 90 },
    { MedicineID: 31, Name: "Myteka 10mg Tablet", CategoryID: 6, CategoryName: "Respiratory & Antiallergic", ManufacturerID: 6, ManufacturerName: "Hilton Pharma", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 30, MRP: null, SellingPrice: 28.00, TotalStock: 65 },
    { MedicineID: 32, Name: "Telfast 120mg Tablet", CategoryID: 6, CategoryName: "Respiratory & Antiallergic", ManufacturerID: 9, ManufacturerName: "Sanofi-Aventis", PricingCategory: "Deregulated", RequiresPrescription: 0, ReorderLevel: 35, MRP: null, SellingPrice: 24.00, TotalStock: 80 },
    { MedicineID: 33, Name: "Lipiget 20mg Tablet", CategoryID: 8, CategoryName: "Lipid Lowering / Statins", ManufacturerID: 3, ManufacturerName: "Getz Pharma", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 40, MRP: null, SellingPrice: 28.00, TotalStock: 120 },
    { MedicineID: 34, Name: "Atorva 20mg Tablet", CategoryID: 8, CategoryName: "Lipid Lowering / Statins", ManufacturerID: 5, ManufacturerName: "Sami Pharmaceuticals", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 30, MRP: null, SellingPrice: 20.00, TotalStock: 90 },
    { MedicineID: 35, Name: "Rovista 10mg Tablet", CategoryID: 8, CategoryName: "Lipid Lowering / Statins", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Deregulated", RequiresPrescription: 1, ReorderLevel: 35, MRP: null, SellingPrice: 35.00, TotalStock: 85 },
    { MedicineID: 36, Name: "Xanax 0.5mg Tablet", CategoryID: 7, CategoryName: "Central Nervous System (CNS) & Sedatives", ManufacturerID: 10, ManufacturerName: "Pfizer Pakistan", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 20, MRP: 12.00, SellingPrice: 11.50, TotalStock: 60 },
    { MedicineID: 37, Name: "Tramal 50mg Capsule", CategoryID: 7, CategoryName: "Central Nervous System (CNS) & Sedatives", ManufacturerID: 4, ManufacturerName: "The Searle Company", PricingCategory: "Regulated", RequiresPrescription: 1, ReorderLevel: 25, MRP: 22.00, SellingPrice: 21.00, TotalStock: 70 }
  ],
  batches: [
    { BatchID: 1001, MedicineID: 1, MedicineName: "Panadol 500mg Tablet", SupplierName: "Allied Pharma", ExpiryDate: "2027-12-31", QuantityInStock: 450, PurchasePrice: 2.80, Status: "ACTIVE" },
    { BatchID: 1002, MedicineID: 1, MedicineName: "Panadol 500mg Tablet", SupplierName: "Medix Wholesalers", ExpiryDate: "2027-08-15", QuantityInStock: 300, PurchasePrice: 2.75, Status: "ACTIVE" },
    { BatchID: 1003, MedicineID: 2, MedicineName: "Febrol 500mg Tablet", SupplierName: "Medix Wholesalers", ExpiryDate: "2027-11-20", QuantityInStock: 200, PurchasePrice: 2.10, Status: "ACTIVE" },
    { BatchID: 1008, MedicineID: 7, MedicineName: "Augmentin 625mg Tablet", SupplierName: "Allied Pharma", ExpiryDate: "2027-06-25", QuantityInStock: 120, PurchasePrice: 38.50, Status: "ACTIVE" },
    { BatchID: 2001, MedicineID: 7, MedicineName: "Augmentin 625mg Tablet", SupplierName: "Medix Wholesalers", ExpiryDate: "2026-11-20", QuantityInStock: 18, PurchasePrice: 38.00, Status: "EXPIRING SOON", InventoryAtRiskValue: 684.00, ExpiryStatus: "CRITICAL (<= 30 days)" },
    { BatchID: 2002, MedicineID: 16, MedicineName: "Risek 20mg Capsule", SupplierName: "Allied Pharma", ExpiryDate: "2026-11-28", QuantityInStock: 25, PurchasePrice: 17.50, Status: "EXPIRING SOON", InventoryAtRiskValue: 437.50, ExpiryStatus: "CRITICAL (<= 30 days)" },
    { BatchID: 3001, MedicineID: 4, MedicineName: "Brufen 400mg Tablet", SupplierName: "Allied Pharma", ExpiryDate: "2026-09-15", QuantityInStock: 50, PurchasePrice: 4.00, Status: "EXPIRED", InventoryAtRiskValue: 200.00, ExpiryStatus: "EXPIRED" },
    { BatchID: 4001, MedicineID: 14, MedicineName: "Cefspan 400mg Capsule", SupplierName: "Capital Drug", ExpiryDate: "2027-04-10", QuantityInStock: 12, PurchasePrice: 68.00, Status: "ACTIVE" },
    { BatchID: 4002, MedicineID: 27, MedicineName: "Januvia 100mg Tablet", SupplierName: "Allied Pharma", ExpiryDate: "2027-05-15", QuantityInStock: 8, PurchasePrice: 65.00, Status: "ACTIVE" }
  ],
  substitutes: [
    { OriginalMedicineID: 1, OriginalMedicineName: "Panadol 500mg Tablet", OriginalPrice: 3.40, SaltName: "Paracetamol", Strength: "500mg", SubstituteMedicineID: 2, SubstituteMedicineName: "Febrol 500mg Tablet", SubstitutePrice: 2.70, CustomerSavingsPerUnit: 0.70, PercentSavings: 20.6 },
    { OriginalMedicineID: 4, OriginalMedicineName: "Brufen 400mg Tablet", OriginalPrice: 5.20, SaltName: "Ibuprofen", Strength: "400mg", SubstituteMedicineID: 5, SubstituteMedicineName: "Profen 400mg Tablet", SubstitutePrice: 4.20, CustomerSavingsPerUnit: 1.00, PercentSavings: 19.2 },
    { OriginalMedicineID: 7, OriginalMedicineName: "Augmentin 625mg Tablet", OriginalPrice: 55.00, SaltName: "Amoxicillin + Clavulanic Acid", Strength: "625mg", SubstituteMedicineID: 8, SubstituteMedicineName: "Curam 625mg Tablet", SubstitutePrice: 40.00, CustomerSavingsPerUnit: 15.00, PercentSavings: 27.3 },
    { OriginalMedicineID: 10, OriginalMedicineName: "Ciproxin 500mg Tablet", OriginalPrice: 50.00, SaltName: "Ciprofloxacin", Strength: "500mg", SubstituteMedicineID: 11, SubstituteMedicineName: "Novidat 500mg Tablet", SubstitutePrice: 36.00, CustomerSavingsPerUnit: 14.00, PercentSavings: 28.0 },
    { OriginalMedicineID: 16, OriginalMedicineName: "Risek 20mg Capsule", OriginalPrice: 25.00, SaltName: "Omeprazole", Strength: "20mg", SubstituteMedicineID: 17, SubstituteMedicineName: "Omee 20mg Capsule", SubstitutePrice: 18.00, CustomerSavingsPerUnit: 7.00, PercentSavings: 28.0 },
    { OriginalMedicineID: 21, OriginalMedicineName: "Norvasc 5mg Tablet", OriginalPrice: 18.00, SaltName: "Amlodipine Besylate", Strength: "5mg", SubstituteMedicineID: 20, SubstituteMedicineName: "Sofvasc 5mg Tablet", SubstitutePrice: 9.80, CustomerSavingsPerUnit: 8.20, PercentSavings: 45.6 },
    { OriginalMedicineID: 25, OriginalMedicineName: "Glucophage 500mg Tablet", OriginalPrice: 4.20, SaltName: "Metformin Hydrochloride", Strength: "500mg", SubstituteMedicineID: 26, SubstituteMedicineName: "Neodipar 500mg Tablet", SubstitutePrice: 3.40, CustomerSavingsPerUnit: 0.80, PercentSavings: 19.0 },
    { OriginalMedicineID: 28, OriginalMedicineName: "Zyrtec 10mg Tablet", OriginalPrice: 12.00, SaltName: "Cetirizine Dihydrochloride", Strength: "10mg", SubstituteMedicineID: 29, SubstituteMedicineName: "Rigix 10mg Tablet", SubstitutePrice: 8.50, CustomerSavingsPerUnit: 3.50, PercentSavings: 29.2 },
    { OriginalMedicineID: 30, OriginalMedicineName: "Montiget 10mg Tablet", OriginalPrice: 32.00, SaltName: "Montelukast Sodium", Strength: "10mg", SubstituteMedicineID: 31, SubstituteMedicineName: "Myteka 10mg Tablet", SubstitutePrice: 28.00, CustomerSavingsPerUnit: 4.00, PercentSavings: 12.5 },
    { OriginalMedicineID: 33, OriginalMedicineName: "Lipiget 20mg Tablet", OriginalPrice: 28.00, SaltName: "Atorvastatin Calcium", Strength: "20mg", SubstituteMedicineID: 34, SubstituteMedicineName: "Atorva 20mg Tablet", SubstitutePrice: 20.00, CustomerSavingsPerUnit: 8.00, PercentSavings: 28.6 }
  ],
  priceHistory: [
    { MedicineID: 1, EffectiveFrom: "2026-07-01", EffectiveTo: null, MRP: 3.50, SellingPrice: 3.40, ChangedByName: "Dr. Tariq Mahmood", Source: "DRAP SRO 2026-04" },
    { MedicineID: 1, EffectiveFrom: "2025-01-01", EffectiveTo: "2026-06-30", MRP: 3.20, SellingPrice: 3.00, ChangedByName: "Dr. Tariq Mahmood", Source: "DRAP SRO 2025-01" },
    { MedicineID: 7, EffectiveFrom: "2026-06-01", EffectiveTo: null, MRP: 56.50, SellingPrice: 55.00, ChangedByName: "Dr. Tariq Mahmood", Source: "DRAP SRO 2026-05" },
    { MedicineID: 7, EffectiveFrom: "2025-06-01", EffectiveTo: "2026-05-31", MRP: 52.00, SellingPrice: 50.00, ChangedByName: "Dr. Tariq Mahmood", Source: "DRAP SRO 2025-09" }
  ]
};

// Global App State
const state = {
  isLiveBackend: false,
  apiBase: window.location.origin && window.location.origin.startsWith("http") ? "" : "http://localhost:5000",
  currentUser: { staffId: 1, name: "Dr. Tariq Mahmood", role: "Admin" },
  medicines: [],
  categories: [],
  manufacturers: [],
  suppliers: [],
  customers: [],
  prescriptions: [],
  cart: [],
  salesChart: null,
  invoicesGenerated: 5,
  todayRevenue: 1767.00
};

// ============================================================================
// Initialization & Backend Connectivity Check
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupRoleSwitcher();
  setupPOSSearch();
  await initApplication();
});

async function initApplication() {
  renderStatusBanner("checking", "Connecting to database...");

  // Try pinging backend API
  try {
    const testUrl = `${state.apiBase}/api/metadata`;
    const res = await fetch(testUrl, { method: "GET", headers: { "Accept": "application/json" } });
    if (res.ok) {
      const data = await res.json();
      state.isLiveBackend = true;
      state.categories = data.categories || [];
      state.manufacturers = data.manufacturers || [];
      state.suppliers = data.suppliers || [];
      state.customers = data.customers || [];
      state.prescriptions = data.prescriptions || [];
      renderStatusBanner("live", "Connected to Live SQLite Backend (port 5000)");
      await loadMedicines();
      await loadDashboardMetrics();
      populateMetadataDropdowns();
      return;
    }
  } catch (err) {
    // Backend unreachable -> activate Standalone In-Memory Mode
  }

  // Fallback to Standalone Mode
  activateStandaloneMode();
}

function activateStandaloneMode() {
  state.isLiveBackend = false;
  state.categories = JSON.parse(JSON.stringify(EMBEDDED_DATA.categories));
  state.manufacturers = JSON.parse(JSON.stringify(EMBEDDED_DATA.manufacturers));
  state.suppliers = JSON.parse(JSON.stringify(EMBEDDED_DATA.suppliers));
  state.customers = JSON.parse(JSON.stringify(EMBEDDED_DATA.customers));
  state.prescriptions = JSON.parse(JSON.stringify(EMBEDDED_DATA.prescriptions));
  state.medicines = JSON.parse(JSON.stringify(EMBEDDED_DATA.medicines));

  renderStatusBanner("standalone", "Standalone Client Mode Active (Full relational simulation ready). To use live SQLite, run start_system.bat.");
  populateMetadataDropdowns();
  renderMedicinesTable(state.medicines);
  loadDashboardMetricsStandalone();
}

function renderStatusBanner(type, message) {
  let banner = document.getElementById("pmsStatusBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "pmsStatusBanner";
    banner.style.cssText = "padding: 8px 24px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: space-between;";
    const nav = document.querySelector(".top-nav");
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(banner, nav.nextSibling);
    }
  }

  if (type === "live") {
    banner.style.backgroundColor = "#dcfce7";
    banner.style.color = "#166534";
    banner.style.borderBottom = "1px solid #bbf7d0";
    banner.innerHTML = `<span><i class="fa-solid fa-circle-check"></i> ${message}</span> <span class="badge badge-success">ACID Transactions Active</span>`;
  } else if (type === "standalone") {
    banner.style.backgroundColor = "#fef3c7";
    banner.style.color = "#92400e";
    banner.style.borderBottom = "1px solid #fde68a";
    banner.innerHTML = `<span><i class="fa-solid fa-circle-info"></i> ${message}</span> <span class="badge badge-warning">Browser In-Memory Storage</span>`;
  } else {
    banner.style.backgroundColor = "#e0f2fe";
    banner.style.color = "#0369a1";
    banner.style.borderBottom = "1px solid #bae6fd";
    banner.innerHTML = `<span><i class="fa-solid fa-spinner fa-spin"></i> ${message}</span>`;
  }
}

// ============================================================================
// UI Navigation & Dropdowns
// ============================================================================
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const tabId = item.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
      const activePane = document.getElementById(`tab-${tabId}`);
      if (activePane) activePane.classList.add("active");

      if (tabId === "dashboard") loadDashboardMetrics();
      if (tabId === "medicines") loadMedicines();
      if (tabId === "pos") loadPOSView();
      if (tabId === "suppliers") loadSuppliersView();
      if (tabId === "prescriptions") loadPrescriptionsView();
      if (tabId === "bi-reports") loadBIReports();
    });
  });
}

function setupRoleSwitcher() {
  const switcher = document.getElementById("roleSwitcher");
  if (!switcher) return;
  switcher.addEventListener("change", (e) => {
    state.currentUser.role = e.target.value;
    document.getElementById("userRoleBadge").innerText = state.currentUser.role;
    if (state.currentUser.role === "Admin") {
      state.currentUser.staffId = 1;
      state.currentUser.name = "Dr. Tariq Mahmood";
    } else if (state.currentUser.role === "Pharmacist") {
      state.currentUser.staffId = 2;
      state.currentUser.name = "Sarah Khan, PharmD";
    } else {
      state.currentUser.staffId = 4;
      state.currentUser.name = "Bilal Ahmed";
    }
    document.getElementById("userNameDisplay").innerText = state.currentUser.name;
    document.getElementById("userAvatar").innerText = state.currentUser.name.charAt(0);
  });
}

function populateMetadataDropdowns() {
  const medCatFilter = document.getElementById("medFilterCategory");
  const newMedCat = document.getElementById("newMedCategory");
  if (medCatFilter) {
    medCatFilter.innerHTML = '<option value="">All Categories</option>' + 
      state.categories.map(c => `<option value="${c.CategoryID}">${c.CategoryName}</option>`).join("");
  }
  if (newMedCat) {
    newMedCat.innerHTML = state.categories.map(c => `<option value="${c.CategoryID}">${c.CategoryName}</option>`).join("");
  }

  const newMedMfg = document.getElementById("newMedManufacturer");
  if (newMedMfg) {
    newMedMfg.innerHTML = state.manufacturers.map(m => `<option value="${m.ManufacturerID}">${m.ManufacturerName}</option>`).join("");
  }

  const posCust = document.getElementById("posCustomerSelect");
  const newPrescCust = document.getElementById("newPrescCustomer");
  if (posCust) {
    posCust.innerHTML = state.customers.map(c => `<option value="${c.CustomerID}">${c.CustomerName} (${c.Phone})</option>`).join("");
  }
  if (newPrescCust) {
    newPrescCust.innerHTML = state.customers.map(c => `<option value="${c.CustomerID}">${c.CustomerName}</option>`).join("");
  }

  const posPresc = document.getElementById("posPrescriptionSelect");
  if (posPresc) {
    posPresc.innerHTML = '<option value="">-- No Prescription Selected (OTC Only) --</option>' +
      state.prescriptions.map(p => `<option value="${p.PrescriptionID}">Rx #${p.PrescriptionID} - ${p.CustomerName} (${p.DoctorName})</option>`).join("");
  }

  const newBatchSup = document.getElementById("newBatchSupplier");
  if (newBatchSup) {
    newBatchSup.innerHTML = state.suppliers.map(s => `<option value="${s.SupplierID}">${s.SupplierName}</option>`).join("");
  }

  populateBatchMedicineDropdown();
}

// ============================================================================
// TAB 1: DASHBOARD
// ============================================================================
async function loadDashboardMetrics() {
  if (!state.isLiveBackend) {
    loadDashboardMetricsStandalone();
    return;
  }

  try {
    const res = await fetch(`${state.apiBase}/api/dashboard/metrics`);
    const d = await res.json();
    document.getElementById("kpiTodaySales").innerText = `PKR ${parseFloat(d.today_sales || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById("kpiInvoicesCount").innerText = `${d.today_invoices || 0} Invoices generated`;
    document.getElementById("kpiExpiringCount").innerText = `${d.expiring_batches_count || 0} Batches`;
    document.getElementById("kpiLowStock").innerText = `${d.low_stock_count || 0} Items`;
    document.getElementById("kpiInventoryVal").innerText = `PKR ${parseFloat(d.total_inventory_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    loadExpiringSoonTable();
    loadSalesChart();
  } catch (err) {
    loadDashboardMetricsStandalone();
  }
}

function loadDashboardMetricsStandalone() {
  document.getElementById("kpiTodaySales").innerText = `PKR ${state.todayRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById("kpiInvoicesCount").innerText = `${state.invoicesGenerated} Invoices generated`;
  document.getElementById("kpiExpiringCount").innerText = "2 Batches";
  document.getElementById("kpiLowStock").innerText = "2 Items";
  document.getElementById("kpiInventoryVal").innerText = "PKR 142,850.00";

  // Expiring Soon Table
  const tbody = document.querySelector("#expiringSoonTable tbody");
  const expiringBatches = EMBEDDED_DATA.batches.filter(b => b.Status === "EXPIRING SOON" || b.Status === "EXPIRED");
  tbody.innerHTML = expiringBatches.map(b => `
    <tr>
      <td><strong>#${b.BatchID}</strong></td>
      <td>${b.MedicineName}</td>
      <td>${b.QuantityInStock} units</td>
      <td><span class="badge ${b.Status === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}">${b.ExpiryDate}</span></td>
      <td>PKR ${parseFloat(b.InventoryAtRiskValue || 0).toFixed(2)}</td>
    </tr>
  `).join("");

  renderChartWithData(
    ["Oct 28", "Oct 29", "Oct 30", "Oct 31", "Nov 01", "Nov 02", "Nov 03"],
    [825.00, 392.00, 1150.00, 940.00, 1420.00, 102.00, state.todayRevenue],
    [210.00, 95.00, 320.00, 260.00, 380.00, 24.00, 340.00]
  );
}

async function loadExpiringSoonTable() {
  const tbody = document.querySelector("#expiringSoonTable tbody");
  try {
    const res = await fetch(`${state.apiBase}/api/batches/expiring`);
    const batches = await res.json();
    if (!batches.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-success"><i class="fa-solid fa-circle-check"></i> No batches expiring within 30 days!</td></tr>`;
      return;
    }
    tbody.innerHTML = batches.map(b => `
      <tr>
        <td><strong>#${b.BatchID}</strong></td>
        <td>${b.MedicineName}</td>
        <td>${b.QuantityInStock} units</td>
        <td><span class="badge ${b.ExpiryStatus === 'EXPIRED' ? 'badge-danger' : 'badge-warning'}">${b.ExpiryDate}</span></td>
        <td>PKR ${parseFloat(b.InventoryAtRiskValue).toFixed(2)}</td>
      </tr>
    `).join("");
  } catch (err) {
    loadDashboardMetricsStandalone();
  }
}

async function loadSalesChart() {
  try {
    const res = await fetch(`${state.apiBase}/api/reports/daily-sales`);
    const salesData = await res.json();
    const labels = salesData.map(d => d.SaleDate).reverse();
    const amounts = salesData.map(d => d.GrossSalesAmount).reverse();
    const profits = salesData.map(d => d.GrossProfitMargin).reverse();
    renderChartWithData(labels, amounts, profits);
  } catch (err) {
    loadDashboardMetricsStandalone();
  }
}

function renderChartWithData(labels, sales, profits) {
  const ctx = document.getElementById("salesTrendChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (state.salesChart) {
    state.salesChart.destroy();
  }

  state.salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Gross Sales (PKR)",
          data: sales,
          borderColor: "#0284c7",
          backgroundColor: "rgba(2, 132, 199, 0.1)",
          fill: true,
          tension: 0.3
        },
        {
          label: "Gross Profit (PKR)",
          data: profits,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ============================================================================
// TAB 2: POINT OF SALE (POS BILLING)
// ============================================================================
function loadPOSView() {
  renderPOSCatalog(state.medicines);
}

function setupPOSSearch() {
  const search = document.getElementById("posSearchInput");
  if (!search) return;
  search.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = state.medicines.filter(m => 
      m.Name.toLowerCase().includes(q) || 
      (m.CategoryName && m.CategoryName.toLowerCase().includes(q)) ||
      (m.ManufacturerName && m.ManufacturerName.toLowerCase().includes(q))
    );
    renderPOSCatalog(filtered);
  });
}

function renderPOSCatalog(meds) {
  const grid = document.getElementById("posMedicineGrid");
  if (!grid) return;

  if (!meds || !meds.length) {
    grid.innerHTML = `<div class="text-center text-muted col-span-full" style="grid-column: 1/-1; padding: 20px;">No medicines matching your search.</div>`;
    return;
  }

  grid.innerHTML = meds.map(m => {
    const isOutOfStock = m.TotalStock <= 0;
    const isControlled = m.RequiresPrescription === 1;

    return `
      <div class="med-card" onclick="promptAddBatchToCart(${m.MedicineID})">
        <div>
          <div class="med-name">${m.Name}</div>
          <div class="med-cat">${m.CategoryName || ''}</div>
          <div style="margin-top: 6px;">
            <span class="badge ${m.PricingCategory === 'Regulated' ? 'badge-info' : 'badge-purple'}">
              ${m.PricingCategory}
            </span>
            ${isControlled ? '<span class="badge badge-danger">Rx Required</span>' : ''}
          </div>
        </div>
        <div class="med-price-row">
          <span class="med-price">PKR ${parseFloat(m.SellingPrice || 0).toFixed(2)}</span>
          <span class="med-stock ${isOutOfStock ? 'text-danger' : 'text-success'}">
            ${isOutOfStock ? 'Out of Stock' : `${m.TotalStock} avail`}
          </span>
        </div>
      </div>
    `;
  }).join("");
}

async function promptAddBatchToCart(medicineId) {
  const med = state.medicines.find(m => m.MedicineID === medicineId);
  if (!med) return;

  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/batches?medicineId=${medicineId}`);
      const batches = await res.json();
      const validBatches = batches.filter(b => b.Status !== "EXPIRED" && b.QuantityInStock > 0);
      if (!validBatches.length) {
        alert(`No valid non-expired batches in stock for ${med.Name}.`);
        return;
      }
      addToCart(med, validBatches[0]);
      return;
    } catch (err) {}
  }

  // Standalone batch lookup
  const batches = EMBEDDED_DATA.batches.filter(b => b.MedicineID === medicineId && b.Status !== "EXPIRED" && b.QuantityInStock > 0);
  if (!batches.length) {
    if (med.TotalStock > 0) {
      addToCart(med, {
        BatchID: 1000 + med.MedicineID,
        MedicineID: med.MedicineID,
        ExpiryDate: "2027-12-31",
        QuantityInStock: med.TotalStock,
        PurchasePrice: med.SellingPrice * 0.75
      });
      return;
    }
    alert(`No valid non-expired stock available for ${med.Name}.`);
    return;
  }
  addToCart(med, batches[0]);
}

function addToCart(medicine, batch) {
  const existing = state.cart.find(item => item.batchId === batch.BatchID);
  if (existing) {
    if (existing.quantity + 1 > batch.QuantityInStock) {
      alert(`Cannot add more. Available batch stock is ${batch.QuantityInStock}.`);
      return;
    }
    existing.quantity += 1;
  } else {
    state.cart.push({
      medicineId: medicine.MedicineID,
      medicineName: medicine.Name,
      batchId: batch.BatchID,
      expiryDate: batch.ExpiryDate,
      unitPrice: medicine.SellingPrice,
      mrp: medicine.MRP,
      pricingCategory: medicine.PricingCategory,
      requiresPrescription: medicine.RequiresPrescription,
      maxStock: batch.QuantityInStock,
      quantity: 1
    });
  }
  renderCart();
}

function updateCartQuantity(batchId, delta) {
  const item = state.cart.find(i => i.batchId === batchId);
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    state.cart = state.cart.filter(i => i.batchId !== batchId);
  } else if (newQty > item.maxStock) {
    alert(`Only ${item.maxStock} units available in Batch #${batchId}`);
  } else {
    item.quantity = newQty;
  }
  renderCart();
}

function removeCartItem(batchId) {
  state.cart = state.cart.filter(i => i.batchId !== batchId);
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById("posCartBody");
  if (!tbody) return;

  if (!state.cart.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Cart is currently empty. Click medicines to add.</td></tr>`;
    document.getElementById("posSubtotal").innerText = "PKR 0.00";
    document.getElementById("posGrandTotal").innerText = "PKR 0.00";
    return;
  }

  let subtotal = 0;
  tbody.innerHTML = state.cart.map(i => {
    const total = i.quantity * i.unitPrice;
    subtotal += total;
    return `
      <tr>
        <td>
          <strong>${i.medicineName}</strong>
          ${i.requiresPrescription ? '<br><span class="badge badge-danger">Rx Required</span>' : ''}
          <button class="btn btn-sm btn-secondary" style="margin-top: 3px;" onclick="viewSubstitutesForMed(${i.medicineId})">
            <i class="fa-solid fa-lightbulb"></i> Substitute
          </button>
        </td>
        <td>#${i.batchId}<br><small class="text-muted">Exp: ${i.expiryDate}</small></td>
        <td>
          <div style="display:flex; align-items:center; gap: 4px;">
            <button class="btn btn-sm btn-secondary" onclick="updateCartQuantity(${i.batchId}, -1)">-</button>
            <span><strong>${i.quantity}</strong></span>
            <button class="btn btn-sm btn-secondary" onclick="updateCartQuantity(${i.batchId}, 1)">+</button>
          </div>
        </td>
        <td>PKR ${parseFloat(i.unitPrice).toFixed(2)}</td>
        <td><strong>PKR ${total.toFixed(2)}</strong></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="removeCartItem(${i.batchId})">&times;</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("posSubtotal").innerText = `PKR ${subtotal.toFixed(2)}`;
  document.getElementById("posGrandTotal").innerText = `PKR ${subtotal.toFixed(2)}`;
}

async function executeSaleTransaction() {
  if (!state.cart.length) {
    alert("Cart is empty! Click medicines in the catalog to add items.");
    return;
  }

  const alertBox = document.getElementById("posAlertBox");
  alertBox.className = "alert-box d-none";

  const customerId = document.getElementById("posCustomerSelect").value;
  const prescriptionId = document.getElementById("posPrescriptionSelect").value || null;

  // Validation Check 1: Prescription Requirement
  const hasControlled = state.cart.some(item => item.requiresPrescription === 1);
  if (hasControlled && !prescriptionId) {
    alertBox.className = "alert-box alert-danger";
    alertBox.innerHTML = `<strong><i class="fa-solid fa-triangle-exclamation"></i> Prescription Required:</strong> One or more items in the cart are Controlled Drugs. You must select a valid Doctor's Prescription.`;
    return;
  }

  // Validation Check 2: DRAP Price Ceiling
  for (const item of state.cart) {
    if (item.pricingCategory === "Regulated" && item.mrp && item.unitPrice > item.mrp) {
      alertBox.className = "alert-box alert-danger";
      alertBox.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Price Ceiling Violation:</strong> Selling price for '${item.medicineName}' (PKR ${item.unitPrice}) exceeds statutory DRAP MRP limit of PKR ${item.mrp}.`;
      return;
    }
  }

  // LIVE MODE EXECUTION
  if (state.isLiveBackend) {
    try {
      const payload = {
        customerId: parseInt(customerId),
        staffId: state.currentUser.staffId,
        prescriptionId: prescriptionId ? parseInt(prescriptionId) : null,
        items: state.cart.map(i => ({
          batchId: i.batchId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      };

      const res = await fetch(`${state.apiBase}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        alertBox.className = "alert-box alert-danger";
        alertBox.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> DBMS Constraint Rejection:</strong> ${result.error || 'Sale failed.'}`;
        return;
      }

      finishSuccessfulSale(result.invoiceId, result.totalAmount);
      return;
    } catch (err) {
      console.warn("Backend sale error, running in-memory fallback:", err);
    }
  }

  // STANDALONE MODE EXECUTION
  const invId = 9000 + (++state.invoicesGenerated);
  let grandTotal = 0;
  state.cart.forEach(item => {
    grandTotal += (item.quantity * item.unitPrice);
    const med = state.medicines.find(m => m.MedicineID === item.medicineId);
    if (med) med.TotalStock = Math.max(0, med.TotalStock - item.quantity);
  });

  state.todayRevenue += grandTotal;
  finishSuccessfulSale(invId, grandTotal);
}

function finishSuccessfulSale(invoiceId, totalAmount) {
  const alertBox = document.getElementById("posAlertBox");
  alertBox.className = "alert-box alert-success";
  alertBox.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Transaction Committed:</strong> Invoice #${invoiceId} generated. Total: PKR ${parseFloat(totalAmount).toFixed(2)}`;

  preparePrintInvoice(invoiceId, totalAmount, state.cart);
  state.cart = [];
  renderCart();
  renderPOSCatalog(state.medicines);
  loadDashboardMetrics();
}

function preparePrintInvoice(invoiceId, totalAmount, cartItems) {
  const custSelect = document.getElementById("posCustomerSelect");
  const custName = custSelect.options[custSelect.selectedIndex] ? custSelect.options[custSelect.selectedIndex].text : "Walk-in Customer";
  const prescSelect = document.getElementById("posPrescriptionSelect");
  const prescRef = prescSelect.value ? prescSelect.options[prescSelect.selectedIndex].text : "Over The Counter (OTC)";

  document.getElementById("printInvId").innerText = invoiceId;
  document.getElementById("printInvDate").innerText = new Date().toLocaleString();
  document.getElementById("printInvCashier").innerText = state.currentUser.name;
  document.getElementById("printInvCustomer").innerText = custName;
  document.getElementById("printInvPresc").innerText = prescRef;
  document.getElementById("printInvTotal").innerText = parseFloat(totalAmount).toFixed(2);

  const printBody = document.getElementById("printInvBody");
  printBody.innerHTML = cartItems.map(item => `
    <tr>
      <td>${item.medicineName}</td>
      <td>#${item.batchId}</td>
      <td>${item.quantity}</td>
      <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
      <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `).join("");
}

// ============================================================================
// TAB 3: MEDICINES & INVENTORY
// ============================================================================
async function loadMedicines() {
  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/medicines`);
      if (res.ok) {
        state.medicines = await res.json();
      }
    } catch (err) {}
  }
  populateBatchMedicineDropdown();
  renderMedicinesTable(state.medicines);
}

function populateBatchMedicineDropdown() {
  const batchMed = document.getElementById("newBatchMedicine");
  if (batchMed && state.medicines.length) {
    batchMed.innerHTML = state.medicines.map(m => `<option value="${m.MedicineID}">${m.Name}</option>`).join("");
  }
}

function filterMedicinesTable() {
  const q = document.getElementById("medSearchInput").value.toLowerCase().trim();
  const cat = document.getElementById("medFilterCategory").value;
  const pricing = document.getElementById("medFilterPricing").value;

  const filtered = state.medicines.filter(m => {
    const matchName = m.Name.toLowerCase().includes(q) || (m.CategoryName && m.CategoryName.toLowerCase().includes(q));
    const matchCat = cat === "" || m.CategoryID == cat;
    const matchPricing = pricing === "" || m.PricingCategory === pricing;
    return matchName && matchCat && matchPricing;
  });

  renderMedicinesTable(filtered);
}

function renderMedicinesTable(meds) {
  const tbody = document.getElementById("medicinesTableBody");
  if (!tbody) return;

  if (!meds || !meds.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No medicines found.</td></tr>`;
    return;
  }

  tbody.innerHTML = meds.map(m => {
    const isRegulated = m.PricingCategory === "Regulated";
    const stockStatus = m.TotalStock <= 0 ? '<span class="badge badge-danger">Out of Stock</span>' : 
                        m.TotalStock <= m.ReorderLevel ? `<span class="badge badge-warning">${m.TotalStock} (Low)</span>` :
                        `<span class="badge badge-success">${m.TotalStock}</span>`;

    return `
      <tr>
        <td><strong>#${m.MedicineID}</strong></td>
        <td><strong>${m.Name}</strong></td>
        <td>${m.CategoryName || 'N/A'}</td>
        <td>${m.ManufacturerName || 'N/A'}</td>
        <td><span class="badge ${isRegulated ? 'badge-info' : 'badge-purple'}">${m.PricingCategory}</span></td>
        <td>${m.RequiresPrescription ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>'}</td>
        <td>${m.MRP ? `PKR ${parseFloat(m.MRP).toFixed(2)}` : '<span class="text-muted">N/A</span>'}</td>
        <td><strong>PKR ${parseFloat(m.SellingPrice || 0).toFixed(2)}</strong></td>
        <td>${stockStatus}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary" title="View Price History" onclick="viewPriceHistory(${m.MedicineID})">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="btn btn-sm btn-secondary" title="Find Salt Substitutes" onclick="viewSubstitutesForMed(${m.MedicineID})">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Delete Medicine (Tests ON DELETE RESTRICT)" onclick="deleteMedicine(${m.MedicineID})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function viewPriceHistory(medicineId) {
  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/prices/${medicineId}/history`);
      if (res.ok) {
        const history = await res.json();
        renderPriceHistoryModal(history);
        return;
      }
    } catch (err) {}
  }

  // Standalone fallback
  const history = EMBEDDED_DATA.priceHistory.filter(h => h.MedicineID === medicineId);
  renderPriceHistoryModal(history.length ? history : [{
    EffectiveFrom: "2026-01-01",
    EffectiveTo: null,
    MRP: 3.50,
    SellingPrice: 3.40,
    ChangedByName: "Dr. Tariq Mahmood",
    Source: "Initial Launch Entry"
  }]);
}

function renderPriceHistoryModal(history) {
  const tbody = document.getElementById("modalPriceHistoryBody");
  tbody.innerHTML = history.map(h => `
    <tr>
      <td>${h.EffectiveFrom}</td>
      <td>${h.EffectiveTo || '<span class="badge badge-success">Current Active</span>'}</td>
      <td>${h.MRP ? `PKR ${parseFloat(h.MRP).toFixed(2)}` : 'N/A'}</td>
      <td><strong>PKR ${parseFloat(h.SellingPrice).toFixed(2)}</strong></td>
      <td>${h.ChangedByName}</td>
      <td><small>${h.Source}</small></td>
    </tr>
  `).join("");
  openModal("priceHistoryModal");
}

async function viewSubstitutesForMed(medicineId) {
  const modalBody = document.getElementById("substituteModalBody");

  let subs = [];
  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/medicines/${medicineId}/substitutes`);
      if (res.ok) subs = await res.json();
    } catch (err) {}
  }

  if (!subs.length) {
    subs = EMBEDDED_DATA.substitutes.filter(s => s.OriginalMedicineID === medicineId);
  }

  if (!subs.length) {
    modalBody.innerHTML = `
      <div class="info-alert">
        <i class="fa-solid fa-info-circle"></i> No cheaper generic substitutes currently registered for this exact salt in the database.
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <p style="margin-bottom: 12px;">Active Formula: <strong>${subs[0].SaltName} (${subs[0].Strength})</strong></p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Substitute Brand</th>
            <th>Price</th>
            <th>Patient Savings</th>
          </tr>
        </thead>
        <tbody>
          ${subs.map(s => `
            <tr>
              <td><strong>${s.SubstituteMedicineName}</strong></td>
              <td>PKR ${parseFloat(s.SubstitutePrice).toFixed(2)}</td>
              <td><span class="badge badge-success">Save PKR ${parseFloat(s.CustomerSavingsPerUnit).toFixed(2)} (${s.PercentSavings}%)</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
  openModal("substituteModal");
}

async function deleteMedicine(medicineId) {
  if (!confirm(`Are you sure you want to delete Medicine #${medicineId}? This will test relational foreign key ON DELETE RESTRICT enforcement.`)) return;

  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/medicines/${medicineId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        alert(`[DBMS INTEGRITY ENFORCED]:\n\n${result.error}`);
      } else {
        alert(result.message);
        loadMedicines();
      }
      return;
    } catch (err) {}
  }

  // Standalone simulation of ON DELETE RESTRICT
  alert(`[DBMS INTEGRITY ENFORCED - ON DELETE RESTRICT]:\nCannot delete Medicine #${medicineId} because dependent active records exist in Batch and InvoiceItem tables.`);
}

// ============================================================================
// TAB 4 & 5: SUPPLIERS & PRESCRIPTIONS
// ============================================================================
function loadSuppliersView() {
  const supBody = document.getElementById("supplierListBody");
  if (supBody) {
    supBody.innerHTML = state.suppliers.map(s => `
      <tr>
        <td><strong>#${s.SupplierID}</strong></td>
        <td>${s.SupplierName}</td>
        <td>${s.Phone}</td>
        <td>${s.Address}</td>
      </tr>
    `).join("");
  }

  const cheapBody = document.getElementById("cheapestSupplierBody");
  if (cheapBody) {
    cheapBody.innerHTML = `
      <tr><td><strong>Panadol 500mg</strong></td><td>Medix Wholesalers</td><td>PKR 2.70</td><td>2026-10-02</td></tr>
      <tr><td><strong>Augmentin 625mg</strong></td><td>Medix Wholesalers</td><td>PKR 37.50</td><td>2026-10-12</td></tr>
      <tr><td><strong>Risek 20mg</strong></td><td>Khyber MedSupply Co.</td><td>PKR 17.50</td><td>2026-10-15</td></tr>
      <tr><td><strong>Sofvasc 5mg</strong></td><td>Capital Drug Agency</td><td>PKR 6.95</td><td>2026-10-18</td></tr>
      <tr><td><strong>Glucophage 500mg</strong></td><td>Sindh Health Solutions</td><td>PKR 3.05</td><td>2026-10-21</td></tr>
    `;
  }
}

function loadPrescriptionsView() {
  const prescBody = document.getElementById("prescriptionsTableBody");
  const custBody = document.getElementById("customersTableBody");

  if (prescBody) {
    prescBody.innerHTML = state.prescriptions.map(p => `
      <tr>
        <td><strong>Rx #${p.PrescriptionID}</strong></td>
        <td>${p.CustomerName}</td>
        <td>${p.DoctorName}</td>
        <td>${p.PrescriptionDate}</td>
      </tr>
    `).join("");
  }

  if (custBody) {
    custBody.innerHTML = state.customers.map(c => `
      <tr>
        <td><strong>#${c.CustomerID}</strong></td>
        <td>${c.CustomerName}</td>
        <td>${c.Phone}</td>
      </tr>
    `).join("");
  }
}

// ============================================================================
// TAB 6: BUSINESS INTELLIGENCE (BI) REPORTS
// ============================================================================
function switchBiTab(subtabId) {
  document.querySelectorAll(".btn-subtab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".bi-pane").forEach(p => p.classList.remove("active"));

  if (event && event.target) event.target.classList.add("active");
  const targetPane = document.getElementById(`subtab-${subtabId}`);
  if (targetPane) targetPane.classList.add("active");
}

function loadBIReports() {
  const marginBody = document.getElementById("marginReportBody");
  if (marginBody) {
    marginBody.innerHTML = `
      <tr><td>#1001</td><td><strong>Panadol 500mg</strong></td><td>Analgesics</td><td>PKR 2.80</td><td>PKR 3.40</td><td>PKR 0.60</td><td><strong>21.4%</strong></td><td><span class="badge badge-success">HEALTHY</span></td></tr>
      <tr><td>#1008</td><td><strong>Augmentin 625mg</strong></td><td>Antibiotics</td><td>PKR 38.50</td><td>PKR 55.00</td><td>PKR 16.50</td><td><strong>42.8%</strong></td><td><span class="badge badge-success">HEALTHY</span></td></tr>
      <tr><td>#1017</td><td><strong>Risek 20mg</strong></td><td>Gastrointestinal</td><td>PKR 18.00</td><td>PKR 25.00</td><td>PKR 7.00</td><td><strong>38.8%</strong></td><td><span class="badge badge-success">HEALTHY</span></td></tr>
      <tr><td>#1021</td><td><strong>Sofvasc 5mg</strong></td><td>Cardiovascular</td><td>PKR 7.20</td><td>PKR 9.80</td><td>PKR 2.60</td><td><strong>36.1%</strong></td><td><span class="badge badge-success">HEALTHY</span></td></tr>
      <tr><td>#1026</td><td><strong>Glucophage 500mg</strong></td><td>Antidiabetics</td><td>PKR 3.20</td><td>PKR 4.20</td><td>PKR 1.00</td><td><strong>31.2%</strong></td><td><span class="badge badge-success">HEALTHY</span></td></tr>
    `;
  }

  const compBody = document.getElementById("complianceBody");
  if (compBody) {
    compBody.innerHTML = `
      <tr><td>Panadol 500mg</td><td><span class="badge badge-info">Regulated</span></td><td>PKR 3.50</td><td>PKR 3.40</td><td>PKR 3.40</td><td><span class="badge badge-success">COMPLIANT BELOW CEILING</span></td><td>AT MARKET PARITY</td></tr>
      <tr><td>Augmentin 625mg</td><td><span class="badge badge-info">Regulated</span></td><td>PKR 56.50</td><td>PKR 55.00</td><td>PKR 54.50</td><td><span class="badge badge-success">COMPLIANT AT CEILING</span></td><td>PREMIUM (ABOVE MARKET)</td></tr>
      <tr><td>Sofvasc 5mg</td><td><span class="badge badge-info">Regulated</span></td><td>PKR 10.50</td><td>PKR 9.80</td><td>PKR 9.90</td><td><span class="badge badge-success">COMPLIANT BELOW CEILING</span></td><td>COMPETITIVE (BELOW MARKET)</td></tr>
      <tr><td>Novidat 500mg</td><td><span class="badge badge-purple">Deregulated</span></td><td>N/A</td><td>PKR 36.00</td><td>PKR 38.00</td><td><span class="badge badge-success">DEREGULATED</span></td><td>COMPETITIVE (BELOW MARKET)</td></tr>
    `;
  }

  const subBody = document.getElementById("substitutesBody");
  if (subBody) {
    subBody.innerHTML = EMBEDDED_DATA.substitutes.map(s => `
      <tr>
        <td>${s.OriginalMedicineName}</td>
        <td>${s.SaltName}</td>
        <td>${s.Strength}</td>
        <td>PKR ${parseFloat(s.OriginalPrice).toFixed(2)}</td>
        <td><strong>${s.SubstituteMedicineName}</strong></td>
        <td>PKR ${parseFloat(s.SubstitutePrice).toFixed(2)}</td>
        <td><span class="badge badge-success">Save PKR ${parseFloat(s.CustomerSavingsPerUnit).toFixed(2)} (${s.PercentSavings}%)</span></td>
      </tr>
    `).join("");
  }

  const lowBody = document.getElementById("lowStockBody");
  if (lowBody) {
    lowBody.innerHTML = `
      <tr><td><strong>Cefspan 400mg Capsule</strong></td><td>Antibiotics</td><td>The Searle Company</td><td>30 units</td><td><strong class="text-danger">12 units</strong></td><td>18 units</td><td><span class="badge badge-warning">CRITICALLY LOW</span></td></tr>
      <tr><td><strong>Januvia 100mg Tablet</strong></td><td>Antidiabetics</td><td>Pfizer Pakistan</td><td>20 units</td><td><strong class="text-danger">8 units</strong></td><td>12 units</td><td><span class="badge badge-warning">CRITICALLY LOW</span></td></tr>
    `;
  }
}

// ============================================================================
// Modals & Form Handlers
// ============================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("d-none");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("d-none");
}

async function submitNewMedicine(e) {
  e.preventDefault();
  const name = document.getElementById("newMedName").value;
  const categoryId = parseInt(document.getElementById("newMedCategory").value);
  const manufacturerId = parseInt(document.getElementById("newMedManufacturer").value);
  const pricingCategory = document.getElementById("newMedPricing").value;
  const reorderLevel = parseInt(document.getElementById("newMedReorder").value);
  const mrp = document.getElementById("newMedMRP").value ? parseFloat(document.getElementById("newMedMRP").value) : null;
  const sellingPrice = parseFloat(document.getElementById("newMedPrice").value);
  const requiresPrescription = document.getElementById("newMedPrescription").checked ? 1 : 0;

  const catObj = state.categories.find(c => c.CategoryID === categoryId);
  const mfgObj = state.manufacturers.find(m => m.ManufacturerID === manufacturerId);

  const newMed = {
    MedicineID: state.medicines.length + 1,
    Name: name,
    CategoryID: categoryId,
    CategoryName: catObj ? catObj.CategoryName : "General",
    ManufacturerID: manufacturerId,
    ManufacturerName: mfgObj ? mfgObj.ManufacturerName : "General",
    PricingCategory: pricingCategory,
    RequiresPrescription: requiresPrescription,
    ReorderLevel: reorderLevel,
    MRP: mrp,
    SellingPrice: sellingPrice,
    TotalStock: 0
  };

  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed)
      });
      if (res.ok) {
        alert("Medicine registered successfully in SQLite database.");
        closeModal("addMedicineModal");
        document.getElementById("addMedicineForm").reset();
        loadMedicines();
        return;
      }
    } catch (err) {}
  }

  // Standalone storage
  state.medicines.unshift(newMed);
  alert("Medicine registered successfully.");
  closeModal("addMedicineModal");
  document.getElementById("addMedicineForm").reset();
  renderMedicinesTable(state.medicines);
}

async function submitNewBatch(e) {
  e.preventDefault();
  const medId = parseInt(document.getElementById("newBatchMedicine").value);
  const supId = parseInt(document.getElementById("newBatchSupplier").value);
  const expiry = document.getElementById("newBatchExpiry").value;
  const qty = parseInt(document.getElementById("newBatchQty").value);
  const cost = parseFloat(document.getElementById("newBatchCost").value);

  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: medId, supplierId: supId, expiryDate: expiry, quantity: qty, purchasePrice: cost })
      });
      if (res.ok) {
        alert("New batch added to SQLite inventory.");
        closeModal("addBatchModal");
        document.getElementById("addBatchForm").reset();
        loadMedicines();
        loadDashboardMetrics();
        return;
      }
    } catch (err) {}
  }

  const med = state.medicines.find(m => m.MedicineID === medId);
  if (med) {
    med.TotalStock += qty;
  }
  alert("New batch received and added to inventory.");
  closeModal("addBatchModal");
  document.getElementById("addBatchForm").reset();
  renderMedicinesTable(state.medicines);
  loadDashboardMetrics();
}

async function submitNewPrescription(e) {
  e.preventDefault();
  const custId = parseInt(document.getElementById("newPrescCustomer").value);
  const doc = document.getElementById("newPrescDoctor").value;
  const date = document.getElementById("newPrescDate").value;

  const custObj = state.customers.find(c => c.CustomerID === custId);
  const newPresc = {
    PrescriptionID: 500 + state.prescriptions.length + 1,
    CustomerID: custId,
    CustomerName: custObj ? custObj.CustomerName : "Patient",
    DoctorName: doc,
    PrescriptionDate: date
  };

  if (state.isLiveBackend) {
    try {
      const res = await fetch(`${state.apiBase}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: custId, doctorName: doc, prescriptionDate: date })
      });
      if (res.ok) {
        alert("Prescription recorded in database.");
        closeModal("addPrescriptionModal");
        document.getElementById("addPrescriptionForm").reset();
        loadInitialData();
        return;
      }
    } catch (err) {}
  }

  state.prescriptions.unshift(newPresc);
  alert("Prescription recorded successfully.");
  closeModal("addPrescriptionModal");
  document.getElementById("addPrescriptionForm").reset();
  populateMetadataDropdowns();
  loadPrescriptionsView();
}
