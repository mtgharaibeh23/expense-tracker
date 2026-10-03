const API_BASE = "http://localhost:3000/api";
const $ = (id) => document.getElementById(id);

const translations = {
  ar: {
    pageTitle: "متتبع المصاريف",
    brand: "متتبع المصاريف 💰",
    hero: "لا تصرف يا محمود، أنت بدك تتزوج 💍",
    total: "إجمالي المصاريف",
    count: "عدد المصاريف",
    highest: "أعلى مصروف",
    addHeading: "أضف مصروفًا",
    expensesHeading: "المصاريف",
    savingsHeading: "حصالة الزواج 💍",
    savingsText: "المبلغ الذي أودعته فعلًا:",
    savingsInfo: "إذا صرفت 15 دينارًا أو أكثر، يظهر لك اقتراح أن تضع ضعفها في الحصالة.",
    title: "اسم المصروف",
    amount: "المبلغ بالدينار",
    date: "التاريخ",
    category: "التصنيف",
    necessary: "كان ضروري؟",
    worth: "كان يستاهل؟",
    happy: "كنت سعيد؟",
    saveExpense: "حفظ المصروف",
    saveEdit: "حفظ التعديل",
    cancel: "إلغاء",
    chooseCategory: "اختر التصنيف",
    allCategories: "كل التصنيفات",
    undecided: "لم أحدد",
    yes: "نعم",
    no: "لا",
    expense: "المصروف",
    amountShort: "المبلغ",
    actions: "إجراءات",
    editHeading: "تعديل المصروف",
    edit: "تعديل",
    remove: "حذف",
    depositedButton: "أودعت المبلغ",
    loading: "جارٍ التحميل...",
    empty: "لا توجد مصاريف في هذا التصنيف",
    necessaryShort: "ضروري",
    worthShort: "يستاهل",
    happyShort: "سعيد",
    deposited: "تم الإيداع في الحصالة",
    suggestion: "اقتراح للحصالة",
    deleteConfirm: "هل تريد حذف",
    depositConfirm1: "هل وضعت",
    depositConfirm2: "في حصالة الزواج فعلًا؟ الضغط على موافق يسجّل الإيداع.",
    loadError: "تعذر تحميل البيانات",
    actionError: "تعذر تنفيذ الطلب",
    added: "تمت إضافة المصروف",
    updated: "تم تعديل المصروف",
    deleted: "تم حذف المصروف",
    saved: "تم تسجيل الإيداع في حصالة الزواج",
    currency: "د.أ",
    categories: {
      Food: "طعام",
      Transport: "مواصلات",
      Bills: "فواتير",
      Entertainment: "ترفيه",
      Other: "أخرى",
    },
  },

  en: {
    pageTitle: "Expense Tracker",
    brand: "Expense Tracker 💰",
    hero: "Spend wisely, Mahmoud. You're saving for your wedding 💍",
    total: "Total expenses",
    count: "Number of expenses",
    highest: "Highest expense",
    addHeading: "Add an expense",
    expensesHeading: "Expenses",
    savingsHeading: "Wedding savings 💍",
    savingsText: "Amount you have actually deposited:",
    savingsInfo: "For expenses of 15 JOD or more, consider saving twice the amount.",
    title: "Expense title",
    amount: "Amount in JOD",
    date: "Date",
    category: "Category",
    necessary: "Was it necessary?",
    worth: "Was it worth it?",
    happy: "Were you happy?",
    saveExpense: "Save expense",
    saveEdit: "Save changes",
    cancel: "Cancel",
    chooseCategory: "Choose a category",
    allCategories: "All categories",
    undecided: "Not answered",
    yes: "Yes",
    no: "No",
    expense: "Expense",
    amountShort: "Amount",
    actions: "Actions",
    editHeading: "Edit expense",
    edit: "Edit",
    remove: "Delete",
    depositedButton: "I deposited it",
    loading: "Loading...",
    empty: "No expenses in this category",
    necessaryShort: "Necessary",
    worthShort: "Worth it",
    happyShort: "Happy",
    deposited: "Deposited in wedding savings",
    suggestion: "Suggested saving",
    deleteConfirm: "Delete",
    depositConfirm1: "Have you actually deposited",
    depositConfirm2: "in your wedding savings? OK will record the deposit.",
    loadError: "Could not load data",
    actionError: "Request failed",
    added: "Expense added",
    updated: "Expense updated",
    deleted: "Expense deleted",
    saved: "Wedding deposit recorded",
    currency: "JOD",
    categories: {
      Food: "Food",
      Transport: "Transport",
      Bills: "Bills",
      Entertainment: "Entertainment",
      Other: "Other",
    },
  },
};

