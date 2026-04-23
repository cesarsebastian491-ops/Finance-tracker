-- Add recurring fields to transactions table if not present
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS isRecurring TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recurringType ENUM('daily','weekly','monthly','yearly') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurringEndDate DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lastGenerated DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS nextDueDate DATE DEFAULT NULL;
