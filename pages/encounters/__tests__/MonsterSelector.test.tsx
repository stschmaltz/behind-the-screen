import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonsterSelector from '../[id]/enemy/MonsterSelector';

const mockMonsters = [
  {
    _id: 'monster-1',
    name: 'Goblin',
    'Hit Points': '7 (2d6)',
    'Armor Class': '15',
    meta: 'Small humanoid',
    Speed: '30 ft.',
    Challenge: '1/4',
    Traits: 'Nimble Escape',
    Actions: 'Scimitar',
    STR: '8',
    DEX: '14',
    CON: '10',
    INT: '10',
    WIS: '8',
    CHA: '8',
  },
  {
    _id: 'monster-2',
    name: 'Orc',
    'Hit Points': '15 (2d8 + 6)',
    'Armor Class': '13',
    meta: 'Medium humanoid',
    Speed: '30 ft.',
    Challenge: '1/2',
    Traits: 'Aggressive',
    Actions: 'Greataxe',
    STR: '16',
    DEX: '12',
    CON: '16',
    INT: '7',
    WIS: '11',
    CHA: '10',
  },
];

const mockUseMonsters = jest.fn();

jest.mock('../../../hooks/use-monsters.hook', () => ({
  useMonsters: () => mockUseMonsters(),
  createEmptyEnemy: jest.fn(() => ({
    _id: 'new-enemy-id',
    name: '',
    maxHP: 0,
    armorClass: 0,
  })),
  applyMonsterDataToEnemy: jest.fn((enemy, monster) => ({
    ...enemy,
    name: monster.name,
    maxHP: parseInt(monster['Hit Points'], 10) || 0,
    armorClass: parseInt(monster['Armor Class'], 10) || 0,
    meta: monster.meta,
    speed: monster.Speed,
    stats: {
      STR: parseInt(monster.STR, 10),
      DEX: parseInt(monster.DEX, 10),
      CON: parseInt(monster.CON, 10),
      INT: parseInt(monster.INT, 10),
      WIS: parseInt(monster.WIS, 10),
      CHA: parseInt(monster.CHA, 10),
    },
    challenge: monster.Challenge,
    traits: monster.Traits,
    actions: monster.Actions,
    monsterSource: monster.name,
  })),
}));

jest.mock('../../../components/MonsterCombobox', () => {
  return function MockMonsterCombobox({
    options,
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    options: Array<{ _id: string; name: string }>;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled: boolean;
  }) {
    return (
      <div data-testid="monster-combobox">
        <select
          data-testid="monster-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option._id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  };
});

describe('MonsterSelector', () => {
  const mockOnMonsterSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMonsters.mockReturnValue({
      monsters: mockMonsters,
      options: [
        { _id: 'monster-1', name: 'Goblin' },
        { _id: 'monster-2', name: 'Orc' },
      ],
      isLoading: false,
      error: null,
    });
  });

  it('should render loading state', () => {
    mockUseMonsters.mockReturnValue({
      monsters: [],
      options: [],
      isLoading: true,
      error: null,
    });

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    expect(screen.getByText('Loading monsters...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseMonsters.mockReturnValue({
      monsters: [],
      options: [],
      isLoading: false,
      error: 'Failed to fetch monsters',
    });

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    expect(
      screen.getByText('Error: Failed to fetch monsters'),
    ).toBeInTheDocument();
  });

  it('should render monster selector when loaded', () => {
    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    expect(screen.getByText('Select or Search Monster')).toBeInTheDocument();
    expect(screen.getByTestId('monster-combobox')).toBeInTheDocument();
  });

  it('should display selected monster name', () => {
    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName="Goblin"
      />,
    );

    const select = screen.getByTestId('monster-select') as HTMLSelectElement;
    expect(select.value).toBe('Goblin');
  });

  it('should call onMonsterSelect with enemy data when monster selected', async () => {
    const user = userEvent.setup();

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    const select = screen.getByTestId('monster-select');
    await user.selectOptions(select, 'Goblin');

    await waitFor(() => {
      expect(mockOnMonsterSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Goblin',
          maxHP: 7,
          armorClass: 15,
          challenge: '1/4',
        }),
        'Goblin',
      );
    });
  });

  it('should call onMonsterSelect with different monsters', async () => {
    const user = userEvent.setup();

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    const select = screen.getByTestId('monster-select');
    await user.selectOptions(select, 'Orc');

    await waitFor(() => {
      expect(mockOnMonsterSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Orc',
          maxHP: 15,
          armorClass: 13,
          challenge: '1/2',
        }),
        'Orc',
      );
    });
  });

  it('should call onMonsterSelect with empty enemy when selection cleared', async () => {
    const user = userEvent.setup();

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName="Goblin"
      />,
    );

    const select = screen.getByTestId('monster-select');
    await user.selectOptions(select, '');

    await waitFor(() => {
      expect(mockOnMonsterSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '',
          maxHP: 0,
          armorClass: 0,
        }),
        '',
      );
    });
  });

  it('should handle selecting same monster name that does not exist in list', () => {
    mockUseMonsters.mockReturnValue({
      monsters: [],
      options: [],
      isLoading: false,
      error: null,
    });

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName="NonExistent"
      />,
    );

    expect(mockOnMonsterSelect).not.toHaveBeenCalled();
  });

  it('should hide combobox when loading', () => {
    mockUseMonsters.mockReturnValue({
      monsters: [],
      options: [],
      isLoading: true,
      error: null,
    });

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    expect(screen.queryByTestId('monster-combobox')).not.toBeInTheDocument();
  });

  it('should pass correct props to MonsterCombobox', () => {
    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName="Goblin"
      />,
    );

    const combobox = screen.getByTestId('monster-combobox');
    expect(combobox).toBeInTheDocument();

    const select = screen.getByTestId('monster-select') as HTMLSelectElement;
    expect(select.value).toBe('Goblin');
    expect(select.disabled).toBe(false);
  });

  it('should have correct label text', () => {
    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    expect(screen.getByText('Select or Search Monster')).toBeInTheDocument();
  });

  it('should apply monster stats correctly', async () => {
    const user = userEvent.setup();

    render(
      <MonsterSelector
        onMonsterSelect={mockOnMonsterSelect}
        selectedMonsterName=""
      />,
    );

    const select = screen.getByTestId('monster-select');
    await user.selectOptions(select, 'Goblin');

    await waitFor(() => {
      expect(mockOnMonsterSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: {
            STR: 8,
            DEX: 14,
            CON: 10,
            INT: 10,
            WIS: 8,
            CHA: 8,
          },
        }),
        'Goblin',
      );
    });
  });
});
