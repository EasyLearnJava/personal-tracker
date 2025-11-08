# 📖 Complete Workflow Guide

## Scenario: Managing Credit Card Debt

This guide walks through a complete real-world scenario using all new features.

---

## 🎯 Scenario

**Situation**: You have a credit card with a $500 balance. You spend $100 on groceries, then pay $300 from your checking account.

**Goal**: Track everything automatically and see all balances update.

---

## Step 1: Create Your Bank Account

### Action
1. Click **"Bank Accounts"** in the sidebar
2. Click **"+ Add Account"** button
3. Fill in the form:
   - **Account Name**: "Checking Account"
   - **Account Type**: "Checking"
   - **Initial Balance**: "5000"
4. Click **"Save"**

### What Happens
```
✅ Bank account created
✅ Checking Account shows $5000 balance
✅ Activity logged: "Bank Account Created"
```

### Result
```
Bank Accounts View:
┌─────────────────────────┐
│ Checking Account        │
│ Type: Checking          │
│ Balance: $5000          │
│ Change: $0              │
└─────────────────────────┘
```

---

## Step 2: Create Credit Card Debt

### Action
1. Click **"Debts"** in the sidebar
2. Click **"+ Add Debt"** button
3. Fill in the form:
   - **Debt Name**: "Visa Credit Card"
   - **Type**: "Credit Card"
   - **Card Name**: "Visa"
   - **Initial Balance**: "500"
4. Click **"Save"**

### What Happens
```
✅ Debt created
✅ Credit card debt shows $500 balance
✅ Activity logged: "Debt Created"
```

### Result
```
Debts View:
┌─────────────────────────┐
│ Visa Credit Card        │
│ Type: Credit Card       │
│ Balance: $500           │
│ Status: Active          │
└─────────────────────────┘
```

---

## Step 3: Add Expense to Credit Card

### Action
1. Click **"Expenses"** in the sidebar
2. Click **"+ Add Expense"** button
3. Fill in the form:
   - **Amount**: "100"
   - **Description**: "Groceries"
   - **Category**: "Food"
   - **Payment Method**: "Credit Card" ← Important!
   - **Card**: "Visa"
   - **Date**: Today
4. Click **"Save"**

### What Happens
```
✅ Expense created
✅ Credit card debt AUTOMATICALLY increases to $600
✅ Activity logged: "Expense Added"
✅ No manual debt update needed!
```

### Result
```
Expenses View:
┌─────────────────────────┐
│ Groceries               │
│ Amount: $100            │
│ Card: Visa              │
│ Date: Today             │
└─────────────────────────┘

Debts View:
┌─────────────────────────┐
│ Visa Credit Card        │
│ Balance: $600 ← Updated!│
│ Status: Active          │
└─────────────────────────┘
```

---

## Step 4: Make Payment

### Action
1. Click **"Debts"** in the sidebar
2. Click on **"Visa Credit Card"** debt
3. Click **"Make Payment"** button
4. Fill in the form:
   - **Payment Amount**: "300"
   - **Payment Date**: Today
   - **Payment Method**: "Bank Transfer"
   - **Source Account**: "Checking Account"
   - **Notes**: "Monthly payment"
5. Click **"Record Payment"**

### What Happens
```
✅ Payment recorded in Payment History
✅ Credit card debt DECREASES to $300
✅ Checking account balance DECREASES to $4700
✅ Activity logged: "Payment Made"
✅ All balances updated automatically!
```

### Result
```
Payment History View:
┌─────────────────────────────────┐
│ Payment to Visa Credit Card     │
│ Amount: $300                    │
│ Date: Today                     │
│ Method: Bank Transfer           │
│ From: Checking Account          │
│ Status: Completed               │
└─────────────────────────────────┘

Debts View:
┌─────────────────────────┐
│ Visa Credit Card        │
│ Balance: $300 ← Updated!│
│ Status: Active          │
└─────────────────────────┘

Bank Accounts View:
┌─────────────────────────┐
│ Checking Account        │
│ Balance: $4700 ← Updated│
│ Change: -$300           │
└─────────────────────────┘
```

---

## Step 5: View Payment History

### Action
1. Click **"Payment History"** in the sidebar
2. See all payments in timeline

