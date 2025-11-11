/**
 * Utility functions for managing indexed state objects
 */

/**
 * Remaps indices in a state object when adding an element at the beginning
 * @param state - Current indexed state object
 * @param initialValue - Value to set at index 0
 * @returns New state object with shifted indices
 */
export const shiftIndicesForward = <T>(
  state: { [key: number]: T },
  initialValue: T,
): { [key: number]: T } => {
  const newState: { [key: number]: T } = {};
  Object.keys(state).forEach((keyStr) => {
    const key = parseInt(keyStr, 10);
    newState[key + 1] = state[key];
  });
  newState[0] = initialValue;

  return newState;
};

/**
 * Remaps indices in a state object when removing an element
 * @param state - Current indexed state object
 * @param indexToRemove - Index being removed
 * @returns New state object with adjusted indices
 */
export const shiftIndicesForRemoval = <T>(
  state: { [key: number]: T },
  indexToRemove: number,
): { [key: number]: T } => {
  const newState: { [key: number]: T } = {};
  Object.keys(state).forEach((keyStr) => {
    const key = parseInt(keyStr, 10);
    if (key !== indexToRemove) {
      newState[key > indexToRemove ? key - 1 : key] = state[key];
    }
  });

  return newState;
};

/**
 * Remaps indices in a state object when inserting an element at a specific position
 * @param state - Current indexed state object
 * @param insertionIndex - Index where new element is inserted
 * @param initialValue - Value to set at insertion index
 * @returns New state object with adjusted indices
 */
export const shiftIndicesForInsertion = <T>(
  state: { [key: number]: T },
  insertionIndex: number,
  initialValue: T,
): { [key: number]: T } => {
  const newState: { [key: number]: T } = {};
  Object.keys(state).forEach((keyStr) => {
    const key = parseInt(keyStr, 10);
    newState[key >= insertionIndex ? key + 1 : key] = state[key];
  });
  newState[insertionIndex] = initialValue;

  return newState;
};
