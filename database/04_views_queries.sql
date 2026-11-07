-- ============================================================================
-- Pharmaceutical Management System (PMS)
-- Script 04: Views and Analytical Business Intelligence (BI) Queries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View 1: ExpiringSoon
-- Batches with positive stock expiring within the next 30 days (or already expired)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS ExpiringSoon;
CREATE VIEW ExpiringSoon AS
SELECT 
    b.BatchID,
    m.MedicineID,
    m.Name AS MedicineName,
    c.CategoryName,
    s.SupplierName,
    b.QuantityInStock,
    b.PurchasePrice,
    ROUND(b.QuantityInStock * b.PurchasePrice, 2) AS InventoryAtRiskValue,
    b.ExpiryDate,
    CAST(julianday(b.ExpiryDate) - julianday('now') AS INT) AS DaysUntilExpiry,
    CASE 
        WHEN b.ExpiryDate < DATE('now') THEN 'EXPIRED'
        WHEN julianday(b.ExpiryDate) - julianday('now') <= 30 THEN 'CRITICAL (<= 30 days)'
        ELSE 'NORMAL'
    END AS ExpiryStatus
FROM Batch b
JOIN Medicine m ON b.MedicineID = m.MedicineID
JOIN Category c ON m.CategoryID = c.CategoryID
JOIN Supplier s ON b.SupplierID = s.SupplierID
WHERE b.QuantityInStock > 0 
  AND b.ExpiryDate <= DATE('now', '+30 day');

-- ----------------------------------------------------------------------------
-- View 2: LowStock
-- Medicines whose current total physical stock across all non-expired batches is <= ReorderLevel
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS LowStock;
CREATE VIEW LowStock AS
SELECT 
    m.MedicineID,
    m.Name AS MedicineName,
    c.CategoryName,
    mf.ManufacturerName,
    m.ReorderLevel,
    COALESCE(SUM(CASE WHEN b.ExpiryDate > DATE('now') THEN b.QuantityInStock ELSE 0 END), 0) AS TotalValidStock,
    m.ReorderLevel - COALESCE(SUM(CASE WHEN b.ExpiryDate > DATE('now') THEN b.QuantityInStock ELSE 0 END), 0) AS ShortfallUnits,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN b.ExpiryDate > DATE('now') THEN b.QuantityInStock ELSE 0 END), 0) = 0 THEN 'OUT OF STOCK'
        WHEN COALESCE(SUM(CASE WHEN b.ExpiryDate > DATE('now') THEN b.QuantityInStock ELSE 0 END), 0) < (m.ReorderLevel * 0.5) THEN 'CRITICALLY LOW'
        ELSE 'LOW'
    END AS StockAlertLevel
FROM Medicine m
JOIN Category c ON m.CategoryID = c.CategoryID
JOIN Manufacturer mf ON m.ManufacturerID = mf.ManufacturerID
LEFT JOIN Batch b ON m.MedicineID = b.MedicineID
GROUP BY m.MedicineID, m.Name, c.CategoryName, mf.ManufacturerName, m.ReorderLevel
HAVING TotalValidStock <= m.ReorderLevel;

-- ----------------------------------------------------------------------------
-- View 3: DailySales
-- Daily revenue, transactions count, and units sold totals
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS DailySales;
CREATE VIEW DailySales AS
SELECT 
    DATE(i.InvoiceDate) AS SaleDate,
    COUNT(DISTINCT i.InvoiceID) AS TotalInvoices,
    SUM(ii.Quantity) AS TotalUnitsSold,
    ROUND(SUM(ii.Quantity * ii.UnitPriceAtSale), 2) AS GrossSalesAmount,
    ROUND(SUM(ii.Quantity * b.PurchasePrice), 2) AS CostOfGoodsSold,
    ROUND(SUM(ii.Quantity * (ii.UnitPriceAtSale - b.PurchasePrice)), 2) AS GrossProfitMargin
FROM Invoice i
JOIN InvoiceItem ii ON i.InvoiceID = ii.InvoiceID
JOIN Batch b ON ii.BatchID = b.BatchID
GROUP BY DATE(i.InvoiceDate);

