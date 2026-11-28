import { clearCache, getCachedResult, loadSharedQuery } from '../query-cache';

jest.mock('../logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const deferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe('loadSharedQuery', () => {
  beforeEach(() => clearCache());

  it('sends one request for callers that ask at the same time', async () => {
    const pending = deferred<string[]>();
    const load = jest.fn(() => pending.promise);

    const first = loadSharedQuery('campaigns', load);
    const second = loadSharedQuery('campaigns', load);
    pending.resolve(['a']);

    expect(await first).toEqual(['a']);
    expect(await second).toEqual(['a']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('serves the cached result to later callers', async () => {
    const load = jest.fn().mockResolvedValue(['a']);

    await loadSharedQuery('campaigns', load);
    await loadSharedQuery('campaigns', load);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps different keys apart', async () => {
    const load = jest.fn().mockResolvedValue([]);

    await Promise.all([
      loadSharedQuery('campaigns', load),
      loadSharedQuery('players', load),
    ]);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('fetches again on a forced refresh', async () => {
    const load = jest
      .fn()
      .mockResolvedValueOnce(['old'])
      .mockResolvedValueOnce(['new']);

    await loadSharedQuery('campaigns', load);
    const refreshed = await loadSharedQuery('campaigns', load, {
      forceRefresh: true,
    });

    expect(refreshed).toEqual(['new']);
    expect(getCachedResult('campaigns')).toEqual(['new']);
  });

  it('keeps a forced refresh when an older request finishes after it', async () => {
    const older = deferred<string[]>();
    const load = jest
      .fn()
      .mockReturnValueOnce(older.promise)
      .mockResolvedValueOnce(['new']);

    const first = loadSharedQuery('campaigns', load);
    await loadSharedQuery('campaigns', load, { forceRefresh: true });
    older.resolve(['old']);
    await first;

    expect(getCachedResult('campaigns')).toEqual(['new']);
  });

  it('does not cache a response that was requested before the cache was cleared', async () => {
    const stale = deferred<string[]>();
    const load = jest
      .fn()
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(['fresh']);

    const beforeMutation = loadSharedQuery('encounters', load);
    clearCache();
    const afterMutation = await loadSharedQuery('encounters', load);
    stale.resolve(['stale']);
    await beforeMutation;

    expect(afterMutation).toEqual(['fresh']);
    expect(getCachedResult('encounters')).toEqual(['fresh']);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not share or cache when the cache is bypassed', async () => {
    const load = jest.fn().mockResolvedValue(['a']);

    await Promise.all([
      loadSharedQuery('usage', load, { useCache: false }),
      loadSharedQuery('usage', load, { useCache: false }),
    ]);

    expect(load).toHaveBeenCalledTimes(2);
    expect(getCachedResult('usage')).toBeNull();
  });

  it('lets the next caller retry after a failure', async () => {
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(['a']);

    await expect(loadSharedQuery('campaigns', load)).rejects.toThrow('offline');

    expect(await loadSharedQuery('campaigns', load)).toEqual(['a']);
  });
});
