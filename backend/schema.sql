-- Expense Tracker database setup
-- Safe to run again: existing expenses and savings are not deleted.

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL CHECK (btrim(title) <> ''),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(20) NOT NULL CHECK (
    category IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Other')
  ),
  date DATE NOT NULL,
  is_necessary BOOLEAN,
  worth_it BOOLEAN,
  felt_happy BOOLEAN
);

-- Add the personal questions if expenses was created using the starter schema.
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_necessary BOOLEAN;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS worth_it BOOLEAN;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS felt_happy BOOLEAN;

CREATE TABLE IF NOT EXISTS wedding_savings (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER UNIQUE REFERENCES expenses(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  deposited_at DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type VARCHAR(10) NOT NULL DEFAULT 'deposit'
);

-- Support databases where the savings table existed before withdrawals were added.
ALTER TABLE wedding_savings
  ADD COLUMN IF NOT EXISTS entry_type VARCHAR(10) NOT NULL DEFAULT 'deposit';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'wedding_savings'::regclass
      AND conname = 'wedding_savings_entry_type_check'
  ) THEN
    ALTER TABLE wedding_savings
      ADD CONSTRAINT wedding_savings_entry_type_check
      CHECK (entry_type IN ('deposit', 'withdrawal'));
  END IF;
END $$;

-- Add starter examples only when the expenses table is empty.
INSERT INTO expenses (title, amount, category, date)
SELECT sample.title, sample.amount, sample.category, sample.date
FROM (
  VALUES
    ('Lunch',            4.50,  'Food',          DATE '2026-01-15'),
    ('Bus ticket',       1.20,  'Transport',     DATE '2026-01-15'),
    ('Electricity bill', 32.00, 'Bills',         DATE '2026-01-18'),
    ('Cinema',           8.00,  'Entertainment', DATE '2026-01-20'),
    ('Notebook',         2.50,  'Other',         DATE '2026-01-22'),
    ('Groceries',        27.75, 'Food',          DATE '2026-02-02'),
    ('Taxi',             6.00,  'Transport',     DATE '2026-02-04'),
    ('Internet bill',    20.00, 'Bills',         DATE '2026-02-07')
) AS sample(title, amount, category, date)
WHERE NOT EXISTS (SELECT 1 FROM expenses);