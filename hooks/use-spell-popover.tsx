import { useState, useCallback } from 'react';
import { Spell } from '../types/spells';

export function useSpellPopover(spells: Spell[] | null) {
  const [popoverSpell, setPopoverSpell] = useState<Spell | null>(null);

  const handleSpellClick = useCallback(
    (spellName: string) => {
      if (!spells) return;
      const found = spells.find(
        (s) => s.name.toLowerCase() === spellName.toLowerCase(),
      );
      if (found) {
        if (popoverSpell && popoverSpell.name === found.name) {
          setPopoverSpell(null);
        } else {
          setPopoverSpell(found);
        }
      }
    },
    [spells, popoverSpell],
  );

  return {
    popoverSpell,
    setPopoverSpell,
    handleSpellClick,
  };
}
