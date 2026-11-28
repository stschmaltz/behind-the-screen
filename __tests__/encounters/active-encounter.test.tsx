import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveEncounterTable from '../../pages/encounters/[id]/ActiveEncounter/ActiveEncounterTable';
import { EncounterProvider } from '../../context/EncounterContext';
import { showDaisyToast } from '../../lib/daisy-toast';
import { Encounter, InitiativeOrderCharacter } from '../../types/encounters';

const mockHandleSave = jest.fn();

jest.mock('../../hooks/encounter/use-manage-encounter', () => ({
  useManageEncounter: () => ({
    handleSave: mockHandleSave,
    isSaving: false,
    deleteEncounter: jest.fn(),
    updateDescription: jest.fn(),
  }),
}));

jest.mock('../../lib/daisy-toast', () => ({ showDaisyToast: jest.fn() }));

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { capture: jest.fn(), captureException: jest.fn() },
}));

jest.mock('../../context/SpellsContext', () => ({
  useSpells: () => ({ spells: [], isLoading: false, error: null }),
}));

jest.mock('../../hooks/use-monsters.hook', () => ({
  useMonsters: () => ({
    monsters: [],
    options: [],
    isLoading: false,
    error: null,
  }),
  createEmptyEnemy: () => ({ _id: 'new', name: '', maxHP: 0, armorClass: 0 }),
  applyMonsterDataToEnemy: (enemy: unknown) => enemy,
}));

const enemy = (
  id: string,
  name: string,
  initiative: number,
  hp = 10,
): InitiativeOrderCharacter => ({
  _id: id,
  name,
  initiative,
  maxHP: hp,
  currentHP: hp,
  tempHP: 0,
  armorClass: 12,
  conditions: [],
  type: 'enemy',
});

const buildEncounter = (overrides: Partial<Encounter> = {}): Encounter => {
  const initiativeOrder: InitiativeOrderCharacter[] = [
    enemy('e1', 'Goblin', 20),
    {
      _id: 'p1',
      name: 'Fighter',
      initiative: 15,
      maxHP: 40,
      currentHP: 40,
      armorClass: 18,
      conditions: [],
      type: 'player',
    },
    enemy('e2', 'Wolf', 10),
    enemy('e3', 'Worg', 5),
  ];

  return {
    _id: '507f1f77bcf86cd799439011',
    userId: 'user-1',
    name: 'Ambush',
    notes: [],
    enemies: initiativeOrder
      .filter((c) => c.type === 'enemy')
      .map((c) => ({
        _id: c._id,
        name: c.name,
        maxHP: c.maxHP ?? 1,
        armorClass: 12,
      })),
    npcs: [],
    players: [{ _id: 'p1' }],
    status: 'active',
    campaignId: '507f1f77bcf86cd799439012',
    initiativeOrder,
    currentRound: 1,
    currentTurn: 1,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  } as unknown as Encounter;
};

const renderEncounter = (overrides: Partial<Encounter> = {}) =>
  render(
    <EncounterProvider initialEncounter={buildEncounter(overrides)}>
      <ActiveEncounterTable players={[]} />
    </EncounterProvider>,
  );

const rowFor = (name: string) => {
  const row = screen
    .getAllByText(name)
    .map((el) => el.closest('.card'))
    .find((el): el is HTMLElement => el instanceof HTMLElement);
  if (!row) throw new Error(`No active row for ${name}`);

  return row;
};

const currentTurnName = () => {
  const row = screen.getByText('Current Turn').closest('.card') as HTMLElement;

  return ['Goblin', 'Fighter', 'Wolf', 'Worg'].find((name) =>
    within(row)
      .queryAllByText(name)
      .some((el) => el.closest('h3')),
  );
};

const applyHp = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  amount: number,
  mode: 'Dmg' | 'Heal' | 'Temp' = 'Dmg',
) => {
  await user.click(within(rowFor(name)).getByLabelText('Adjust HP'));
  await user.click(screen.getByRole('button', { name: mode }));
  await user.type(screen.getByPlaceholderText('Amount'), String(amount));
  await user.click(screen.getByRole('button', { name: 'Apply' }));
};

const lastSaved = (): Encounter =>
  mockHandleSave.mock.calls[mockHandleSave.mock.calls.length - 1][0];