### What You See
```
Payment History Timeline:
┌─────────────────────────────────────────┐
│ 📅 Today                                │
│ 💸 Payment: $300                        │
│ 📝 To: Visa Credit Card                 │
│ 🏦 From: Checking Account               │
│ 💳 Method: Bank Transfer                │
│ ✅ Status: Completed                    │
└─────────────────────────────────────────┘
```

### Features
- Filter by debt
- Filter by payment method
- View payment statistics
- See all payment details

---

## Step 6: View Bank Accounts

### Action
1. Click **"Bank Accounts"** in the sidebar
2. See all accounts with current balances

### What You See
```
Bank Accounts:
┌─────────────────────────┐
│ Checking Account        │
│ Type: Checking          │
│ Initial: $5000          │
│ Current: $4700          │
│ Change: -$300           │
└─────────────────────────┘
```

### Features
- See current balance
- See balance change
- See account type
- Edit or delete accounts

---

## Step 7: View Activity Log

### Action
1. Click **"Activity Log"** in the sidebar
2. See all financial activities

### What You See
```
Activity Log Timeline:
┌─────────────────────────────────────────┐
│ 💸 Payment: $300 to Visa Credit Card    │
│ 📝 Expense: $100 Groceries              │
│ 🏦 Bank Account: Checking Created       │
│ 📊 Debt: Visa Credit Card Created       │
└─────────────────────────────────────────┘
```

### Features
- Filter by activity type
- See all activities
- View activity statistics
- See timestamps

---

## Step 8: View Dashboard

### Action
1. Click **"Dashboard"** in the sidebar
2. See summary of everything

### What You See
```
Dashboard Summary:
┌─────────────────────────────────────────┐
│ Total Bank Balance: $4700               │
│ Total Debt: $300                        │
│ Recent Payments: 1                      │
│ Recent Activities: 4                    │
│                                         │
│ Recent Payments:                        │
│ • $300 to Visa Credit Card (Today)      │
│                                         │
│ Recent Activities:                      │
│ • Payment: $300                         │
│ • Expense: $100                         │
│ • Bank Account Created                  │
│ • Debt Created                          │
└─────────────────────────────────────────┘
```

---

## 📊 Summary of Changes

### Initial State
```
Checking Account: $5000
Visa Debt: $500
```

### After Expense
```
Checking Account: $5000 (unchanged)
Visa Debt: $600 (increased by $100)
```

### After Payment
```
Checking Account: $4700 (decreased by $300)
Visa Debt: $300 (decreased by $300)
```

### Records Created
```
✅ 1 Bank Account
✅ 1 Debt
✅ 1 Expense
✅ 1 Payment
✅ 4 Activities
```

---

## 🔄 Complete Data Flow

```
User Creates Bank Account
    ↓
Bank Account: $5000
Activity: "Bank Account Created"
    ↓
User Creates Debt
    ↓
Debt: $500
Activity: "Debt Created"
    ↓
User Adds Expense to Credit Card
    ↓
Expense: $100
Debt: $600 (auto-increased)
Activity: "Expense Added"
    ↓
User Makes Payment
    ↓
Payment: $300
Debt: $300 (decreased)
Bank Account: $4700 (decreased)
Activity: "Payment Made"
    ↓
User Views Records
    ↓
Payment History: Shows $300 payment
Bank Accounts: Shows $4700 balance
Activity Log: Shows all 4 activities
Dashboard: Shows summary
```

---

## ✨ Key Takeaways

### Automatic Updates
- ✅ Credit card debt auto-increases when you add expenses
- ✅ Bank account balance auto-decreases when you make payments
- ✅ All activities are automatically logged

### Complete Tracking
- ✅ Every payment is recorded with full details
- ✅ Every activity is logged with timestamp
- ✅ Every balance change is tracked

### Easy to Use
- ✅ Simple forms to fill out
- ✅ Clear visual feedback
- ✅ Everything updates automatically

### Full Visibility
- ✅ Payment History shows all payments
- ✅ Bank Accounts shows all balances
- ✅ Activity Log shows all activities
- ✅ Dashboard shows summary

---

## 🎯 Next Steps

1. **Create your bank accounts** - Set up all your accounts
2. **Create your debts** - List all your debts
3. **Add expenses** - Track your spending
4. **Make payments** - Record your payments
5. **Review records** - Check your history and balances

---

## 💡 Tips

- Always select the correct payment method when adding expenses
- Always select the correct source account when making payments
- Review your activity log regularly
- Check your bank account balances weekly
- Monitor your debt balances

---

**Happy tracking!** 📈💰

