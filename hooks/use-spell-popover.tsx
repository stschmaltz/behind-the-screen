import { useState, useCallback, useMemo } from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import { Spell } from '../types/spells';

function extractSpellNames(traits?: string): string[] {
  if (!traits) return [];
  const spellcastingIndex = traits.search(/spellcasting/i);
  if (spellcastingIndex === -1) return [];
  const afterSpellcasting = traits.slice(spellcastingIndex);
  const spellLineRegex =
    /(Cantrips \(at will\):|\d+(?:st|nd|rd|th) level.*?:)([^<]*)/gi;
  const italicRegex = /<i>(.*?)<\/i>/gi;
  const spellNames: string[] = [];
  let match;
  while ((match = spellLineRegex.exec(afterSpellcasting)) !== null) {
    spellNames.push(
      ...match[2]
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
    );
  }
  while ((match = italicRegex.exec(afterSpellcasting)) !== null) {
    spellNames.push(
      ...match[1]
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
    );
  }
  return spellNames.filter(Boolean);
}

function replaceSpellNamesInText(
  text: string,
  spellSet: Set<string>,
  onSpellClick: (spellName: string) => void,
) {
  if (!spellSet.size) return text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const spellRegex = new RegExp(
    `\\b(${Array.from(spellSet)
      .map((n) => n.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|')})\\b`,
    'gi',
  );
  let match;
  while ((match = spellRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) parts.push(before);
    const spellName = match[0];
    parts.push(
      <span
        key={match.index}
        className="underline cursor-pointer text-secondary"
        style={{ position: 'relative', display: 'inline-block' }}
        onClick={() => onSpellClick(spellName)}
      >
        {spellName}
      </span>,
    );
    lastIndex = match.index + spellName.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

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

  const renderTraitsWithSpellPopovers = useCallback(
    (traits?: string) => {
      if (!traits || !spells)
        return traits ? (
          <div dangerouslySetInnerHTML={{ __html: traits }} />
        ) : null;
      const spellNames = extractSpellNames(traits);
      if (spellNames.length === 0)
        return traits ? (
          <div dangerouslySetInnerHTML={{ __html: traits }} />
        ) : null;
      const spellSet = useMemo(
        () => new Set(spellNames.map((s) => s.toLowerCase())),
        [spellNames],
      );
      const options: HTMLReactParserOptions = {
        replace(domNode) {
          if (domNode.type === 'text') {
            return replaceSpellNamesInText(
              (domNode as unknown as Text).data,
              spellSet,
              handleSpellClick,
            );
          }
          return undefined;
        },
      };
      return <>{parse(traits, options)}</>;
    },
    [spells, handleSpellClick],
  );

  return {
    popoverSpell,
    setPopoverSpell,
    renderTraitsWithSpellPopovers,
  };
}