let language =
  localStorage.getItem("expenseTrackerLanguage") === "en" ? "en" : "ar";

let expenses = [];
let savingsTotal = 0;
let jarEntries = [];

const editModal = new bootstrap.Modal($("editModal"));

const languageButton = document.createElement("button");
languageButton.type = "button";
languageButton.id = "languageToggle";
languageButton.className = "btn btn-outline-light btn-sm";
document.querySelector(".navbar .container").append(languageButton);

const jarWords = {
  ar: {
    jarAmountLabel: "المبلغ بالدينار",
    jarAdd: "إيداع مباشر",
    jarWithdraw: "سحب من الحصالة",
    jarHistory: "سجل الحصالة",
    jarEmpty: "لا توجد حركات بعد",
    jarDeposit: "إيداع",
    jarWithdrawal: "سحب",
    jarFromExpense: "عن مصروف رقم",
    jarDirect: "مباشر",
    jarUndoDeposit: "ما أودعت",
    jarUndoWithdrawal: "إلغاء السحب",
    jarUndo: "تراجع",
    jarInvalid: "أدخل مبلغًا صحيحًا أكبر من صفر",
    jarAdded: "تم تسجيل الإيداع",
    jarWithdrawn: "تم تسجيل السحب",
    jarUndone: "تم التراجع عن الحركة",
    jarUndoQuestion: "هل تريد التراجع عن هذه الحركة؟",
  },

  en: {
    jarAmountLabel: "Amount in JOD",
    jarAdd: "Add a deposit",
    jarWithdraw: "Withdraw",
    jarHistory: "Savings history",
    jarEmpty: "No transactions yet",
    jarDeposit: "Deposit",
    jarWithdrawal: "Withdrawal",
    jarFromExpense: "For expense #",
    jarDirect: "Direct",
    jarUndoDeposit: "I did not deposit",
    jarUndoWithdrawal: "Undo withdrawal",
    jarUndo: "Undo",
    jarInvalid: "Enter an amount greater than zero",
    jarAdded: "Deposit recorded",
    jarWithdrawn: "Withdrawal recorded",
    jarUndone: "Transaction undone",
    jarUndoQuestion: "Undo this transaction?",
  },
};

Object.assign(translations.ar, jarWords.ar);
Object.assign(translations.en, jarWords.en);

const jarControls = document.createElement("div");

jarControls.innerHTML = `
  <div class="row g-2 align-items-end mt-3">
    <div class="col-sm-5">
      <label id="jarAmountLabel" for="jarAmount"
             class="form-label"></label>
      <input id="jarAmount" type="number" min="0.01"
             step="0.01" class="form-control">
    </div>

    <div class="col-sm-7 d-flex flex-wrap gap-2">
      <button id="jarAdd" type="button"
              class="btn btn-primary"></button>
      <button id="jarWithdraw" type="button"
              class="btn btn-outline-danger"></button>
    </div>
  </div>

  <h3 id="jarHistoryTitle" class="h6 fw-bold mt-4"></h3>
  <div id="jarEntries" class="list-group"></div>
`;

$("savingsTotal").closest(".card-body").append(jarControls);

function tr(key) {
  return translations[language][key];
}

