import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from '../FormInput';

describe('FormInput', () => {
  it('does not leak "undefined" into the class list', () => {
    render(<FormInput id="plain" onChange={jest.fn()} ariaLabel="Plain" />);

    expect(screen.getByLabelText('Plain')).toHaveAttribute('class', 'input');
  });

  it('gives an unlabelled input an accessible name', () => {
    render(
      <FormInput
        id="hp"
        type="number"
        value={7}
        onChange={jest.fn()}
        ariaLabel="Maximum HP for Goblin"
      />,
    );

    expect(
      screen.getByRole('spinbutton', { name: 'Maximum HP for Goblin' }),
    ).toHaveValue(7);
  });

  it('selects a number on focus so typing replaces it', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [value, setValue] = React.useState<number | ''>(0);

      return (
        <FormInput
          id="hp"
          type="number"
          value={value}
          ariaLabel="HP"
          onChange={(e) =>
            setValue(e.target.value === '' ? '' : Number(e.target.value))
          }
        />
      );
    };
    render(<Harness />);

    await user.click(screen.getByLabelText('HP'));
    await user.keyboard('22');

    expect(screen.getByLabelText('HP')).toHaveValue(22);
  });
});
