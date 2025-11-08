# Testing "Add Spent" Logic in Monthly Budget

## Current State
- **Paycheck actualAmount**: 4 (Available: 1000 - 4 = 996)
- **Flower Purchases actualAmount**: 4 (spent)

## The Fix Applied

**File**: `public/js/app.js` - `handleAddSpentSubmit()` method (line 1742)

**Before (WRONG)**:
```javascript
const newIncomeActualAmount = Math.max(0, incomeItem.actualAmount - amount);  // ❌ SUBTRACTS
```

**After (CORRECT)**:
```javascript
const newIncomeActualAmount = incomeItem.actualAmount + amount;  // ✅ ADDS
```

**Why**: 
- For income items: `actualAmount` = amount SPENT (not available)
- Available = budgetAmount - actualAmount
- When spending: ADD to actualAmount to REDUCE available balance

---

## Test Scenario

### Step 1: Record $5 Spent from Monthly Budget
**Action**:
1. Go to **Monthly Budget** tab
2. Find **Flower Purchases** row
3. Click **"Add Spent"** button
4. Enter Amount: **5**
5. Select Income Source: **Paycheck**
6. Click **"Record Spent"**

**Expected Result**:
- Paycheck actualAmount: 4 → **9** (deducted $5)
- Available: 996 → **991**
- Flower Purchases actualAmount: 4 → **9** (spent increased by $5)
- New expense created in Expenses tab

**Console Logs**:
```
Updating income source: Paycheck from actualAmount 4 to 9 (deducting 5 from available)
```

---

### Step 2: Record $3 More Spent
**Action**:
1. Click **"Add Spent"** on Flower Purchases again
2. Enter Amount: **3**
3. Select Income Source: **Paycheck**
4. Click **"Record Spent"**

**Expected Result**:
- Paycheck actualAmount: 9 → **12** (deducted $3 more)
- Available: 991 → **988**
- Flower Purchases actualAmount: 9 → **12** (spent increased by $3)
- Another expense created in Expenses tab

---

### Step 3: Verify Expenses Tab
**Action**:
1. Go to **Expenses** tab
2. Look for the two new transactions

**Expected Result**:
- Two new expenses should appear
- Both with amount $5 and $3
- Both with Paycheck as income source
- Both with "Flower Purchases" category

---

### Step 4: Edit Expense from Expenses Tab
**Action**:
1. Click **"Edit"** on the $5 expense
2. Change amount to **6**
3. Click **"Save"**

**Expected Result**:
- Paycheck actualAmount: 12 → **13** (deducted additional $1)
- Available: 988 → **987**
- Flower Purchases actualAmount: 12 → **13**

---

## How to Test

1. **Hard refresh browser**: Ctrl+F5
2. **Open browser console**: F12 → Console tab
3. **Follow each step above**
4. **After each action**:
   - Check Monthly Budget tab for Paycheck actualAmount
   - Check Expenses tab for new transactions
   - Check browser console for logs

## Key Points

✅ **Add Spent from Monthly Budget** → Deducts from income source
✅ **Create Expense from Expenses Tab** → Deducts from income source
✅ **Edit Expense** → Updates income source correctly
✅ **Delete Expense** → Restores income source
✅ **Bidirectional Sync** → Changes reflect in both tabs