function money(value) {
  return `${Number(value).toFixed(2)} ${tr("currency")}`;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function translateSelect(id, names) {
  const select = $(id);

  for (const option of select.options) {
    if (Object.prototype.hasOwnProperty.call(names, option.value)) {
      option.textContent = names[option.value];
    }
  }
}

function translatePage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.title = tr("pageTitle");

  languageButton.textContent =
    language === "ar" ? "English" : "العربية";

  languageButton.setAttribute(
    "aria-label",
    language === "ar" ? "Switch to English" : "التبديل إلى العربية"
  );

  const bootstrapLink = document.querySelector(
    'link[href*="bootstrap"][rel="stylesheet"]'
  );

  if (bootstrapLink) {
    const filename =
      language === "ar"
        ? "bootstrap.rtl.min.css"
        : "bootstrap.min.css";

    if (!bootstrapLink.href.endsWith(filename)) {
      bootstrapLink.href =
        `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/${filename}`;
    }
  }

  setText(".navbar-brand", tr("brand"));
  setText("main.container > .alert-warning", tr("hero"));
  setText("#loading span", tr("loading"));

  const summaryLabels = document.querySelectorAll(
    ".summary-grid .card h2"
  );

  ["total", "count", "highest"].forEach((key, index) => {
    if (summaryLabels[index]) {
      summaryLabels[index].textContent = tr(key);
    }
  });

  $("addForm").closest(".card").querySelector("h2").textContent =
    tr("addHeading");

  $("categoryFilter").closest(".card").querySelector("h2").textContent =
    tr("expensesHeading");

  const savingsCard = $("savingsTotal").closest(".card");
  savingsCard.querySelector("h2").textContent = tr("savingsHeading");

  const savingsParagraphs = savingsCard.querySelectorAll("p");
  savingsParagraphs[0].textContent = tr("savingsText");
  savingsParagraphs[1].textContent = tr("savingsInfo");

  const labels = {
    addTitle: "title",
    addAmount: "amount",
    addDate: "date",
    addCategory: "category",
    addNecessary: "necessary",
    addWorthIt: "worth",
    addHappy: "happy",
    editTitle: "title",
    editAmount: "amountShort",
    editDate: "date",
    editCategory: "category",
    editNecessary: "necessary",
    editWorthIt: "worth",
    editHappy: "happy",
  };

  for (const [id, key] of Object.entries(labels)) {
    setText(`label[for="${id}"]`, tr(key));
  }

  setText('#addForm button[type="submit"]', tr("saveExpense"));
  setText("#editModal .modal-title", tr("editHeading"));
  setText('#editForm button[type="submit"]', tr("saveEdit"));
  setText('#editForm button[data-bs-dismiss="modal"]', tr("cancel"));

  $("editModal")
    .querySelector(".btn-close")
    .setAttribute("aria-label", tr("cancel"));

  const headings = document.querySelectorAll(".table thead th");

  ["expense", "amountShort", "category", "date", "actions"].forEach(
    (key, index) => {
      if (headings[index]) {
        headings[index].textContent = tr(key);
      }
    }
  );

  const categoryOptions = {
    "": tr("chooseCategory"),
    All: tr("allCategories"),
    ...tr("categories"),
  };

  ["addCategory", "editCategory", "categoryFilter"].forEach((id) => {
    translateSelect(id, categoryOptions);
  });

  const answerOptions = {
    "": tr("undecided"),
    true: tr("yes"),
    false: tr("no"),
  };

  [
    "addNecessary",
    "addWorthIt",
    "addHappy",
    "editNecessary",
    "editWorthIt",
    "editHappy",
  ].forEach((id) => {
    translateSelect(id, answerOptions);
  });

  $("categoryFilter").setAttribute("aria-label", tr("category"));

  $("jarAmountLabel").textContent = tr("jarAmountLabel");
  $("jarAdd").textContent = tr("jarAdd");
  $("jarWithdraw").textContent = tr("jarWithdraw");
  $("jarHistoryTitle").textContent = tr("jarHistory");

  renderSummary(expenses);
  applyFilter();
  renderJarEntries();

  $("savingsTotal").textContent = money(savingsTotal);
  $("alertBox").replaceChildren();
}

languageButton.addEventListener("click", () => {
  language = language === "ar" ? "en" : "ar";
  localStorage.setItem("expenseTrackerLanguage", language);
  translatePage();
});

function showAlert(message, type = "success") {
  const box = $("alertBox");
  box.replaceChildren();

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  box.append(alert);
}

function setLoading(on) {
  $("loading").classList.toggle("d-none", !on);
}

const apiMessages = {
  "Invalid expense data": "بيانات المصروف غير صحيحة",
  "Expense not found": "المصروف غير موجود",
  "Database error": "خطأ في قاعدة البيانات",
  "Failed to fetch": "تعذر الاتصال بالسيرفر",
  "Already saved for wedding": "تم تسجيل هذا الإيداع سابقًا",
  "Invalid savings data": "بيانات الحصالة غير صحيحة",
  "Insufficient savings balance": "الرصيد لا يكفي لهذا السحب",
  "Savings entry not found": "الحركة غير موجودة",
  "Cannot undo deposit after spending it":
    "لا يمكن التراجع عن الإيداع بعد صرف رصيده",
};

