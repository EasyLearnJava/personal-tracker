# Personal Tracker

A powerful and feature-rich personal tracking application built with Node.js, Express, and Supabase. Extensible for future features beyond expense tracking.

## Features

- ✅ User Authentication with Supabase
- ✅ Expense Tracking
- ✅ Income Management
- ✅ Debt Tracking
- ✅ Card Management
- ✅ Reports & Analytics
- ✅ Comprehensive Logging
- ✅ Production Ready

## Tech Stack

- Backend: Node.js, Express.js
- Database: Supabase (PostgreSQL)
- Frontend: Vanilla JavaScript, HTML5, CSS3

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with Supabase credentials
4. Run database setup script in Supabase
5. Start server: `npm start`

## Environment Variables

```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
PORT=4000
NODE_ENV=development
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Expenses
- GET /api/expenses
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

### Income
- GET /api/income
- POST /api/income
- PUT /api/income/:id
- DELETE /api/income/:id

### Debts
- GET /api/debts
- POST /api/debts
- PUT /api/debts/:id
- DELETE /api/debts/:id

### Logs
- GET /api/logs/all
- GET /api/logs/error
- GET /api/logs/info

## Logging

View logs via browser:
- http://localhost:4000/api/logs/all
- http://localhost:4000/api/logs/error

Or via terminal:
- cat logs/all.log
- tail -f logs/all.log

## Security

- Environment variables for sensitive data
- Row Level Security on database tables
- User data isolation
- Secure password handling
- .gitignore prevents committing sensitive files

## License

ISC License

## Author

Easy Learn Java
