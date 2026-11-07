-- ============================================================================
-- Pharmaceutical Management System (PMS)
-- Script 05: Triggers and Stored Procedures / Transaction Logic
-- Includes ANSI/PostgreSQL/MySQL specifications and portable SQLite definitions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER 1: Expiry Guard Trigger
-- Blocks sale of a batch if its ExpiryDate has already passed at the time of sale
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_block_expired_batch_sale;
CREATE TRIGGER trg_block_expired_batch_sale
BEFORE INSERT ON InvoiceItem
FOR EACH ROW
WHEN (SELECT ExpiryDate FROM Batch WHERE BatchID = NEW.BatchID) < DATE('now')
BEGIN
    SELECT RAISE(ABORT, 'TRANSACTION REJECTED [Expiry Guard]: Cannot sell from an expired batch. Batch is past its expiry date.');
END;

-- ----------------------------------------------------------------------------
-- TRIGGER 2: Price Ceiling Guard Trigger (DRAP MRP Compliance)
-- On insert into InvoiceItem, reject if the medicine is 'Regulated' and 
-- UnitPriceAtSale exceeds the current active Maximum Retail Price (MRP).
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_enforce_price_ceiling;
CREATE TRIGGER trg_enforce_price_ceiling
BEFORE INSERT ON InvoiceItem
FOR EACH ROW
WHEN EXISTS (
    SELECT 1 
    FROM Batch b
    JOIN Medicine m ON b.MedicineID = m.MedicineID
    JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL
    WHERE b.BatchID = NEW.BatchID
      AND m.PricingCategory = 'Regulated'
      AND ph.MRP IS NOT NULL
      AND NEW.UnitPriceAtSale > ph.MRP
)
BEGIN
    SELECT RAISE(ABORT, 'TRANSACTION REJECTED [DRAP Price Ceiling]: Sale price exceeds the Government/DRAP notified Maximum Retail Price (MRP).');
END;

-- ----------------------------------------------------------------------------
-- TRIGGER 3: Stock Deduction and Non-Negative Inventory Trigger
-- On insert into InvoiceItem:
-- 1. Verifies that available QuantityInStock >= requested quantity.
-- 2. Decrements QuantityInStock in Batch table.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_and_deduct_stock;
CREATE TRIGGER trg_validate_and_deduct_stock
BEFORE INSERT ON InvoiceItem
FOR EACH ROW
WHEN (SELECT QuantityInStock FROM Batch WHERE BatchID = NEW.BatchID) < NEW.Quantity
BEGIN
    SELECT RAISE(ABORT, 'TRANSACTION REJECTED [Insufficient Stock]: Requested quantity exceeds available batch quantity. Negative stock prevented.');
END;

DROP TRIGGER IF EXISTS trg_deduct_batch_stock_after_sale;
CREATE TRIGGER trg_deduct_batch_stock_after_sale
AFTER INSERT ON InvoiceItem
FOR EACH ROW
BEGIN
    UPDATE Batch 
    SET QuantityInStock = QuantityInStock - NEW.Quantity
    WHERE BatchID = NEW.BatchID;
END;

-- ----------------------------------------------------------------------------
-- TRIGGER 4: Price History Temporal Lifecycle Trigger
-- When a new price record is created for a medicine, automatically close
-- the previous active PriceHistory record by setting EffectiveTo = NEW.EffectiveFrom
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_price_history_versioning;
CREATE TRIGGER trg_price_history_versioning
BEFORE INSERT ON PriceHistory
FOR EACH ROW
BEGIN
    UPDATE PriceHistory
    SET EffectiveTo = NEW.EffectiveFrom
    WHERE MedicineID = NEW.MedicineID
      AND EffectiveTo IS NULL
      AND PriceID <> NEW.PriceID;
END;


-- ============================================================================
-- STORED PROCEDURE / TRANSACTION SCRIPT: SellMedicine
-- Implements ACID atomic sale execution:
-- Validates:
--   1. Batch exists and is not expired
--   2. Sufficient stock is available
--   3. If medicine requires prescription, a valid PrescriptionID is provided
--   4. Selling price <= DRAP MRP (if Regulated)
--   5. Creates Invoice, creates InvoiceItem, decrements stock atomically
-- ============================================================================

-- MySQL / PostgreSQL Equivalent Stored Procedure Syntax for reference:
/*
DELIMITER //
CREATE PROCEDURE SellMedicine(
    IN p_CustomerID INT,
    IN p_StaffID INT,
    IN p_PrescriptionID INT,
    IN p_BatchID INT,
    IN p_Quantity INT,
    IN p_UnitPrice DECIMAL(10,2),
    OUT p_InvoiceID INT,
    OUT p_StatusMessage VARCHAR(255)
)
BEGIN
    DECLARE v_ExpiryDate DATE;
    DECLARE v_Stock INT;
    DECLARE v_MedID INT;
    DECLARE v_ReqPrescription INT;
    DECLARE v_PricingCategory VARCHAR(20);
    DECLARE v_MRP DECIMAL(10,2);

    -- Exit on error with rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_StatusMessage = 'FAILED: Rolled back due to error or integrity violation.';
    END;

    START TRANSACTION;

    SELECT b.ExpiryDate, b.QuantityInStock, b.MedicineID, m.RequiresPrescription, m.PricingCategory, ph.MRP
    INTO v_ExpiryDate, v_Stock, v_MedID, v_ReqPrescription, v_PricingCategory, v_MRP
    FROM Batch b
    JOIN Medicine m ON b.MedicineID = m.MedicineID
    LEFT JOIN PriceHistory ph ON m.MedicineID = ph.MedicineID AND ph.EffectiveTo IS NULL
    WHERE b.BatchID = p_BatchID;

    IF v_ExpiryDate < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Batch is expired!';
    END IF;

    IF v_Stock < p_Quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock!';
    END IF;

    IF v_ReqPrescription = 1 AND p_PrescriptionID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Prescription required for this controlled/scheduled medicine!';
    END IF;

    IF v_PricingCategory = 'Regulated' AND p_UnitPrice > v_MRP THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sale price exceeds DRAP MRP!';
    END IF;

    -- Create invoice header
    INSERT INTO Invoice (CustomerID, StaffID, PrescriptionID, InvoiceDate, TotalAmount)
    VALUES (p_CustomerID, p_StaffID, p_PrescriptionID, NOW(), p_Quantity * p_UnitPrice);
    SET p_InvoiceID = LAST_INSERT_ID();

    -- Create invoice line item (triggers will also double verify)
    INSERT INTO InvoiceItem (InvoiceID, BatchID, Quantity, UnitPriceAtSale)
    VALUES (p_InvoiceID, p_BatchID, p_Quantity, p_UnitPrice);

    COMMIT;
    SET p_StatusMessage = 'SUCCESS: Sale completed successfully.';
END //
DELIMITER ;
*/
