import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InactiveEncounterCharacterRow from '../../pages/encounters/[id]/InactiveEncounter/InactiveEncounterCharacterRow';
import NewEnemyModal from '../../pages/encounters/[id]/enemy/NewEnemyModal';
import AddPlayersModal from '../../pages/encounters/[id]/AddPlayersModal';
import EncounterContent from '../../pages/encounters/[id]/EncounterContent';
import { EncounterProvider } from '../../context/EncounterContext';
import { Encounter, InitiativeOrderCharacter } from '../../types/encounters';
import type { Player } from '../../generated/graphql';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
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

const goblin = (id: string): InitiativeOrderCharacter => ({
  _id: id,
  name: 'Goblin',
  initiative: 12,
  maxHP: 7,
  currentHP: 7,
  tempHP: 0,
  armorClass: 15,
  conditions: [],
  type: 'enemy',
});

const player = (id: string, name: string): Player =>
  ({
    _id: id,
    name,
    campaignId: 'campaign-1',
    level: 3,
    armorClass: 16,
    maxHP: 24,
  }) as unknown as Player;

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe('setup row', () => {
  it('gives same-named characters distinct inputs', () => {
    render(
      <table>
        <tbody>
          <InactiveEncounterCharacterRow character={goblin('a1')} />
          <InactiveEncounterCharacterRow character={goblin('b2')} />
        </tbody>
      </table>,
    );

    const hpInputs = screen.getAllByLabelText('Maximum HP for Goblin');
    expect(hpInputs).toHaveLength(2);
    expect(new Set(hpInputs.map((input) => input.id)).size).toBe(2);
    expect(document.querySelectorAll('[id="maxHP-Goblin"]')).toHaveLength(0);
  });
});

describe('add enemy modal', () => {
  it('explains what is missing inline instead of a browser alert', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const onAddCharacter = jest.fn();
    render(<NewEnemyModal onAddCharacter={onAddCharacter} requireInitiative />);

    await user.click(screen.getByRole('button', { name: 'Add', hidden: true }));

    expect(alertSpy).not.toHaveBeenCalled();
    expect(onAddCharacter).not.toHaveBeenCalled();
    expect(screen.getByRole('alert', { hidden: true })).toHaveTextContent(
      'Pick a monster or enter a name, HP above 0, AC above 0 and an initiative.',
    );

    await user.type(screen.getByLabelText('Name'), 'Ogre');

    expect(
      screen.queryByRole('alert', { hidden: true }),
    ).not.toBeInTheDocument();
    alertSpy.mockRestore();
  });
});

describe('add players modal', () => {
  it('accepts an initiative of 0 during combat', async () => {
    const user = userEvent.setup();
    const onAddPlayers = jest.fn();
    render(
      <AddPlayersModal
        players={[player('p1', 'Mira')]}
        onAddPlayers={onAddPlayers}
        selectedCampaignId="campaign-1"
        requireInitiative
      />,
    );

    await user.click(screen.getByLabelText('Mira'));
    await user.type(screen.getByLabelText('Initiative for Mira'), '0');
    const dialog = document.getElementById('add-players-modal') as HTMLElement;
    await user.click(
      within(dialog).getByRole('button', { name: 'Add Players', hidden: true }),
    );

    expect(onAddPlayers).toHaveBeenCalledWith([
      expect.objectContaining({ initiative: 0 }),
    ]);
  });
});

describe('finishing an encounter', () => {
  const encounter = {
    _id: '507f1f77bcf86cd799439011',
    userId: 'user-1',
    name: 'Ambush',
    notes: [],
    enemies: [{ _id: 'a1', name: 'Goblin', maxHP: 7, armorClass: 15 }],
    npcs: [],
    players: [],
    status: 'active',
    campaignId: '507f1f77bcf86cd799439012',
    initiativeOrder: [goblin('a1')],
    currentRound: 3,
    currentTurn: 1,
    createdAt: new Date('2024-01-01'),
  } as unknown as Encounter;

  const renderContent = () => {
    const save = jest.fn().mockResolvedValue({ success: true });
    const onLeave = jest.fn();
    render(
      <EncounterProvider
        initialEncounter={encounter}
        storage={{
          save,
          remove: jest.fn(),
          updateDescription: jest.fn(),
        }}
        isDemo
        onLeave={onLeave}
      >
        <EncounterContent players={[]} />
      </EncounterProvider>,
    );

    return { save, onLeave };
  };

  it('asks before ending combat and keeps the fight on cancel', async () => {
    const user = userEvent.setup();
    const { save, onLeave } = renderContent();

    await user.click(screen.getByRole('button', { name: 'Finish Encounter' }));

    expect(screen.getByText('Finish Encounter?')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();

    const dialog = screen.getByText('Finish Encounter?').closest('dialog');
    await user.click(
      within(dialog as HTMLElement).getByRole('button', {
        name: 'Cancel',
        hidden: true,
      }),
    );

    expect(screen.queryByText('Finish Encounter?')).not.toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('completes the encounter once confirmed', async () => {
    const user = userEvent.setup();
    const { save, onLeave } = renderContent();

    await user.click(screen.getByRole('button', { name: 'Finish Encounter' }));
    const dialog = screen.getByText('Finish Encounter?').closest('dialog');
    await user.click(
      within(dialog as HTMLElement).getByRole('button', {
        name: 'Finish Encounter',
        hidden: true,
      }),
    );

    await waitFor(() => expect(onLeave).toHaveBeenCalled());
    expect(save.mock.calls[0][0]).toMatchObject({ status: 'completed' });
  });
});
