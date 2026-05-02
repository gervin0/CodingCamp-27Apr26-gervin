// app.js — populated in Tasks 2–5

// ── State (Task 2.1) ─────────────────────────────────────────────────────────
// In-memory array — single source of truth for the session.
let transactions = [];

/**
 * Returns a shallow copy of the transactions array.
 * @returns {Array}
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
 * Returns per-category totals derived from the current transactions array.
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

// ── Validation (Task 4.1) ────────────────────────────────────────────────────

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

// ── Render functions (Task 5) ────────────────────────────────────────────────

/**
 * Reads computeBalance() and updates the text content of #balance-display.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
function renderBalance() {
  const el = document.getElementById('balance-display');
  if (!el) return;
  const balance = computeBalance();
  el.textContent = `Total: $${balance.toFixed(2)}`;
}

// ── Chart instance (Task 5.3) ─────────────────────────────────────────────────
let chartInstance = null;

/**
 * Creates or updates the Chart.js pie chart showing spending by category.
 * Guards against Chart.js being unavailable (CDN failure).
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
function renderChart() {
  const canvas = document.getElementById('spending-chart');
  if (!canvas) return;

  const totals = computeCategoryTotals();
  const hasData = transactions.length > 0;

  // Handle Chart.js unavailable
  if (typeof Chart === 'undefined') {
    canvas.style.display = 'none';
    let fallback = canvas.parentElement.querySelector('.chart-fallback');
    if (!fallback) {
      fallback = document.createElement('p');
      fallback.className = 'chart-fallback';
      canvas.parentElement.appendChild(fallback);
    }
    fallback.textContent = 'Chart unavailable — could not load charting library.';
    return;
  }

  // No transactions — destroy chart and show placeholder
  if (!hasData) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    canvas.style.display = 'none';
    let placeholder = canvas.parentElement.querySelector('.chart-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('p');
      placeholder.className = 'chart-placeholder';
      canvas.parentElement.appendChild(placeholder);
    }
    placeholder.style.display = '';
    placeholder.textContent = 'No spending data yet. Add a transaction to see the chart.';
    return;
  }

  // Hide placeholder if present
  const placeholder = canvas.parentElement.querySelector('.chart-placeholder');
  if (placeholder) placeholder.style.display = 'none';
  canvas.style.display = '';

  const labels = ['Food', 'Transport', 'Fun'];
  const data = [totals.Food, totals.Transport, totals.Fun];
  const backgroundColors = ['#4caf50', '#2196f3', '#ff9800'];

  if (!chartInstance) {
    // First render — create the Chart.js instance
    chartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  } else {
    // Subsequent renders — update data in place to avoid flicker
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
  }
}

/**
 * Rebuilds the #transaction-list from the current transactions array.
 * Each item shows name, amount, category, and a delete button.
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4
 */
function renderTransactionList() {
  const list = document.getElementById('transaction-list');
  if (!list) return;

  // Ensure the list scrolls when entries exceed the visible area (Req 2.3)
  list.style.overflowY = 'auto';

  // Clear existing items
  list.innerHTML = '';

  const txs = getTransactions();

  if (txs.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No transactions yet.';
    list.appendChild(empty);
    return;
  }

  for (const tx of txs) {
    const item = document.createElement('li');
    item.className = 'transaction-item';
    item.dataset.id = tx.id;

    const info = document.createElement('span');
    info.className = 'transaction-info';
    info.textContent = `${tx.name} — $${tx.amount.toFixed(2)} (${tx.category})`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.id = tx.id;
    deleteBtn.setAttribute('aria-label', `Delete transaction: ${tx.name}`);

    deleteBtn.addEventListener('click', () => {
      deleteTransaction(tx.id);
      renderTransactionList();
      renderBalance();
      renderChart();
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  }
}

// ── Form wiring (Task 5.4) ────────────────────────────────────────────────────

/**
 * Handles the Add Transaction button click / form submit.
 * Validates inputs, adds the transaction, resets the form, and re-renders.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 * @param {Event} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('name-input');
  const amountInput = document.getElementById('amount-input');
  const categorySelect = document.getElementById('category-select');
  const errorMsg = document.getElementById('error-msg');

  const name = nameInput ? nameInput.value : '';
  const amount = amountInput ? parseFloat(amountInput.value) : NaN;
  const category = categorySelect ? categorySelect.value : '';

  const result = validateForm(name, amount, category);

  if (!result.valid) {
    if (errorMsg) errorMsg.textContent = result.error;
    return;
  }

  // Clear error, add transaction, reset form
  if (errorMsg) errorMsg.textContent = '';
  addTransaction(name.trim(), amount, category);

  if (nameInput) nameInput.value = '';
  if (amountInput) amountInput.value = '';
  if (categorySelect) categorySelect.value = '';

  renderTransactionList();
  renderBalance();
  renderChart();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

(function init() {
  const addBtn = document.getElementById('add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleFormSubmit);
  }

  // Also support native form submit (e.g. pressing Enter in a field)
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Initial render
  renderBalance();
  renderTransactionList();
  renderChart();
})();
