import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '../use-async-query';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import { clearCache } from '../../lib/query-cache';

jest.mock('../../data/graphql/graphql-fetcher', () => ({
  asyncFetch: jest.fn(),
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const QUERY = 'query AllCampaigns { getCampaigns { _id } }';

describe('useQuery', () => {
  beforeEach(() => {
    clearCache();
    (asyncFetch as jest.Mock).mockResolvedValue({ getCampaigns: [] });
  });

  it('sends one request when several components mount with the same query', async () => {
    const first = renderHook(() => useQuery({ query: QUERY }));
    const second = renderHook(() => useQuery({ query: QUERY }));
    const third = renderHook(() => useQuery({ query: QUERY }));

    await waitFor(() => expect(third.result.current.data).not.toBeNull());

    expect(first.result.current.data).toEqual({ getCampaigns: [] });
    expect(second.result.current.data).toEqual({ getCampaigns: [] });
    expect(asyncFetch).toHaveBeenCalledTimes(1);
  });

  it('has cached data on the first render of a remounted component', async () => {
    const first = renderHook(() => useQuery({ query: QUERY }));
    await waitFor(() => expect(first.result.current.data).not.toBeNull());
    first.unmount();

    const renders: unknown[] = [];
    renderHook(() => {
      const result = useQuery({ query: QUERY });
      renders.push(result.data);

      return result;
    });

    expect(renders[0]).toEqual({ getCampaigns: [] });
    expect(asyncFetch).toHaveBeenCalledTimes(1);
  });

  it('fetches again after a mutation clears the cache', async () => {
    const first = renderHook(() => useQuery({ query: QUERY }));
    await waitFor(() => expect(first.result.current.data).not.toBeNull());

    clearCache();
    const second = renderHook(() => useQuery({ query: QUERY }));
    await waitFor(() => expect(asyncFetch).toHaveBeenCalledTimes(2));

    expect(second.result.current.error).toBeNull();
  });
});
