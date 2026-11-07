-- ============================================================================
-- Pharmaceutical Management System (PMS)
-- Script 02: Constraints and Performance Indexes
-- ============================================================================

-- Primary Indexing Strategy:
-- 1. Fast text search on Medicine Name
CREATE INDEX idx_medicine_name ON Medicine(Name);

-- 2. Fast filtering for batch expiry checks and FIFO inventory rotation
CREATE INDEX idx_batch_expiry ON Batch(ExpiryDate);
CREATE INDEX idx_batch_medicine ON Batch(MedicineID, QuantityInStock);

-- 3. Temporal index for price tracking and looking up current prices
CREATE INDEX idx_pricehistory_med_dates ON PriceHistory(MedicineID, EffectiveFrom, EffectiveTo);

-- 4. Fast reporting by date range on sales/invoices
CREATE INDEX idx_invoice_date ON Invoice(InvoiceDate);
CREATE INDEX idx_invoice_customer ON Invoice(CustomerID);

-- 5. Substitute discovery index: look up all medicines having a specific chemical salt
CREATE INDEX idx_medicinesalt_salt ON MedicineSalt(SaltID, MedicineID);

-- 6. Supplier quote optimization for cheapest supplier queries
CREATE INDEX idx_supplierquote_med_price ON SupplierQuote(MedicineID, QuotedPrice);

-- 7. Purchase order status and supplier lookup
CREATE INDEX idx_po_supplier_status ON PurchaseOrder(SupplierID, Status);
