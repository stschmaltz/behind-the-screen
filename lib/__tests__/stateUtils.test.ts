import {
  shiftIndicesForInsertion,
  shiftIndicesForRemoval,
  shiftIndicesForward,
} from '../stateUtils';

describe('stateUtils', () => {
  describe('shiftIndicesForward', () => {
    it('should add element at index 0 and shift all other indices forward', () => {
      const state = {
        0: 'first',
        1: 'second',
        2: 'third',
      };

      const result = shiftIndicesForward(state, 'new-first');

      expect(result).toEqual({
        0: 'new-first',
        1: 'first',
        2: 'second',
        3: 'third',
      });
    });

    it('should work with empty state', () => {
      const state = {};
      const result = shiftIndicesForward(state, 'first');

      expect(result).toEqual({
        0: 'first',
      });
    });

    it('should handle state with non-consecutive indices', () => {
      const state = {
        0: 'first',
        2: 'third',
        5: 'sixth',
      };

      const result = shiftIndicesForward(state, 'new-first');

      expect(result).toEqual({
        0: 'new-first',
        1: 'first',
        3: 'third',
        6: 'sixth',
      });
    });

    it('should handle different value types', () => {
      const state = {
        0: { name: 'first' },
        1: { name: 'second' },
      };

      const result = shiftIndicesForward(state, { name: 'new-first' });

      expect(result).toEqual({
        0: { name: 'new-first' },
        1: { name: 'first' },
        2: { name: 'second' },
      });
    });
  });

  describe('shiftIndicesForRemoval', () => {
    it('should remove element at specified index and shift subsequent indices back', () => {
      const state = {
        0: 'first',
        1: 'second',
        2: 'third',
        3: 'fourth',
      };

      const result = shiftIndicesForRemoval(state, 1);

      expect(result).toEqual({
        0: 'first',
        1: 'third',
        2: 'fourth',
      });
    });

    it('should remove first element correctly', () => {
      const state = {
        0: 'first',
        1: 'second',
        2: 'third',
      };

      const result = shiftIndicesForRemoval(state, 0);

      expect(result).toEqual({
        0: 'second',
        1: 'third',
      });
    });

    it('should remove last element correctly', () => {
      const state = {
        0: 'first',
        1: 'second',
        2: 'third',
      };

      const result = shiftIndicesForRemoval(state, 2);

      expect(result).toEqual({
        0: 'first',
        1: 'second',
      });
    });

    it('should handle removing from single-element state', () => {
      const state = {
        0: 'only',
      };

      const result = shiftIndicesForRemoval(state, 0);

      expect(result).toEqual({});
    });

    it('should handle removing non-existent index', () => {
      const state = {
        0: 'first',
        1: 'second',
      };

      const result = shiftIndicesForRemoval(state, 5);

      expect(result).toEqual({
        0: 'first',
        1: 'second',
      });
    });

    it('should handle state with non-consecutive indices', () => {
      const state = {
        0: 'first',
        2: 'third',
        5: 'sixth',
        7: 'eighth',
      };

      const result = shiftIndicesForRemoval(state, 2);

      expect(result).toEqual({
        0: 'first',
        4: 'sixth',
        6: 'eighth',
      });
    });
  });

  describe('shiftIndicesForInsertion', () => {
    it('should insert element at specified index and shift subsequent indices forward', () => {
      const state = {
        0: 'first',
        1: 'second',
        2: 'third',
      };

      const result = shiftIndicesForInsertion(state, 1, 'new-second');

      expect(result).toEqual({
        0: 'first',
        1: 'new-second',
        2: 'second',
        3: 'third',
      });
    });

    it('should insert at beginning correctly', () => {
      const state = {
        0: 'first',
        1: 'second',
      };

      const result = shiftIndicesForInsertion(state, 0, 'new-first');

      expect(result).toEqual({
        0: 'new-first',
        1: 'first',
        2: 'second',
      });
    });

    it('should insert at end correctly', () => {
      const state = {
        0: 'first',
        1: 'second',
      };

      const result = shiftIndicesForInsertion(state, 2, 'third');

      expect(result).toEqual({
        0: 'first',
        1: 'second',
        2: 'third',
      });
    });

    it('should work with empty state', () => {
      const state = {};
      const result = shiftIndicesForInsertion(state, 0, 'first');

      expect(result).toEqual({
        0: 'first',
      });
    });

    it('should handle inserting in middle of non-consecutive indices', () => {
      const state = {
        0: 'first',
        1: 'second',
        4: 'fifth',
      };

      const result = shiftIndicesForInsertion(state, 2, 'new-third');

      expect(result).toEqual({
        0: 'first',
        1: 'second',
        2: 'new-third',
        5: 'fifth',
      });
    });

    it('should handle complex objects as values', () => {
      const state = {
        0: { id: '1', name: 'first' },
        1: { id: '2', name: 'second' },
      };

      const result = shiftIndicesForInsertion(state, 1, {
        id: '1.5',
        name: 'inserted',
      });

      expect(result).toEqual({
        0: { id: '1', name: 'first' },
        1: { id: '1.5', name: 'inserted' },
        2: { id: '2', name: 'second' },
      });
    });
  });
});
