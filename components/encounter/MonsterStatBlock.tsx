import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { EncounterCharacter } from '../../types/encounters';
import { useSpells } from '../../context/SpellsContext';
import { useSpellPopover } from '../../hooks/use-spell-popover';
import SpellPopover from '../spells/SpellPopover';
import SpellTraitsWithPopovers from '../spells/SpellTraitsWithPopovers';
import { useMonsterReference } from '../../hooks/use-monster-reference';
import { MonsterReference } from '../../lib/monsterReference';

interface Props {
  monster: EncounterCharacter;
  displayName?: string;
  compact?: boolean;
}

const FALLBACK_IMAGE = '/default-avatar.svg';
const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
const REFERENCE_ROWS: Array<[keyof MonsterReference, string]> = [
  ['savingThrows', 'Saving Throws'],
  ['skills', 'Skills'],
  ['damageVulnerabilities', 'Damage Vulnerabilities'],
  ['damageResistances', 'Damage Resistances'],
  ['damageImmunities', 'Damage Immunities'],
  ['conditionImmunities', 'Condition Immunities'],
  ['senses', 'Senses'],
  ['languages', 'Languages'],
];

const formatAbilityScore = (score?: number) => {
  if (!score) return '--';
  const modifier = Math.floor((score - 10) / 2);
  const sign = modifier >= 0 ? '+' : '';

  return `${score} (${sign}${modifier})`;
};

const MonsterStatBlock: React.FC<Props> = ({
  monster,
  displayName,
  compact = false,
}) => {
  const [imgSrc, setImgSrc] = useState(monster.img_url);
  const [imgError, setImgError] = useState(false);
  const { spells } = useSpells();
  const { popoverSpell, setPopoverSpell, handleSpellClick } =
    useSpellPopover(spells);
  const reference = useMonsterReference(monster);
  const referenceRows = REFERENCE_ROWS.filter(([field]) => reference?.[field]);

  useEffect(() => {
    setImgSrc(monster.img_url);
    setImgError(false);
  }, [monster.img_url]);

  useEffect(() => {
    setPopoverSpell(null);
  }, [monster._id, setPopoverSpell]);

  const headingClass = compact
    ? 'text-sm font-semibold uppercase tracking-wide border-b border-base-300 pb-1 mb-2'
    : 'text-lg font-semibold border-b pb-1 mb-2';
  const proseClass = compact ? 'prose prose-sm max-w-none' : 'prose';
  const sectionClass = compact ? 'mt-3' : 'mt-4';

  return (
    <div className="relative">
      {popoverSpell && (
        <div className="sticky top-0 z-50 h-0">
          <SpellPopover
            spell={popoverSpell}
            onClose={() => setPopoverSpell(null)}
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <h2 className={compact ? 'text-xl font-bold' : 'text-2xl font-bold'}>
            {displayName ?? monster.name}
          </h2>
          {monster.meta && (
            <p className="italic text-gray-500">{monster.meta}</p>
          )}

          <div className={`grid grid-cols-2 gap-2 ${sectionClass}`}>
            <div className="stat-box">
              <span className="font-semibold">Armor Class:</span>{' '}
              {monster.armorClass}
            </div>
            <div className="stat-box">
              <span className="font-semibold">Hit Points:</span> {monster.maxHP}
            </div>
            {monster.speed && (
              <div className="stat-box col-span-2">
                <span className="font-semibold">Speed:</span> {monster.speed}
              </div>
            )}
            {monster.challenge && (
              <div className="stat-box col-span-2">
                <span className="font-semibold">Challenge Rating:</span>{' '}
                {monster.challenge}
              </div>
            )}
          </div>
        </div>

        {!compact && imgSrc && (
          <div className="w-full md:w-1/3">
            <Image
              key={imgSrc}
              src={imgError ? FALLBACK_IMAGE : imgSrc}
              alt={monster.name}
              width={300}
              height={200}
              className="rounded-lg w-full object-cover"
              unoptimized={!imgSrc.startsWith('/')}
              onError={() => {
                if (imgSrc !== FALLBACK_IMAGE) {
                  setImgError(true);
                  setImgSrc(FALLBACK_IMAGE);
                }
              }}
              priority
            />
          </div>
        )}
      </div>

      {monster.stats && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Ability Scores</h3>
          <div
            className={
              compact
                ? 'grid grid-cols-3 gap-x-2 gap-y-1 text-center text-sm'
                : 'grid grid-cols-6 gap-2 text-center'
            }
          >
            {ABILITIES.map((ability) => (
              <div key={ability} className={compact ? '' : 'stat'}>
                <div className="font-bold">{ability}</div>
                <div>{formatAbilityScore(monster.stats?.[ability])}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {referenceRows.length > 0 && (
        <dl className={`${sectionClass} space-y-1 ${compact ? 'text-sm' : ''}`}>
          {referenceRows.map(([field, label]) => (
            <div key={field}>
              <dt className="inline font-semibold">{label}:</dt>{' '}
              <dd className="inline">{reference?.[field]}</dd>
            </div>
          ))}
        </dl>
      )}

      {monster.traits && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Traits</h3>
          <div className={`${proseClass} relative`}>
            <SpellTraitsWithPopovers
              traits={monster.traits}
              spells={spells || []}
              onSpellClick={handleSpellClick}
            />
          </div>
        </div>
      )}

      {monster.actions && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Actions</h3>
          <div
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: monster.actions }}
          />
        </div>
      )}

      {reference?.reactions && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Reactions</h3>
          <div
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: reference.reactions }}
          />
        </div>
      )}

      {monster.legendaryActions && (
        <div className={sectionClass}>
          <h3 className={headingClass}>Legendary Actions</h3>
          <div
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: monster.legendaryActions }}
          />
        </div>
      )}
    </div>
  );
};

export default MonsterStatBlock;
