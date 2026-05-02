# Implementation Plan: Expense Tracker

## Overview

Implement a vanilla HTML/CSS/JS single-page expense tracker with no build tools or frameworks. The app manages an in-memory transactions array and reactively updates a balance display, scrollable transaction list, and Chart.js pie chart on every add or delete.

## Tasks

- [x] 1. Set up project files and HTML structure
  - Create `index.html` with semantic markup: a heading, `#balance-display`, `#error-msg`, the input form (`#name-input`, `#amount-input`, `#category-select`, `#add-btn`), `#transaction-list`, and `<canvas id="spending-chart">`
  - Add a `<script>` tag loading Chart.js from CDN and a `<link>` to `style.css` and `<script src="app.js">` at the bottom of `<body>`
  - Create empty `style.css` and `app.js` files
  - _Requirements: 1.1, 1.2, 5.6_

- [x] 2. Implement state module and pure logic functions
  - [x] 2.1 Implement in-memory state and core state functions in `app.js`
    - Declare `let transactions = []`
    - Implement `getTransactions()` returning a shallow copy of the array
    - Implement `addTransaction(name, amount, category)` that appends a new `{ id, name, amount, category }` object (use `crypto.randomUUID()` with fallback to `Date.now() + Math.random()`)
    - Implement `deleteTransaction(id)` that filters the entry out by idnode tests/state.test.js
    - Implement `computeBalance()` returning the sum of all `amount` fields (0 when empty)
    - Implement `computeCategoryTotals()` returning `{ Food, Transport, Fun }` totals
    - _Requirements: 1.5, 3.2, 4.2, 4.5, 5.1_

- [x] 3. Checkpoint — Ensure all state logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement form validation
  - [x] 4.1 Implement `validateForm(name, amount, category)` in `app.js`
    - Return `{ valid: true, error: null }` when name is non-empty after trim, amount is a finite positive number, and category is one of `"Food"`, `"Transport"`, `"Fun"`
    - Return `{ valid: false, error: "<message>" }` identifying the first invalid field otherwise
    - _Requirements: 1.3, 1.4_

- [x] 5. Implement render functions and form wiring
  - [x] 5.1 Implement `renderBalance()` in `app.js`
    - Read `computeBalance()` and update the text content of `#balance-display`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.2 Implement `renderTransactionList()` in `app.js`
    - Clear `#transaction-list` and rebuild it from `getTransactions()`
    - Each item shows name, amount, category, and a delete button with `data-id` set to the transaction id
    - Attach a click handler on each delete button that calls `deleteTransaction(id)` then re-renders all three components
    - Apply `overflow-y: auto` to the list container so it scrolls when entries exceed the visible area
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 5.3 Implement `renderChart()` in `app.js`
    - Guard with `typeof Chart !== 'undefined'`; show fallback text in the canvas area if Chart.js is unavailable
    - Hold the Chart.js instance in a module-level variable; on first call create it, on subsequent calls update `chart.data` and call `chart.update()` to avoid flicker
    - When `transactions` is empty, destroy or hide the chart instance and show a placeholder message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.4 Implement `handleFormSubmit(event)` and wire up the form in `app.js`
    - Prevent default form submission
    - Read values from `#name-input`, `#amount-input`, `#category-select`
    - Call `validateForm`; if invalid, display the error string in `#error-msg` and return
    - If valid, clear `#error-msg`, call `addTransaction`, reset the form fields, then call `renderTransactionList()`, `renderBalance()`, and `renderChart()`
    - Attach the handler to `#add-btn`'s click event (or the form's submit event)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 6. Checkpoint — Verify full add/delete flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Apply CSS styling and visual hierarchy
  - Style `index.html` in `style.css`:
    - Set body font size ≥ 14px and line-height ≥ 1.4; primary headings ≥ 18px
    - Use distinct size, weight, or spacing to differentiate headings, labels, values, and controls
    - Constrain total transferred asset weight to ≤ 500 KB (excluding Chart.js CDN)
    - Ensure interactive controls have visible focus and hover states for usability
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Sub-tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check and are runnable with `node` directly (no bundler needed)
- UI render functions (`renderTransactionList`, `renderBalance`, `renderChart`) are not unit-tested — they are thin DOM wrappers tested manually in the browser
- Checkpoints ensure incremental validation after each major layer