function apiError(message) {
  return language === "ar"
    ? apiMessages[message] || message
    : message;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(apiError(data.message || `HTTP ${response.status}`));
  }

  return data;
}

function jsonOptions(method, data) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function readForm(prefix) {
  const answer = (id) => {
    const value = $(`${prefix}${id}`).value;
    return value === "" ? null : value === "true";
  };

  return {
    title: $(`${prefix}Title`).value.trim(),
    amount: Number($(`${prefix}Amount`).value),
    category: $(`${prefix}Category`).value,
    date: $(`${prefix}Date`).value,
    isNecessary: answer("Necessary"),
    worthIt: answer("WorthIt"),
    feltHappy: answer("Happy"),
  };
}

function setToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  $("addDate").value = `${year}-${month}-${day}`;
}

function renderSummary(list) {
  const total = list.reduce((sum, item) => sum + item.amount, 0);

  const highest = list.reduce(
    (max, item) => Math.max(max, item.amount),
    0
  );

  $("totalAmount").textContent = money(total);
  $("expensesCount").textContent = String(list.length);
  $("highestExpense").textContent = money(highest);
}

function applyFilter() {
  const category = $("categoryFilter").value;

  const list =
    category === "All"
      ? expenses
      : expenses.filter((item) => item.category === category);

  renderTable(list);
}

function renderTable(list) {
  const tbody = $("expenseRows");
  tbody.replaceChildren();

  if (list.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "text-center text-muted py-4";
    cell.textContent = tr("empty");

    row.append(cell);
    tbody.append(row);
    return;
  }

  for (const item of list) {
    const row = document.createElement("tr");

    const title = document.createElement("td");
    title.textContent = item.title;

    const answers = [];

    if (item.isNecessary !== null) {
      answers.push(
        `${tr("necessaryShort")}: ${tr(item.isNecessary ? "yes" : "no")}`
      );
    }

    if (item.worthIt !== null) {
      answers.push(
        `${tr("worthShort")}: ${tr(item.worthIt ? "yes" : "no")}`
      );
    }

    if (item.feltHappy !== null) {
      answers.push(
        `${tr("happyShort")}: ${tr(item.feltHappy ? "yes" : "no")}`
      );
    }

    if (answers.length) {
      const details = document.createElement("small");
      details.className = "d-block text-muted";
      details.textContent = answers.join(" | ");
      title.append(details);
    }

    const amount = document.createElement("td");
    amount.textContent = money(item.amount);

    if (item.suggestedSaving > 0) {
      const note = document.createElement("small");

      note.className = item.savedForWedding
        ? "d-block text-success"
        : "d-block text-primary";

      note.textContent = item.savedForWedding
        ? tr("deposited")
        : `${tr("suggestion")}: ${money(item.suggestedSaving)}`;

      amount.append(note);
    }

    const category = document.createElement("td");
    category.textContent =
      tr("categories")[item.category] || item.category;

    const date = document.createElement("td");
    date.textContent = item.date;

    const actions = document.createElement("td");

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn btn-sm btn-outline-primary me-1";
    edit.textContent = tr("edit");
    edit.addEventListener("click", () => openEdit(item));
    actions.append(edit);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-sm btn-outline-danger me-1";
    remove.textContent = tr("remove");
    remove.addEventListener("click", () => deleteExpense(item));
    actions.append(remove);

    if (item.suggestedSaving > 0 && !item.savedForWedding) {
      const save = document.createElement("button");
      save.type = "button";
      save.className = "btn btn-sm btn-outline-success";
      save.textContent = tr("depositedButton");
      save.addEventListener("click", () => confirmSaving(item));
      actions.append(save);
    }

    row.append(title, amount, category, date, actions);
    tbody.append(row);
  }
}

