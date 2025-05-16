import React from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import { Spell } from '../../types/spells';

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
        className="underline cursor-pointer text-accent"
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

interface SpellTraitsWithPopoversProps {
  traits?: string;
  spells: Spell[];
  onSpellClick: (spellName: string) => void;
}

export default function SpellTraitsWithPopovers({
  traits,
  spells,
  onSpellClick,
}: SpellTraitsWithPopoversProps) {
  const spellNames = traits && spells ? extractSpellNames(traits) : [];
  const spellSet = new Set(spellNames.map((s) => s.toLowerCase()));
  if (!traits || !spells) {
    return traits ? <div dangerouslySetInnerHTML={{ __html: traits }} /> : null;
  }
  if (spellNames.length === 0) {
    return traits ? <div dangerouslySetInnerHTML={{ __html: traits }} /> : null;
  }
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode.type === 'text') {
        return replaceSpellNamesInText(
          (domNode as unknown as Text).data,
          spellSet,
          onSpellClick,
        );
      }

      return undefined;
    },
  };

  return <>{parse(traits, options)}</>;
}
