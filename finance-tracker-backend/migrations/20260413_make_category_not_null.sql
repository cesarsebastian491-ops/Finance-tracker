UPDATE transactions SET category = 'Other' WHERE category IS NULL OR category = '';
ALTER TABLE transactions MODIFY category varchar(255) NOT NULL DEFAULT 'Other';
