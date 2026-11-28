import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdventureSelector from '../AdventureSelector';
import { asyncFetch } from '../../../data/graphql/graphql-fetcher';

const adventure = (id: string, campaignId: string) => ({
  _id: id,
  campaignId,
  name: `Adventure ${id}`,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

const adventuresByCampaign: Record<string, ReturnType<typeof adventure>[]> = {
  a: [adventure('a1', 'a')],
  b: [],
};

jest.mock('../../../hooks/adventure/get-all-adventures', () => ({
  getAllAdventures: ({ campaignId }: { campaignId?: string }) => ({
    adventures: adventuresByCampaign[campaignId ?? ''] ?? [],
    loading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('../../../data/graphql/graphql-fetcher', () => ({
  asyncFetch: jest.fn(),
}));

jest.mock('../../../lib/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

describe('AdventureSelector', () => {
  it('drops a typed adventure name when the campaign changes', async () => {
    const user = userEvent.setup();
    const onPendingNameChange = jest.fn();
    const props = {
      onAdventureChange: jest.fn(),
      onPendingNameChange,
      required: true,
    };
    const { rerender } = render(
      <AdventureSelector {...props} selectedCampaignId="b" />,
    );

    await user.type(
      screen.getByPlaceholderText('Enter adventure name'),
      'Chapter 1',
    );
    expect(onPendingNameChange).toHaveBeenLastCalledWith('Chapter 1');

    rerender(<AdventureSelector {...props} selectedCampaignId="a" />);

    expect(onPendingNameChange).toHaveBeenLastCalledWith('');
  });

  it('selects the only active adventure again after visiting another campaign', () => {
    const onAdventureChange = jest.fn();
    const props = { onAdventureChange, required: true };
    const { rerender } = render(
      <AdventureSelector {...props} selectedCampaignId="a" />,
    );
    expect(onAdventureChange).toHaveBeenCalledTimes(1);

    rerender(<AdventureSelector {...props} selectedCampaignId="b" />);
    rerender(<AdventureSelector {...props} selectedCampaignId="a" />);

    expect(onAdventureChange).toHaveBeenCalledTimes(2);
    expect(onAdventureChange).toHaveBeenLastCalledWith('a1', {
      isAutomatic: true,
    });
  });

  it('does not select again after the user clears the adventure', async () => {
    const user = userEvent.setup();
    const onAdventureChange = jest.fn();
    const props = { onAdventureChange, required: true };
    const { rerender } = render(
      <AdventureSelector
        {...props}
        selectedCampaignId="a"
        selectedAdventureId="a1"
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'all');
    rerender(<AdventureSelector {...props} selectedCampaignId="a" />);

    expect(onAdventureChange).toHaveBeenCalledTimes(1);
    expect(onAdventureChange).toHaveBeenLastCalledWith(undefined);
  });

  it('sends one request and reports it while an adventure is being created', async () => {
    const user = userEvent.setup();
    let finish: (value: unknown) => void = () => {};
    (asyncFetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const onCreatingChange = jest.fn();
    render(
      <AdventureSelector
        onAdventureChange={jest.fn()}
        onCreatingChange={onCreatingChange}
        selectedCampaignId="b"
        required
      />,
    );

    await user.type(
      screen.getByPlaceholderText('Enter adventure name'),
      'Chapter 1',
    );
    const create = screen.getByRole('button', { name: 'Create' });
    await user.click(create);
    await user.click(create);

    expect(asyncFetch).toHaveBeenCalledTimes(1);
    expect(onCreatingChange).toHaveBeenLastCalledWith(true);

    finish({ saveAdventure: { _id: 'new-id' } });

    await waitFor(() =>
      expect(onCreatingChange).toHaveBeenLastCalledWith(false),
    );
  });
});
