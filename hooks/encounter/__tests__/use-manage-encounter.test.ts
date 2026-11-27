import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { useManageEncounter } from '../use-manage-encounter';
import { asyncFetch } from '../../../data/graphql/graphql-fetcher';
import { Encounter } from '../../../types/encounters';

jest.mock('../../../data/graphql/graphql-fetcher', () => ({
  asyncFetch: jest.fn(),
}));

const mockFetch = asyncFetch as jest.Mock;

const encounter = (overrides: Partial<Encounter> = {}): Encounter =>
  ({
    _id: 'encounter-1',
    name: 'Ambush',
    notes: [],
    enemies: [{ _id: 'e1', name: 'Goblin', maxHP: 7, armorClass: 15 }],
    npcs: [],
    players: [],
    status: 'active',
    campaignId: 'campaign-1',
    initiativeOrder: [],
    currentRound: 1,
    currentTurn: 1,
    ...overrides,
  }) as unknown as Encounter;

const savedInputs = () =>
  mockFetch.mock.calls
    .filter(([query]) => String(query).includes('saveEncounter'))
    .map(([, variables]) => variables.input);

const deleteCalls = () =>
  mockFetch.mock.calls.filter(([query]) =>
    String(query).includes('deleteEncounter'),
  );

describe('useManageEncounter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces autosaves and writes only the latest snapshot', async () => {
    const { result } = renderHook(() => useManageEncounter());

    let first: Promise<{ success: boolean }>;
    let second: Promise<{ success: boolean }>;
    act(() => {
      first = result.current.handleSave(encounter({ currentTurn: 2 }));
      second = result.current.handleSave(encounter({ currentTurn: 3 }));
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(600);
    });

    expect(savedInputs()).toHaveLength(1);
    expect(savedInputs()[0].currentTurn).toBe(3);
    await expect(first!).resolves.toMatchObject({ success: true });
    await expect(second!).resolves.toMatchObject({ success: true });
  });

  it('saves an explicit action at once, replacing a queued autosave', async () => {
    const { result } = renderHook(() => useManageEncounter());

    await act(async () => {
      result.current.handleSave(encounter({ currentTurn: 2 }));
      await result.current.handleSave(encounter({ name: 'Renamed' }), {
        immediate: true,
      });
      await jest.advanceTimersByTimeAsync(600);
    });

    expect(savedInputs()).toHaveLength(1);
    expect(savedInputs()[0].name).toBe('Renamed');
  });

  it('refuses later saves once an encounter is finished', async () => {
    const { result } = renderHook(() => useManageEncounter());

    let late: { success: boolean; cancelled?: boolean } | undefined;
    await act(async () => {
      await result.current.handleSave(encounter({ status: 'completed' }), {
        immediate: true,
        final: true,
      });
      late = await result.current.handleSave(encounter({ currentTurn: 2 }));
      await jest.advanceTimersByTimeAsync(600);
    });

    expect(late).toEqual({ success: false, cancelled: true });
    expect(savedInputs()).toHaveLength(1);
    expect(savedInputs()[0].status).toBe('completed');
  });

  it('allows saving again when the finishing save fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useManageEncounter());

    await act(async () => {
      const finish = await result.current.handleSave(
        encounter({ status: 'completed' }),
        { immediate: true, final: true },
      );
      expect(finish.success).toBe(false);

      result.current.handleSave(encounter({ currentTurn: 2 }));
      await jest.advanceTimersByTimeAsync(600);
    });

    expect(savedInputs()).toHaveLength(2);
  });

  it('drops a queued autosave when the encounter is deleted', async () => {
    const { result, unmount } = renderHook(() => useManageEncounter());

    let queued: Promise<{ success: boolean; cancelled?: boolean }>;
    await act(async () => {
      queued = result.current.handleSave(encounter({ currentTurn: 2 }));
      await result.current.deleteEncounter('encounter-1');
    });
    unmount();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(600);
    });

    await expect(queued!).resolves.toEqual({
      success: false,
      cancelled: true,
    });
    expect(deleteCalls()).toHaveLength(1);
    expect(savedInputs()).toHaveLength(0);
  });

  it('waits for a save in flight before deleting', async () => {
    const order: string[] = [];
    let finishSave: () => void = () => undefined;
    mockFetch.mockImplementation((query: string) => {
      if (query.includes('saveEncounter')) {
        return new Promise((resolve) => {
          finishSave = () => {
            order.push('save');
            resolve({});
          };
        });
      }
      order.push('delete');

      return Promise.resolve({});
    });
    const { result } = renderHook(() => useManageEncounter());

    await act(async () => {
      result.current.handleSave(encounter(), { immediate: true });
      const deletion = result.current.deleteEncounter('encounter-1');
      await Promise.resolve();
      finishSave();
      await deletion;
    });

    expect(order).toEqual(['save', 'delete']);
  });

  it('flushes a queued autosave when the screen unmounts', async () => {
    const { result, unmount } = renderHook(() => useManageEncounter());

    act(() => {
      result.current.handleSave(encounter({ currentTurn: 4 }));
    });
    unmount();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });

    expect(savedInputs()).toHaveLength(1);
    expect(savedInputs()[0].currentTurn).toBe(4);
  });
});
