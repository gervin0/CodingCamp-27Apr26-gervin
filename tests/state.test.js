/**
 * Property-based tests for the expense-tracker state module.
 * Run with: node tests/state.test.js
 *
 * Uses fast-check for property-based testing.
 * Feature: expense-tracker
 */

'use strict';

const fc = require('fast-check');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  computeBalance,
  computeCategoryTotals,
  validateForm,
  _reset,
} = require('../state.js');

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES = ['Food', 'Transport', 'Fun'];

/** Arbitrary for a valid category string */
const arbCategory = fc.constantFrom(...CATEGORIES);

/** Arbitrary for a valid non-empty trimmed name */
const arbName = fc.string({ minLength: 1 }).map((s) => s.trim()).filter((s) => s.length > 0);

/** Arbitrary for a positive finite amount */
const arbAmount = fc.float({ min: Math.fround(0.01), max: Math.fround(1_000_000), noNaN: true, noDefaultInfinity: true });

/** Arbitrary for a single valid transaction input (not yet added) */
const arbTxInput = fc.record({
  name: arbName,
  amount: arbAmount,
  category: arbCategory,
});

/** Arbitrary for an array of valid transaction inputs */
const arbTxInputs = fc.array(arbTxInput);

/**
 * Populate the module state with a list of transaction inputs and return the
 * ids in insertion order.
 */
function populate(inputs) {
  _reset();
  for (const { name, amount, category } of inputs) {
    addTransaction(name, amount, category);
  }
  return getTransactions().map((t) => t.id);
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${label}`);
    console.error(`    ${err.message || err}`);
    failed++;
  }
}

// ── Properties ────────────────────────────────────────────────────────────────

console.log('\nexpense-tracker — state module property tests\n');

// Feature: expense-tracker, Property 1: Balance equals sum of transaction amounts
test('P1: computeBalance() equals sum of all amounts (including empty list)', () => {
  fc.assert(
    fc.property(arbTxInputs, (inputs) => {
      populate(inputs);
      const expected = inputs.reduce((s, t) => s + t.amount, 0);
      const actual = computeBalance();
      // Allow tiny floating-point drift
      return Math.abs(actual - expected) < 1e-9;
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 2: Adding a valid transaction grows the list by one
test('P2: addTransaction grows the list by exactly one', () => {
  fc.assert(
    fc.property(arbTxInputs, arbTxInput, (existing, newTx) => {
      populate(existing);
      const before = getTransactions().length;
      addTransaction(newTx.name, newTx.amount, newTx.category);
      const after = getTransactions().length;
      if (after !== before + 1) return false;
      // The new entry must be retrievable by its id
      const added = getTransactions()[after - 1];
      return added !== undefined && typeof added.id === 'string';
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 3: Deleting a transaction removes it from the list
test('P3: deleteTransaction removes the entry and shrinks the list by one', () => {
  fc.assert(
    fc.property(
      fc.array(arbTxInput, { minLength: 1 }),
      fc.nat(),
      (inputs, indexSeed) => {
        populate(inputs);
        const txs = getTransactions();
        const idx = indexSeed % txs.length;
        const targetId = txs[idx].id;
        const before = txs.length;

        deleteTransaction(targetId);

        const after = getTransactions();
        return (
          after.length === before - 1 &&
          after.every((t) => t.id !== targetId)
        );
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 4: Category totals are non-negative and sum to balance
test('P4: category totals are non-negative and sum to computeBalance()', () => {
  fc.assert(
    fc.property(arbTxInputs, (inputs) => {
      populate(inputs);
      const totals = computeCategoryTotals();
      const balance = computeBalance();
      const sum = totals.Food + totals.Transport + totals.Fun;
      return (
        totals.Food >= 0 &&
        totals.Transport >= 0 &&
        totals.Fun >= 0 &&
        Math.abs(sum - balance) < 1e-9
      );
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 7: Add then delete is identity
test('P7: add then immediately delete leaves the array unchanged', () => {
  fc.assert(
    fc.property(arbTxInputs, arbTxInput, (existing, newTx) => {
      populate(existing);
      const snapshot = getTransactions();

      addTransaction(newTx.name, newTx.amount, newTx.category);
      const added = getTransactions();
      const newId = added[added.length - 1].id;
      deleteTransaction(newId);

      const after = getTransactions();
      if (after.length !== snapshot.length) return false;
      return snapshot.every((orig, i) => {
        const cur = after[i];
        return (
          cur.id === orig.id &&
          cur.name === orig.name &&
          cur.amount === orig.amount &&
          cur.category === orig.category
        );
      });
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 8: Insertion order is preserved
test('P8: getTransactions() returns entries in insertion order', () => {
  fc.assert(
    fc.property(fc.array(arbTxInput, { minLength: 1 }), (inputs) => {
      _reset();
      const insertedIds = [];
      for (const { name, amount, category } of inputs) {
        addTransaction(name, amount, category);
        const txs = getTransactions();
        insertedIds.push(txs[txs.length - 1].id);
      }
      const finalIds = getTransactions().map((t) => t.id);
      return (
        finalIds.length === insertedIds.length &&
        finalIds.every((id, i) => id === insertedIds[i])
      );
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 9: Transaction data integrity in the list
test('P9: retrieved transaction has exact name, amount, and category as supplied', () => {
  fc.assert(
    fc.property(arbTxInputs, arbTxInput, (existing, newTx) => {
      populate(existing);
      addTransaction(newTx.name, newTx.amount, newTx.category);
      const txs = getTransactions();
      const added = txs[txs.length - 1];
      return (
        added.name === newTx.name &&
        added.amount === newTx.amount &&
        added.category === newTx.category
      );
    }),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 5: Validation rejects empty or whitespace-only names
// Validates: Requirements 1.3, 1.4
test('P5: validateForm rejects empty or whitespace-only names', () => {
  fc.assert(
    fc.property(
      // Generate strings composed entirely of whitespace (spaces, tabs, newlines)
      fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
      fc.float({ min: Math.fround(0.01), max: Math.fround(1_000_000), noNaN: true, noDefaultInfinity: true }),
      fc.constantFrom('Food', 'Transport', 'Fun'),
      (whitespaceOnlyName, amount, category) => {
        const result = validateForm(whitespaceOnlyName, amount, category);
        return result.valid === false && result.error !== null;
      }
    ),
    { numRuns: 200 }
  );
});

// Feature: expense-tracker, Property 6: Validation rejects non-positive amounts
// Validates: Requirements 1.3, 1.4
test('P6: validateForm rejects zero, negative, and non-finite amounts', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }).map((s) => s.trim()).filter((s) => s.length > 0),
      // Generate amounts that are zero, negative, NaN, or Infinity
      fc.oneof(
        fc.constant(0),
        fc.float({ max: Math.fround(-Number.EPSILON), noNaN: true, noDefaultInfinity: true }),
        fc.constant(NaN),
        fc.constant(Infinity),
        fc.constant(-Infinity)
      ),
      fc.constantFrom('Food', 'Transport', 'Fun'),
      (validName, badAmount, category) => {
        const result = validateForm(validName, badAmount, category);
        return result.valid === false && result.error !== null;
      }
    ),
    { numRuns: 200 }
  );
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
