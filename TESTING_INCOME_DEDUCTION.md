# Income Source Deduction Testing Guide

## Current State
- **Paycheck actualAmount**: 4 (Available: 1000 - 4 = 996)
- **Flower Purchases actualAmount**: 4 (spent)

## Test Scenario

### Step 1: Create $2 Expense
**Action**: 
1. Go to Expenses tab
2. Click "+ Add Expense"
3. Amount: 2
4. Category: Flower Purchases
5. Income Source: Paycheck
6. Click "Save"

**Expected Result**:
- Paycheck actualAmount: 4 → **6** (deducted $2)
- Available: 996 → **994**
- Flower Purchases actualAmount: 4 → **6** (spent increased)

**Console Logs to Check**:
```
UPDATE EXPENSE - Old expense: null (new expense)
Step 1: Restoring old amount from old income source (skipped for new)
Step 3: Deducting new amount from new income source
ADD action: deducting 2 from income source available balance
```

---

### Step 2: Update $2 to $3
**Action**:
1. Click "Edit" on the $2 expense
2. Change amount to 3
3. Click "Save"

**Expected Result**:
- Paycheck actualAmount: 6 → **7** (deducted additional $1)
- Available: 994 → **993**
- Flower Purchases actualAmount: 6 → **7** (spent increased by $1)

**Console Logs to Check**:
```
UPDATE EXPENSE - Old expense: {amount: 2, ...}
UPDATE EXPENSE - New data: {amount: 3, ...}
Step 1: Restoring old amount from old income source
DELETE action: adding back 2 from income source available balance
Step 2: Reloading budget data only
Step 3: Deducting new amount from new income source
ADD action: deducting 3 from income source available balance
```

---

### Step 3: Update $3 to $1
**Action**:
1. Click "Edit" on the $3 expense
2. Change amount to 1
3. Click "Save"

**Expected Result**:
- Paycheck actualAmount: 7 → **5** (restored $2)
- Available: 993 → **995**
- Flower Purchases actualAmount: 7 → **5** (spent decreased by $2)

**Console Logs to Check**:
```
DELETE action: adding back 3 from income source available balance
ADD action: deducting 1 from income source available balance
```

---

### Step 4: Delete Expense
**Action**:
1. Click "Delete" on the $1 expense
2. Confirm deletion

**Expected Result**:
- Paycheck actualAmount: 5 → **4** (restored $1)
- Available: 995 → **996**
- Flower Purchases actualAmount: 5 → **4** (spent decreased by $1)

**Console Logs to Check**:
```
DELETE action: adding back 1 from income source available balance
```

---

## How to Test

1. **Hard refresh browser**: Ctrl+F5
2. **Open browser console**: F12 → Console tab
3. **Go to Expenses tab**
4. **Follow each step above**
5. **After each action**:
   - Check Monthly Budget tab to verify Paycheck actualAmount
   - Check browser console for logs
   - Verify the calculations match expected results

## Key Points

- **actualAmount for Income items** = Amount SPENT (not available)
- **Available Balance** = budgetAmount - actualAmount
- **When adding expense**: actualAmount increases (available decreases)
- **When deleting expense**: actualAmount decreases (available increases)
- **When updating**: First restore old amount, then deduct new amount

