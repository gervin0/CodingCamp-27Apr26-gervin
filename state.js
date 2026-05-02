// state.js — pure state logic, shared between app.js (browser) and tests (Node)

let transactions = [];

/**
 * Returns a shallow copy of the transactions array.
 */
function getTransactions() {
  return transactions.slice();
}

// Fallback counter for environments without crypto.randomUUID
let _idCounter = 0;

/**
 * Appends a new transaction to the in-memory array.
 * @param {string} name
 * @param {number} amount
 * @param {string} category — "Food" | "Transport" | "Fun"
 */
function addTransaction(name, amount, category) {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `tx-${Date.now()}-${++_idCounter}`;

  transactions.push({ id, name, amount, category });
}

/**
 * Removes the transaction with the given id from the array.
 * @param {string} id
 */
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
}

/**
 * Returns the sum of all transaction amounts. Returns 0 when the array is empty.
 * @returns {number}
 */
function computeBalance() {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Returns per-category totals.
 * @returns {{ Food: number, Transport: number, Fun: number }}
 */
function computeCategoryTotals() {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  for (const t of transactions) {
    if (t.category in totals) {
      totals[t.category] += t.amount;
    }
  }
  return totals;
}

const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * Validates the form inputs before adding a transaction.
 * Checks name first, then amount, then category.
 * @param {string} name
 * @param {number|string} amount
 * @param {string} category
 * @returns {{ valid: boolean, error: string | null }}
 */
function validateForm(name, amount, category) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Name is required.' };
  }
  if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number.' };
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return { valid: false, error: 'Category must be Food, Transport, or Fun.' };
  }
  return { valid: true, error: null };
}

// ── Node (test) export ──────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    computeBalance,
    computeCategoryTotals,
    validateForm,
    // Expose a reset helper so tests can start from a clean slate
    _reset() {
      transactions = [];
      _idCounter = 0;
    },
  };
}
