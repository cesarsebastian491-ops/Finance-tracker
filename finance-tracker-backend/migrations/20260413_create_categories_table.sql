CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('income','expense') NOT NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_categories_type_name (type, name)
);

INSERT INTO categories (name, type, isActive)
VALUES
  ('Food', 'expense', 1),
  ('Groceries', 'expense', 1),
  ('Transport', 'expense', 1),
  ('Shopping', 'expense', 1),
  ('Bills', 'expense', 1),
  ('Entertainment', 'expense', 1),
  ('Others', 'expense', 1),
  ('Salary', 'income', 1),
  ('Freelance', 'income', 1),
  ('Business', 'income', 1),
  ('Investment', 'income', 1),
  ('Rental', 'income', 1),
  ('Bonus', 'income', 1),
  ('Gift', 'income', 1),
  ('Refund', 'income', 1),
  ('Other', 'income', 1)
ON DUPLICATE KEY UPDATE isActive = VALUES(isActive);