describe('active encounter', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn();
    HTMLDialogElement.prototype.showModal = jest.fn();
    HTMLDialogElement.prototype.close = jest.fn();
  });

  beforeEach(() => {
    mockHandleSave.mockResolvedValue({ success: true });
  });

  describe('turn order', () => {
    it('starts on the highest initiative with Previous disabled', () => {
      renderEncounter();

      expect(currentTurnName()).toBe('Goblin');
      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('Turn 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    });

    it('advances through the order and starts a new round after the last turn', async () => {
      const user = userEvent.setup();
      renderEncounter();
      const next = screen.getByRole('button', { name: 'Next' });

      await user.click(next);
      expect(currentTurnName()).toBe('Fighter');

      await user.click(next);
      await user.click(next);
      expect(currentTurnName()).toBe('Worg');
      expect(screen.getByText('Turn 4')).toBeInTheDocument();

      await user.click(next);
      expect(currentTurnName()).toBe('Goblin');
      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('Turn 1')).toBeInTheDocument();
      expect(lastSaved()).toMatchObject({ currentRound: 2, currentTurn: 1 });
    });

    it('steps back across a round boundary', async () => {
      const user = userEvent.setup();
      renderEncounter({ currentRound: 2, currentTurn: 1 });

      await user.click(screen.getByRole('button', { name: 'Previous' }));

      expect(currentTurnName()).toBe('Worg');
      expect(screen.getByText('Round 1')).toBeInTheDocument();
    });

    it('announces whose turn it is', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(showDaisyToast).toHaveBeenCalledWith(
        'success',
        "Fighter's turn",
        expect.objectContaining({ replaceId: 'turn-change' }),
      );
    });

    it('reuses one toast for turn changes so they do not stack', async () => {
      const user = userEvent.setup();
      renderEncounter();
      const next = screen.getByRole('button', { name: 'Next' });

      await user.click(next);
      await user.click(next);
      await user.click(next);

      const turnToastIds = (showDaisyToast as jest.Mock).mock.calls
        .filter(([, message]) => String(message).endsWith("'s turn"))
        .map(([, , options]) => options?.replaceId);
      expect(turnToastIds).toEqual([
        'turn-change',
        'turn-change',
        'turn-change',
      ]);
    });

    it('recovers when the saved turn is past the end of the order', async () => {
      const user = userEvent.setup();
      renderEncounter({ currentTurn: 9 });

      expect(currentTurnName()).toBe('Goblin');

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(currentTurnName()).toBe('Fighter');
      expect(screen.getByText('Turn 2')).toBeInTheDocument();
    });
  });

  describe('hit points', () => {
    it('applies damage and saves it', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await applyHp(user, 'Fighter', 7);

      expect(within(rowFor('Fighter')).getByText(/HP: 33\/40/)).toBeVisible();
      expect(
        lastSaved().initiativeOrder.find((c) => c._id === 'p1')?.currentHP,
      ).toBe(33);
    });

    it('does not heal above maximum', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await applyHp(user, 'Fighter', 7);
      await applyHp(user, 'Fighter', 50, 'Heal');

      expect(within(rowFor('Fighter')).getByText(/HP: 40\/40/)).toBeVisible();
    });

    it('burns temporary hit points before real ones', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await applyHp(user, 'Fighter', 5, 'Temp');
      await applyHp(user, 'Fighter', 8);

      expect(within(rowFor('Fighter')).getByText(/HP: 37\/40/)).toBeVisible();
    });

    it('keeps a downed player in the order', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await applyHp(user, 'Fighter', 99);

      expect(within(rowFor('Fighter')).getByText(/HP: 0\/40/)).toBeVisible();
      expect(screen.queryByText('Dead Pool')).not.toBeInTheDocument();
    });
  });

  describe('deaths and revives', () => {
    it('keeps the turn on the same character when an earlier enemy dies', async () => {
      const user = userEvent.setup();
      renderEncounter({ currentTurn: 3 });
      expect(currentTurnName()).toBe('Wolf');

      await applyHp(user, 'Goblin', 10);

      expect(screen.getByText('Dead Pool')).toBeInTheDocument();
      expect(currentTurnName()).toBe('Wolf');
      expect(screen.getByText('Turn 2')).toBeInTheDocument();
      expect(lastSaved()).toMatchObject({ currentTurn: 2, currentRound: 1 });
    });

    it('passes the turn on when the acting enemy dies', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await applyHp(user, 'Goblin', 10);

      expect(currentTurnName()).toBe('Fighter');
      expect(screen.getByText('Turn 1')).toBeInTheDocument();
    });

    it('starts a new round when the last enemy in the order dies on its turn', async () => {
      const user = userEvent.setup();
      renderEncounter({ currentTurn: 4 });
      expect(currentTurnName()).toBe('Worg');

      await applyHp(user, 'Worg', 10);

      expect(currentTurnName()).toBe('Goblin');
      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('Turn 1')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      expect(currentTurnName()).toBe('Fighter');
      expect(screen.getByText('Turn 2')).toBeInTheDocument();
    });

    it('revives from the dead pool without stealing the turn', async () => {
      const user = userEvent.setup();
      renderEncounter({ currentTurn: 2 });
      await applyHp(user, 'Goblin', 10);
      expect(currentTurnName()).toBe('Fighter');

      await user.click(screen.getByRole('button', { name: 'Show' }));
      await user.click(screen.getByRole('button', { name: 'Revive' }));

      expect(screen.queryByText('Dead Pool')).not.toBeInTheDocument();
      expect(within(rowFor('Goblin')).getByText(/HP: 1\/10/)).toBeVisible();
      expect(currentTurnName()).toBe('Fighter');
      expect(screen.getByText('Turn 2')).toBeInTheDocument();
    });
  });

  describe('initiative edits', () => {
    it('re-sorts on blur and keeps the turn with the acting character', async () => {
      const user = userEvent.setup();
      renderEncounter();
      const input = within(rowFor('Goblin')).getByLabelText('Initiative');

      await user.clear(input);
      await user.type(input, '1');
      expect(mockHandleSave).not.toHaveBeenCalled();

      await user.tab();

      expect(currentTurnName()).toBe('Goblin');
      expect(screen.getByText('Turn 4')).toBeInTheDocument();
    });
    it('clamps an out-of-range initiative and shows the stored value', async () => {
      const user = userEvent.setup();
      renderEncounter();
      const input = within(rowFor('Goblin')).getByLabelText('Initiative');

      await user.clear(input);
      await user.type(input, '99');
      await user.tab();
      expect(input).toHaveValue(35);

      await user.clear(input);
      await user.type(input, '99');
      await user.tab();
      expect(input).toHaveValue(35);
    });
  });

  describe('scrolling', () => {
    const wheelIsBlocked = () => {
      const event = new WheelEvent('wheel', {
        cancelable: true,
        bubbles: true,
      });
      document.body.dispatchEvent(event);

      return event.defaultPrevented;
    };

    it('never blocks page scrolling while the HP popover is open or after Escape', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await user.click(within(rowFor('Wolf')).getByLabelText('Adjust HP'));
      expect(screen.getByPlaceholderText('Amount')).toHaveFocus();
      expect(wheelIsBlocked()).toBe(false);

      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByPlaceholderText('Amount')).not.toBeInTheDocument(),
      );
      expect(wheelIsBlocked()).toBe(false);
    });

    it('uses the wheel over the focused amount field to change the value only', async () => {
      const user = userEvent.setup();
      renderEncounter();
      await user.click(within(rowFor('Wolf')).getByLabelText('Adjust HP'));
      const input = screen.getByPlaceholderText('Amount');

      const event = new WheelEvent('wheel', {
        cancelable: true,
        bubbles: true,
        deltaY: -100,
      });
      act(() => {
        input.dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(true);
      await waitFor(() => expect(input).toHaveValue(1));
    });
    it('ignores horizontal wheel movement over the amount field', async () => {
      const user = userEvent.setup();
      renderEncounter();
      await user.click(within(rowFor('Wolf')).getByLabelText('Adjust HP'));
      const input = screen.getByPlaceholderText('Amount');
      await user.type(input, '5');

      const event = new WheelEvent('wheel', {
        cancelable: true,
        bubbles: true,
        deltaX: 80,
        deltaY: 0,
      });
      act(() => {
        input.dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(false);
      expect(input).toHaveValue(5);
    });
  });

  describe('row controls', () => {
    it('opens the HP popover from the HP readout itself', async () => {
      const user = userEvent.setup();
      renderEncounter();

      await user.click(within(rowFor('Wolf')).getByText(/HP: 10\/10/));

      expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    });

    it('describes the HP button with the current health', () => {
      renderEncounter();

      expect(
        within(rowFor('Wolf')).getByLabelText('Adjust HP'),
      ).toHaveAccessibleDescription(/HP: 10\/10/);
    });

    it('clears armor class instead of saving it as 0', async () => {
      const user = userEvent.setup();
      renderEncounter();
      const input = within(rowFor('Wolf')).getByLabelText('Armor Class');

      await user.clear(input);

      expect(input).toHaveValue(null);
      const saved = lastSaved().initiativeOrder.find((c) => c._id === 'e2');
      expect(saved?.armorClass).toBeUndefined();
    });
  });

  describe('saving', () => {
    it('tells the user when a save fails', async () => {
      mockHandleSave.mockResolvedValue({
        success: false,
        errors: ['Failed to save encounter'],
      });
      const user = userEvent.setup();
      renderEncounter();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() =>
        expect(showDaisyToast).toHaveBeenCalledWith(
          'error',
          'Failed to save encounter',
        ),
      );
    });
  });
});