function renderJarEntries() {
  const container = $("jarEntries");
  container.replaceChildren();

  if (jarEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-muted mb-0";
    empty.textContent = tr("jarEmpty");
    container.append(empty);
    return;
  }

  for (const entry of jarEntries) {
    const row = document.createElement("div");
    row.className =
      "list-group-item d-flex flex-wrap " +
      "justify-content-between align-items-center gap-2";

    const description = document.createElement("div");
    const kind =
      entry.type === "deposit"
        ? tr("jarDeposit")
        : tr("jarWithdrawal");

    const source =
      entry.expenseId == null
        ? tr("jarDirect")
        : `${tr("jarFromExpense")} ${entry.expenseId}`;

    description.textContent =
      `${kind} · ${source} · ${entry.date}`;

    const amount = document.createElement("strong");
    amount.className =
      entry.type === "deposit" ? "text-success" : "text-danger";

    amount.textContent =
      `${entry.type === "deposit" ? "+" : "−"}${money(entry.amount)}`;

    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "btn btn-sm btn-outline-secondary";

    undo.textContent =
      entry.type === "withdrawal"
        ? tr("jarUndoWithdrawal")
        : entry.expenseId != null
          ? tr("jarUndoDeposit")
          : tr("jarUndo");

    undo.addEventListener("click", async () => {
      if (!confirm(tr("jarUndoQuestion"))) return;

      await changeData(
        `/wedding-savings/${entry.id}`,
        { method: "DELETE" },
        "jarUndone"
      );
    });

    row.append(description, amount, undo);
    container.append(row);
  }
}

async function refresh() {
  setLoading(true);

  try {
    const [list, savings] = await Promise.all([
      request("/expenses"),
      request("/wedding-savings"),
    ]);

    expenses = list;
    savingsTotal = savings.total;
    jarEntries = savings.entries || [];

    renderSummary(expenses);
    applyFilter();
    renderJarEntries();
    $("savingsTotal").textContent = money(savingsTotal);
  } catch (error) {
    showAlert(`${tr("loadError")}: ${apiError(error.message)}`, "danger");
  } finally {
    setLoading(false);
  }
}

async function changeData(path, options, successKey) {
  setLoading(true);

  try {
    const result = await request(path, options);
    await refresh();
    showAlert(tr(successKey));
    return result;
  } catch (error) {
    showAlert(`${tr("actionError")}: ${apiError(error.message)}`, "danger");
    return null;
  } finally {
    setLoading(false);
  }
}

function openEdit(item) {
  $("editId").value = item.id;
  $("editTitle").value = item.title;
  $("editAmount").value = item.amount;
  $("editCategory").value = item.category;
  $("editDate").value = item.date;

  $("editNecessary").value =
    item.isNecessary === null ? "" : String(item.isNecessary);
  $("editWorthIt").value =
    item.worthIt === null ? "" : String(item.worthIt);
  $("editHappy").value =
    item.feltHappy === null ? "" : String(item.feltHappy);

  editModal.show();
}

async function deleteExpense(item) {
  const question =
    language === "ar"
      ? `${tr("deleteConfirm")} "${item.title}"؟`
      : `${tr("deleteConfirm")} "${item.title}"?`;

  if (!confirm(question)) return;

  await changeData(
    `/expenses/${item.id}`,
    { method: "DELETE" },
    "deleted"
  );
}

async function confirmSaving(item) {
  const question =
    `${tr("depositConfirm1")} ${money(item.suggestedSaving)} ` +
    tr("depositConfirm2");

  if (!confirm(question)) return;

  await changeData(
    `/expenses/${item.id}/wedding-savings`,
    { method: "POST" },
    "saved"
  );
}

async function manualJarEntry(type) {
  const amount = Number($("jarAmount").value);

  if (!Number.isFinite(amount) || amount <= 0) {
    showAlert(tr("jarInvalid"), "danger");
    return;
  }

  const result = await changeData(
    "/wedding-savings",
    jsonOptions("POST", { type, amount }),
    type === "deposit" ? "jarAdded" : "jarWithdrawn"
  );

  if (result) $("jarAmount").value = "";
}

$("addForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const result = await changeData(
    "/expenses",
    jsonOptions("POST", readForm("add")),
    "added"
  );

  if (result) {
    $("addForm").reset();
    setToday();
  }
});

$("editForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = $("editId").value;

  const result = await changeData(
    `/expenses/${id}`,
    jsonOptions("PUT", readForm("edit")),
    "updated"
  );

  if (result) editModal.hide();
});

$("jarAdd").addEventListener("click", () => {
  manualJarEntry("deposit");
});

$("jarWithdraw").addEventListener("click", () => {
  manualJarEntry("withdrawal");
});

$("categoryFilter").addEventListener("change", applyFilter);

setToday();
translatePage();
refresh();