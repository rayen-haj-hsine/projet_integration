# TripShare Unit Tests

This directory contains all unit tests for the TripShare project, covering both backend and frontend code.

## Structure

```
tests/
├── backend/           # Backend unit tests
│   ├── utils/        # Tests for backend utilities
│   ├── controllers/ # Tests for controllers
│   └── middleware/   # Tests for middleware
├── frontend/         # Frontend unit tests
│   ├── components/   # Tests for React components
│   ├── pages/        # Tests for pages
│   └── api/          # Tests for API client
├── jest.config.cjs   # Jest configuration
├── jest.setup.js     # Global test setup
└── package.json      # Test dependencies
```

## Installation

```bash
cd tests
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run only backend tests
```bash
npm run test:backend
```

### Run only frontend tests
```bash
npm run test:frontend
```

## Writing Tests

### Backend Tests

Backend tests should be placed in `tests/backend/` and mirror the structure of `backend/src/`.

Example:
- `backend/src/utils/password.js` → `tests/backend/utils/password.test.js`

### Frontend Tests

Frontend tests should be placed in `tests/frontend/` and mirror the structure of `frontend/src/`.

Example:
- `frontend/src/components/Navbar.tsx` → `tests/frontend/components/Navbar.test.tsx`

## Test Naming Convention

- Test files should end with `.test.js` (backend) or `.test.tsx` (frontend)
- Use descriptive test names: `describe('UserService', () => { ... })`
- Follow AAA pattern: Arrange, Act, Assert

## Coverage Goals

- Minimum coverage: 60% for branches, functions, lines, and statements
- Aim for 80%+ coverage on critical paths (auth, payments, etc.)

