export type DifficultyResult = {
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  adjustedXp: number;
  thresholds: {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  };
};

export const getDifficultyClass = (difficulty: string): string => {
  switch (difficulty) {
    case 'trivial':
      return 'text-info';
    case 'easy':
      return 'text-success';
    case 'medium':
      return 'text-warning';
    case 'hard':
      return 'text-error';
    case 'deadly':
      return 'text-error font-bold';
    default:
      return '';
  }
};

export const getDifficultyTooltip = (
  difficulty: string,
  adjustedXp: number,
  thresholds: {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  },
): string => {
  const { easy, medium, hard, deadly } = thresholds;

  const percentOfDeadly = Math.round((adjustedXp / deadly) * 100);
  let description = '';

  switch (difficulty) {
    case 'trivial':
      description =
        'No real threat to the party, almost no resource expenditure.';
      break;
    case 'easy':
      description =
        "One or two easy combat encounters per day won't seriously deplete party resources.";
      break;
    case 'medium':
      description =
        'Party will likely need to use some resources like spell slots and hit points.';
      break;
    case 'hard':
      description =
        'Challenging encounter that will likely require careful tactics and significant resource use.';
      break;
    case 'deadly':
      description = `High risk of character death! ${percentOfDeadly > 125 ? 'EXTREMELY DANGEROUS!' : ''}`;
      break;
  }

  return `${description}\n\nXP Thresholds:\nEasy: ${easy.toLocaleString()} XP\nMedium: ${medium.toLocaleString()} XP\nHard: ${hard.toLocaleString()} XP\nDeadly: ${deadly.toLocaleString()} XP\n\nEncounter XP: ${adjustedXp.toLocaleString()} (${percentOfDeadly}% of deadly threshold)`;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
