import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { toast } from 'react-toastify';
import { showDaisyToast } from '../daisy-toast';

jest.mock('react-toastify', () => {
  const toast = Object.assign(jest.fn(), {
    isActive: jest.fn(),
    update: jest.fn(),
  });

  return { toast };
});

const mockToast = toast as unknown as jest.Mock & {
  isActive: jest.Mock;
  update: jest.Mock;
};

describe('showDaisyToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.isActive.mockReturnValue(false);
  });

  it('shows a new toast for four seconds by default', () => {
    showDaisyToast('success', 'Encounter saved');

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast.mock.calls[0][1]).toMatchObject({
      autoClose: 4000,
      toastId: undefined,
    });
  });

  it('replaces the visible toast with the same id instead of stacking', () => {
    showDaisyToast('success', "Goblin's turn", {
      replaceId: 'turn-change',
      duration: 2000,
    });
    mockToast.isActive.mockReturnValue(true);
    showDaisyToast('success', "Wolf's turn", {
      replaceId: 'turn-change',
      duration: 2000,
    });

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast.mock.calls[0][1]).toMatchObject({
      toastId: 'turn-change',
      autoClose: 2000,
    });
    expect(mockToast.update).toHaveBeenCalledWith(
      'turn-change',
      expect.objectContaining({ autoClose: 2000 }),
    );
  });

  it('catches up when a replacement arrives before the first toast has opened', () => {
    showDaisyToast('success', "Goblin's turn", { replaceId: 'turn-change' });
    showDaisyToast('success', "Wolf's turn", { replaceId: 'turn-change' });

    expect(mockToast.update).not.toHaveBeenCalled();

    mockToast.mock.calls[0][1].onOpen();

    expect(mockToast.update).toHaveBeenCalledTimes(1);
    const { container } = render(mockToast.update.mock.calls[0][1].render);
    expect(container).toHaveTextContent("Wolf's turn");
  });
});
