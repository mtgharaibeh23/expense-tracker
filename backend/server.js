require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const categories = ["Food", "Transport", "Bills", "Entertainment", "Other"];

// الأعمدة التي نريد إرجاعها للواجهة في كل طلب مصاريف.
const selectExpense = `
  SELECT e.id, e.title, e.amount::float8 AS amount, e.category,
         to_char(e.date, 'YYYY-MM-DD') AS date,
         e.is_necessary AS "isNecessary",
         e.worth_it AS "worthIt",
         e.felt_happy AS "feltHappy",
         CASE
           WHEN e.amount >= 15 THEN (e.amount * 2)::float8
           ELSE 0
         END AS "suggestedSaving",
         (w.id IS NOT NULL) AS "savedForWedding"
  FROM expenses e
  LEFT JOIN wedding_savings w ON w.expense_id = e.id
`;

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isInteger(id) && id <= 2147483647 ? id : null;
}

function isValidExpense(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const {
    title,
    amount,
    category,
    date,
    isNecessary,
    worthIt,
    feltHappy,
  } = data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100
  ) {
    return false;
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 99999999.99
  ) {
    return false;
  }

  // المبلغ بالدينار وبحد أقصى منزلتين عشريتين.
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    return false;
  }

  if (!categories.includes(category)) {
    return false;
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return false;
  }

  // الأسئلة اختيارية، وإذا أُرسلت يجب أن تكون true أو false.
  return [isNecessary, worthIt, feltHappy].every(
    (value) => value == null || typeof value === "boolean"
  );
}

async function findExpense(id) {
  const result = await pool.query(
    `${selectExpense} WHERE e.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

function databaseError(error, res) {
  console.error(error);
  return res.status(500).json({ message: "Database error" });
}

// 1. عرض كل المصاريف
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(
      `${selectExpense} ORDER BY e.id`
    );

    res.json(result.rows);
  } catch (error) {
    databaseError(error, res);
  }
});

// 2. عرض مصروف واحد
app.get("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const expense = await findExpense(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    databaseError(error, res);
  }
});

// 3. إضافة مصروف
app.post("/api/expenses", async (req, res) => {
  if (!isValidExpense(req.body)) {
    return res.status(400).json({ message: "Invalid expense data" });
  }

  const {
    title,
    amount,
    category,
    date,
    isNecessary,
    worthIt,
    feltHappy,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO expenses
       (title, amount, category, date, is_necessary, worth_it, felt_happy)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        title.trim(),
        amount,
        category,
        date,
        isNecessary ?? null,
        worthIt ?? null,
        feltHappy ?? null,
      ]
    );

    res.status(201).json(await findExpense(result.rows[0].id));
  } catch (error) {
    databaseError(error, res);
  }
});

// 4. تعديل مصروف
app.put("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (!isValidExpense(req.body)) {
    return res.status(400).json({ message: "Invalid expense data" });
  }

  const {
    title,
    amount,
    category,
    date,
    isNecessary,
    worthIt,
    feltHappy,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, date = $4,
           is_necessary = $5, worth_it = $6, felt_happy = $7
       WHERE id = $8
       RETURNING id`,
      [
        title.trim(),
        amount,
        category,
        date,
        isNecessary ?? null,
        worthIt ?? null,
        feltHappy ?? null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(await findExpense(id));
  } catch (error) {
    databaseError(error, res);
  }
});

// 5. حذف مصروف
app.delete("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted", id });
  } catch (error) {
    databaseError(error, res);
  }
});

const balanceSql = `
  SELECT COALESCE(
    SUM(
      CASE
        WHEN entry_type = 'deposit' THEN amount
        ELSE -amount
      END
    ), 0
  )::float8 AS total
  FROM wedding_savings
`;

// الرصيد وسجل الإيداعات والسحوبات
app.get("/api/wedding-savings", async (req, res) => {
  try {
    const entries = await pool.query(
      `SELECT id,
              expense_id AS "expenseId",
              amount::float8 AS amount,
              entry_type AS type,
              to_char(deposited_at, 'YYYY-MM-DD') AS date
       FROM wedding_savings
       ORDER BY id DESC`
    );

    const balance = await pool.query(balanceSql);

    res.json({
      total: balance.rows[0].total,
      entries: entries.rows,
    });
  } catch (error) {
    databaseError(error, res);
  }
});

function validJarAmount(amount) {
  return (
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= 99999999.99 &&
    Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001
  );
}

// إيداع مباشر أو سحب
app.post("/api/wedding-savings", async (req, res) => {
  const { type, amount } = req.body || {};

  if (
    !["deposit", "withdrawal"].includes(type) ||
    !validJarAmount(amount)
  ) {
    return res.status(400).json({ message: "Invalid savings data" });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(518493)");

    const balance = await client.query(balanceSql);

    if (
      type === "withdrawal" &&
      Math.round(balance.rows[0].total * 100) <
        Math.round(amount * 100)
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Insufficient savings balance",
      });
    }

    const result = await client.query(
      `INSERT INTO wedding_savings (entry_type, amount)
       VALUES ($1, $2)
       RETURNING id,
                 expense_id AS "expenseId",
                 amount::float8 AS amount,
                 entry_type AS type,
                 to_char(deposited_at, 'YYYY-MM-DD') AS date`,
      [type, amount]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    databaseError(error, res);
  } finally {
    if (client) client.release();
  }
});

// التراجع عن حركة سُجّلت بالخطأ
app.delete("/api/wedding-savings/:id", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({
      message: "Savings entry not found",
    });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(518493)");

    const found = await client.query(
      `SELECT id,
              amount::float8 AS amount,
              entry_type AS type
       FROM wedding_savings
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (found.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Savings entry not found",
      });
    }

    const entry = found.rows[0];

    if (entry.type === "deposit") {
      const balance = await client.query(balanceSql);

      if (
        Math.round(balance.rows[0].total * 100) <
          Math.round(entry.amount * 100)
      ) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "Cannot undo deposit after spending it",
        });
      }
    }

    await client.query(
      "DELETE FROM wedding_savings WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");
    res.json({ message: "Savings entry undone", id });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    databaseError(error, res);
  } finally {
    if (client) client.release();
  }
});

// إيداع ضعف مصروف قيمته 15 دينارًا أو أكثر بعد تأكيدك
app.post("/api/expenses/:id/wedding-savings", async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO wedding_savings (expense_id, amount)
       SELECT id, amount * 2
       FROM expenses
       WHERE id = $1 AND amount >= 15 AND amount <= 49999999.99
       ON CONFLICT (expense_id) DO NOTHING
       RETURNING id,
                 expense_id AS "expenseId",
                 amount::float8 AS amount,
                 entry_type AS type,
                 to_char(deposited_at, 'YYYY-MM-DD') AS date`,
      [id]
    );

    if (result.rowCount > 0) {
      return res.status(201).json(result.rows[0]);
    }

    const expense = await findExpense(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.amount < 15) {
      return res.status(400).json({
        message: "Expense must be at least 15 JOD",
      });
    }

    if (expense.amount > 49999999.99) {
      return res.status(400).json({
        message: "Saving exceeds the allowed amount",
      });
    }

    res.status(409).json({
      message: "Already saved for wedding",
    });
  } catch (error) {
    databaseError(error, res);
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});