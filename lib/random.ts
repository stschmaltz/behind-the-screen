/**
 * Utility functions for random generation
 */

/**
 * Rolls a d20 for initiative, optionally applying a modifier
 * @param modifier Modifier to apply to the roll (typically based on DEX)
 * @returns A number between 1 and 20 + modifier
 */
export const rollInitiative = (modifier = 0): number => {
  // Roll d20
  const roll = Math.floor(Math.random() * 20) + 1;

  return roll + modifier;
};

/**
 * Calculates the ability modifier from an ability score
 * @param abilityScore The ability score (e.g., DEX score)
 * @returns The modifier value
 */
export const getAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};