-- ----------------------------------------------------------------------------
-- View 4: MarginReport
-- Selling price vs purchase price per medicine batch, with percentage profit margin
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS MarginReport;
CREATE VIEW MarginReport AS
SELECT 
    m.MedicineID,
    m.Name AS MedicineName,
    c.CategoryName,
    b.BatchID,
    b.PurchasePrice,
    ph.SellingPrice,
    ROUND(ph.SellingPrice - b.PurchasePrice, 2) AS ProfitPerUnit,
    ROUND(((ph.SellingPrice - b.PurchasePrice) / b.PurchasePrice) * 100.0, 2) AS MarginPercentage,
    CASE 
        WHEN ph.SellingPrice < b.PurchasePrice THEN 'LOSS ALERT'
        WHEN ((ph.SellingPrice - b.PurchasePrice) / b.PurchasePrice) < 0.10 THEN 'LOW MARGIN'
        ELSE 'HEALTHY'
    END AS MarginHealth
FROM Batch b
JOIN Medicine m ON b.MedicineID = m.MedicineID
JOIN Category c ON m.CategoryID = c.CategoryID
LEFT JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL;

-- ----------------------------------------------------------------------------
-- View 5: AboveMRP / BelowMarket (Price Compliance & Competitiveness)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS PriceComplianceAndCompetitiveness;
CREATE VIEW PriceComplianceAndCompetitiveness AS
SELECT 
    m.MedicineID,
    m.Name AS MedicineName,
    m.PricingCategory,
    ph.MRP AS CurrentMRP,
    ph.SellingPrice AS OurSellingPrice,
    mr.AvgMarketPrice,
    ROUND(ph.SellingPrice - ph.MRP, 2) AS VarianceFromMRP,
    ROUND(ph.SellingPrice - mr.AvgMarketPrice, 2) AS VarianceFromMarket,
    CASE 
        WHEN m.PricingCategory = 'Regulated' AND ph.MRP IS NOT NULL AND ph.SellingPrice > ph.MRP 
            THEN 'VIOLATION: ABOVE DRAP MRP'
        WHEN m.PricingCategory = 'Regulated' AND ph.SellingPrice = ph.MRP 
            THEN 'COMPLIANT AT CEILING'
        WHEN m.PricingCategory = 'Regulated' AND ph.SellingPrice < ph.MRP 
            THEN 'COMPLIANT BELOW CEILING (DISCOUNT)'
        ELSE 'DEREGULATED'
    END AS RegulatoryStatus,
    CASE
        WHEN mr.AvgMarketPrice IS NOT NULL AND ph.SellingPrice < mr.AvgMarketPrice 
            THEN 'COMPETITIVE (BELOW MARKET)'
        WHEN mr.AvgMarketPrice IS NOT NULL AND ph.SellingPrice > mr.AvgMarketPrice 
            THEN 'PREMIUM (ABOVE MARKET)'
        ELSE 'AT MARKET PARITY'
    END AS MarketPosition
FROM Medicine m
JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL
LEFT JOIN MarketReference mr ON m.MedicineID = mr.MedicineID;

-- ----------------------------------------------------------------------------
-- View 6: CheapestSupplier
-- Identifies the best quotation for every medicine among verified suppliers
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS CheapestSupplier;
CREATE VIEW CheapestSupplier AS
SELECT 
    sq.MedicineID,
    m.Name AS MedicineName,
    s.SupplierID,
    s.SupplierName,
    sq.QuotedPrice AS LowestQuote,
    sq.QuoteDate
FROM SupplierQuote sq
JOIN Medicine m ON sq.MedicineID = m.MedicineID
JOIN Supplier s ON sq.SupplierID = s.SupplierID
WHERE sq.QuotedPrice = (
    SELECT MIN(sq2.QuotedPrice)
    FROM SupplierQuote sq2
    WHERE sq2.MedicineID = sq.MedicineID
);

