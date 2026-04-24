ALTER TABLE transactions
ADD COLUMN isRecurring TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN recurringType ENUM('daily','weekly','monthly','yearly') DEFAULT NULL,
ADD COLUMN recurringEndDate DATE DEFAULT NULL,
ADD COLUMN lastGenerated DATE DEFAULT NULL,
ADD COLUMN nextDueDate DATE DEFAULT NULL;
