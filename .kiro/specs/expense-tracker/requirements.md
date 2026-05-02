# Requirements Document

## Introduction

A personal expense tracker web application that allows users to log transactions with a name, amount, and category. The app displays a running total balance, a scrollable list of all transactions, and a pie chart showing spending distribution by category. All data is managed client-side and updates reactively as transactions are added or removed.

## Glossary

- **App**: The personal expense tracker web application.
- **Transaction**: A single expense entry consisting of a name, amount, and category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The UI form used to enter and submit new transactions.
- **Balance_Display**: The UI component that shows the current total of all transaction amounts.
- **Chart**: The pie chart UI component that visualises spending distribution by category.
- **Category**: A classification label for a transaction; one of: Food, Transport, or Fun.
- **Validator**: The component responsible for checking that form inputs meet required constraints before submission.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to fill in a form with an item name, amount, and category, so that I can record a new expense.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for the item name, a numeric field for the amount, and a dropdown selector for the category.
2. THE Input_Form SHALL offer exactly three category options: Food, Transport, and Fun.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a positive numeric value, and a category has been selected.
4. IF the Validator detects that any required field is empty or invalid, THEN THE Input_Form SHALL display an inline error message identifying the invalid field and prevent the transaction from being added.
5. WHEN the Input_Form passes validation, THE App SHALL add the new Transaction to the Transaction_List.
6. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty state.

---

### Requirement 2: View Transactions

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all recorded transactions in the order they were added.
2. THE Transaction_List SHALL show the item name, amount, and category for each Transaction.
3. WHILE the number of transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable to allow access to all entries.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each Transaction.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the removal of that Transaction's amount.
4. WHEN a Transaction is deleted, THE Chart SHALL update to reflect the revised spending distribution.

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL be visible at the top of the App at all times.
2. THE Balance_Display SHALL show the sum of the amounts of all current transactions.
3. WHEN a Transaction is added, THE Balance_Display SHALL update immediately to include the new Transaction's amount.
4. WHEN a Transaction is deleted, THE Balance_Display SHALL update immediately to exclude the deleted Transaction's amount.
5. WHILE no transactions have been recorded, THE Balance_Display SHALL show a total of zero.

---

### Requirement 5: Visualise Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending broken down by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart that represents the proportion of total spending attributed to each Category.
2. THE Chart SHALL include a legend or labels that identify each Category segment.
3. WHEN a Transaction is added, THE Chart SHALL update immediately to reflect the new spending distribution.
4. WHEN a Transaction is deleted, THE Chart SHALL update immediately to reflect the revised spending distribution.
5. WHILE no transactions have been recorded, THE Chart SHALL display an empty or placeholder state indicating that no data is available.
6. WHERE a charting library is used, THE App SHALL use Chart.js or an equivalent lightweight charting library to render the Chart.

---

### Requirement 6: UI/UX Quality

**User Story:** As a user, I want the interface to be visually clear, readable, and responsive, so that I can use the app comfortably without friction or delay.

#### Acceptance Criteria

1. THE App SHALL establish a clear visual hierarchy by using distinct size, weight, or spacing to differentiate headings, labels, values, and controls.
2. THE App SHALL render all text using a font size of at least 14px for body content and at least 18px for primary headings, with a line-height of at least 1.4.
3. THE App SHALL load with a total page weight of no more than 500KB of transferred assets, excluding charting library resources.
4. WHEN the user interacts with any control, THE App SHALL reflect the resulting UI state change within 100ms of the interaction.
