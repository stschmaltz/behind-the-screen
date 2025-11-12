# Testing Guide

This guide explains how to write and run tests in the Dungeon Master Essentials application.

## Table of Contents

- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Coverage](#coverage)

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

This is useful during development as it will re-run tests when files change.

### Run tests with coverage

```bash
npm run test:coverage
```

This generates a coverage report showing which parts of the codebase are tested.

## Test Structure

Tests are organized alongside the code they test:

```
lib/
  encounterUtils.ts
  __tests__/
    encounterUtils.test.ts
hooks/
  useCharacterState.ts
  __tests__/
    useCharacterState.test.ts
pages/
  encounters/
    [id]/
      enemy/
        MonsterSelector.tsx
    __tests__/
      MonsterSelector.test.tsx
```

## Writing Tests

### Testing Utility Functions

Utility functions are pure functions that are straightforward to test:

```typescript
import { getChallengeRatingXp } from '../encounterUtils';

describe('encounterUtils', () => {
  describe('getChallengeRatingXp', () => {
    it('should return correct XP for integer CR values', () => {
      expect(getChallengeRatingXp('1')).toBe(200);
      expect(getChallengeRatingXp('5')).toBe(1800);
    });

    it('should handle fractional CR values', () => {
      expect(getChallengeRatingXp('1/4')).toBe(50);
    });
  });
});
```

### Testing React Hooks

Use `@testing-library/react` to test custom hooks:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCharacterState } from '../useCharacterState';

describe('useCharacterState', () => {
  it('should update character name', () => {
    const mockOnChange = jest.fn();
    const characters = [
      { _id: '1', name: 'Old Name', maxHP: 20, armorClass: 15 },
    ];

    const { result } = renderHook(() =>
      useCharacterState(characters, mockOnChange),
    );

    act(() => {
      result.current.handleCharacterFieldChange(0, 'name', 'New Name');
    });

    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'New Name' }),
    ]);
  });
});
```

### Testing React Components

Use `@testing-library/react` and `@testing-library/user-event` for component tests:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonsterSelector from '../MonsterSelector';

describe('MonsterSelector', () => {
  it('should call onMonsterSelect when monster selected', async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();

    render(
      <MonsterSelector
        onMonsterSelect={mockOnSelect}
        selectedMonsterName=""
      />
    );

    const select = screen.getByTestId('monster-select');
    await user.selectOptions(select, 'Goblin');

    expect(mockOnSelect).toHaveBeenCalled();
  });
});
```

### Mocking Dependencies

#### Mocking Modules

Use Jest's `jest.mock()` to mock entire modules:

```typescript
jest.mock('../use-monsters.hook', () => ({
  useMonsters: jest.fn(() => ({
    monsters: [],
    options: [],
    isLoading: false,
    error: null,
  })),
}));
```

#### Mocking Functions

Use `jest.fn()` to create mock functions:

```typescript
const mockCallback = jest.fn();
// Use mockCallback in your test
expect(mockCallback).toHaveBeenCalledWith(expectedValue);
```

## Best Practices

### 1. Test Behavior, Not Implementation

Focus on what the function or component does, not how it does it:

```typescript
it('should add character to the list', () => {
  expect(result.current.draftEncounter.enemies).toHaveLength(1);
});
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```typescript
it('should return 0 for invalid CR values', () => {
  // Test implementation
});
```

### 3. Arrange-Act-Assert Pattern

Structure tests with clear sections:

```typescript
it('should update character HP', () => {
  const characters = [createMockCharacter('1', 'Fighter')];
  const { result } = renderHook(() => useCharacterState(characters, jest.fn()));

  act(() => {
    result.current.handleCharacterFieldChange(0, 'maxHP', 50);
  });

  expect(mockOnChange).toHaveBeenCalledWith([
    expect.objectContaining({ maxHP: 50 }),
  ]);
});
```

### 4. Test Edge Cases

Always test boundary conditions and edge cases:

```typescript
it('should return 0 for empty array', () => {
  expect(calculateAdjustedXp([])).toBe(0);
});

it('should handle removing non-existent index', () => {
  const result = shiftIndicesForRemoval(state, 999);
  expect(result).toEqual(state);
});
```

### 5. Clean Up After Tests

Use `beforeEach` and `afterEach` to reset state:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 6. Avoid Testing Implementation Details

Don't test internal state that users don't interact with:

```typescript
expect(result.current.isInternalFlag).toBe(true);
```

Instead, test observable behavior:

```typescript
expect(screen.getByText('Success')).toBeInTheDocument();
```

## Coverage

### Viewing Coverage Reports

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in a browser to see a detailed coverage report.

### Coverage Goals

- **Utility Functions**: Aim for 100% coverage
- **Hooks**: Aim for >90% coverage
- **Components**: Aim for >80% coverage

### What to Focus On

1. **Critical Path**: Test the main user flows thoroughly
2. **Edge Cases**: Test boundary conditions and error states
3. **Complex Logic**: Focus on complicated calculations and state management
4. **Refactored Code**: Ensure tests pass after refactoring

## Testing Checklist

When adding new features, ensure you:

- [ ] Write tests for new utility functions
- [ ] Write tests for new hooks
- [ ] Write tests for new components
- [ ] Test error states and edge cases
- [ ] Update existing tests if behavior changes
- [ ] Run all tests before committing
- [ ] Check coverage for new code

## Common Issues

### Tests Timeout

If tests timeout, increase the timeout:

```typescript
jest.setTimeout(10000); // 10 seconds
```

### Async Tests Failing

Always use `await` and `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(mockCallback).toHaveBeenCalled();
});
```

### Mock Not Working

Ensure mocks are defined before the import:

```typescript
jest.mock('./module');
import { functionToTest } from './module';
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro/)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)

## Support

If you have questions about testing, ask the team or create an issue in the repository.
