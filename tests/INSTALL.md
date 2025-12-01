# Installation Guide for Tests Project

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Setup Steps

1. **Navigate to the tests directory:**
   ```bash
   cd tests
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm test
   ```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
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

## Project Structure

```
tests/
├── backend/              # Backend unit tests
│   ├── utils/           # Utility function tests
│   └── controllers/     # Controller tests
├── frontend/            # Frontend unit tests
│   ├── components/      # Component tests
│   ├── pages/          # Page tests
│   └── utils/          # Utility tests
├── jest.config.cjs      # Jest configuration
├── jest.setup.js        # Global test setup
└── package.json         # Dependencies
```

## Writing New Tests

### Backend Test Example

Create a file: `tests/backend/utils/your-utility.test.js`

```javascript
import { describe, it, expect } from '@jest/globals';
import { yourFunction } from '../../../backend/src/utils/your-utility.js';

describe('Your Utility', () => {
  it('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Frontend Test Example

Create a file: `tests/frontend/components/YourComponent.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import YourComponent from '../../../frontend/src/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: "Cannot find module" errors

Make sure you're running tests from the `tests/` directory and that the paths in your imports are correct relative to the tests directory.

### Issue: ES Module errors

The project uses ES modules. Make sure:
- `package.json` has `"type": "module"`
- You're using the correct Jest command with `--experimental-vm-modules`

### Issue: TypeScript errors in frontend tests

Ensure `tsconfig.json` is properly configured and TypeScript is installed.

## Next Steps

1. Add more unit tests for critical functions
2. Add integration tests for API endpoints
3. Set up CI/CD to run tests automatically
4. Increase coverage thresholds as you add more tests