-- ----------------------------------------------------------------------------
-- View 7: SubstituteMedicines
-- Finds cheaper branded alternatives sharing the identical active chemical salt
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS SubstituteMedicines;
CREATE VIEW SubstituteMedicines AS
SELECT 
    orig_med.MedicineID AS OriginalMedicineID,
    orig_med.Name AS OriginalMedicineName,
    ph_orig.SellingPrice AS OriginalPrice,
    s.SaltName,
    ms_orig.Strength,
    sub_med.MedicineID AS SubstituteMedicineID,
    sub_med.Name AS SubstituteMedicineName,
    ph_sub.SellingPrice AS SubstitutePrice,
    ROUND(ph_orig.SellingPrice - ph_sub.SellingPrice, 2) AS CustomerSavingsPerUnit,
    ROUND(((ph_orig.SellingPrice - ph_sub.SellingPrice) / ph_orig.SellingPrice) * 100.0, 1) AS PercentSavings
FROM Medicine orig_med
JOIN MedicineSalt ms_orig ON orig_med.MedicineID = ms_orig.MedicineID
JOIN Salt s ON ms_orig.SaltID = s.SaltID
JOIN MedicineSalt ms_sub ON ms_orig.SaltID = ms_sub.SaltID AND ms_orig.Strength = ms_sub.Strength
JOIN Medicine sub_med ON ms_sub.MedicineID = sub_med.MedicineID AND orig_med.MedicineID <> sub_med.MedicineID
JOIN PriceHistory ph_orig ON orig_med.MedicineID = ph_orig.MedicineID AND ph_orig.EffectiveTo IS NULL
JOIN PriceHistory ph_sub ON sub_med.MedicineID = ph_sub.MedicineID AND ph_sub.EffectiveTo IS NULL
WHERE ph_sub.SellingPrice < ph_orig.SellingPrice;


-- ============================================================================
-- ADVANCED BUSINESS INTELLIGENCE (OLAP) QUERIES
-- Window functions (LAG), demand forecasts, smart reorders, expiry loss value
-- ============================================================================

-- Query BI-1: Price Trend Analysis using Window Function LAG()
-- Tracks how medicine selling prices and MRPs changed over time
-- Run as:
-- SELECT 
--     m.Name,
--     ph.PriceID,
--     ph.EffectiveFrom,
--     ph.EffectiveTo,
--     ph.SellingPrice,
--     LAG(ph.SellingPrice, 1) OVER (PARTITION BY ph.MedicineID ORDER BY ph.EffectiveFrom) AS PreviousPrice,
--     ROUND(ph.SellingPrice - LAG(ph.SellingPrice, 1) OVER (PARTITION BY ph.MedicineID ORDER BY ph.EffectiveFrom), 2) AS PriceDelta
-- FROM PriceHistory ph
-- JOIN Medicine m ON ph.MedicineID = m.MedicineID;

-- Query BI-2: Total Expiry Loss at Risk
-- Run as:
-- SELECT 
--     SUM(QuantityInStock * PurchasePrice) AS TotalValueAtRisk,
--     COUNT(DISTINCT BatchID) AS BatchesNearExpiryCount
-- FROM Batch
-- WHERE QuantityInStock > 0 AND ExpiryDate <= DATE('now', '+30 day');

-- Query BI-3: Smart Reorder Recommendation
-- Suggests order quantities considering current inventory, lead times and reorder thresholds
-- Run as:
-- SELECT 
--     m.MedicineID,
--     m.Name AS MedicineName,
--     c.CategoryName,
--     m.ReorderLevel,
--     COALESCE(SUM(b.QuantityInStock), 0) AS CurrentStock,
--     (m.ReorderLevel * 2) - COALESCE(SUM(b.QuantityInStock), 0) AS RecommendedOrderQuantity,
--     cs.SupplierName AS PreferredSupplier,
--     cs.LowestQuote AS QuotedUnitCost,
--     ROUND(((m.ReorderLevel * 2) - COALESCE(SUM(b.QuantityInStock), 0)) * cs.LowestQuote, 2) AS EstimatedOrderCost
-- FROM Medicine m
-- JOIN Category c ON m.CategoryID = c.CategoryID
-- LEFT JOIN Batch b ON m.MedicineID = b.MedicineID AND b.ExpiryDate > DATE('now')
-- LEFT JOIN CheapestSupplier cs ON m.MedicineID = cs.MedicineID
-- GROUP BY m.MedicineID
-- HAVING CurrentStock <= m.ReorderLevel;
