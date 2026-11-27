import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { useLocalStorage } from '../use-local-storage.hook';

const KEY = 'test-history';

const Probe = () => {
  const [value] = useLocalStorage<string[]>(KEY, []);

  return createElement('span', null, value.join(','));
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the fallback on the first render even when a value is stored', () => {
    localStorage.setItem(KEY, JSON.stringify(['saved']));

    expect(renderToString(createElement(Probe))).toBe('<span></span>');
  });

  it('restores the stored value after mount without overwriting it', () => {
    localStorage.setItem(KEY, JSON.stringify(['saved']));

    const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));

    expect(result.current[0]).toEqual(['saved']);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(['saved']));
  });

  it('persists updates made after mount', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>(KEY, []));

    act(() => result.current[1](['new']));

    expect(result.current[0]).toEqual(['new']);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(['new']));
  });
});
