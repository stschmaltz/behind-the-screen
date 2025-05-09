import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { EncounterCharacter } from '../../../types/encounters';
import { Button } from '../../../components/ui/Button';
import { useSpells } from '../../../context/SpellsContext';
import { useSpellPopover } from '../../../hooks/use-spell-popover';
import SpellPopover from '../../../components/spells/SpellPopover';

interface Props {
  monster?: EncounterCharacter;
  isOpen: boolean;
  onClose: () => void;
}

const MonsterDetailModal: React.FC<Props> = ({ monster, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [imgSrc, setImgSrc] = useState(monster?.img_url);
  const [imgError, setImgError] = useState(false);
  const { spells } = useSpells();
  const { popoverSpell, setPopoverSpell, renderTraitsWithSpellPopovers } =
    useSpellPopover(spells);

  useEffect(() => {
    setImgSrc(monster?.img_url);
    setImgError(false);
  }, [monster?.img_url]);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const modalElement = modalRef.current;
    const handleDialogClose = () => {
      if (isOpen) {
        onClose();
      }
    };
    modalElement?.addEventListener('close', handleDialogClose);

    return () => modalElement?.removeEventListener('close', handleDialogClose);
  }, [isOpen, onClose]);

  const renderHTML = (html?: string) => {
    if (!html) return null;

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const formatAbilityScore = (score?: number) => {
    if (!score) return '--';
    const modifier = Math.floor((score - 10) / 2);
    const sign = modifier >= 0 ? '+' : '';

    return `${score} (${sign}${modifier})`;
  };

  if (!monster) return null;

  const fallbackSrc = '/default-avatar.svg';

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-4xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{monster.name}</h2>
            {monster.meta && (
              <p className="italic text-gray-500">{monster.meta}</p>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="stat-box">
                <span className="font-semibold">Armor Class:</span>{' '}
                {monster.armorClass}
              </div>
              <div className="stat-box">
                <span className="font-semibold">Hit Points:</span>{' '}
                {monster.maxHP}
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

          {imgSrc && (
            <div className="w-full md:w-1/3">
              <Image
                key={imgSrc}
                src={imgError ? fallbackSrc : imgSrc}
                alt={monster.name}
                width={300}
                height={200}
                className="rounded-lg w-full object-cover"
                unoptimized={!imgSrc || !imgSrc.startsWith('/')}
                onError={() => {
                  if (imgSrc !== fallbackSrc) {
                    setImgError(true);
                    setImgSrc(fallbackSrc);
                  }
                }}
                priority
              />
            </div>
          )}
        </div>

        {monster.stats && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">
              Ability Scores
            </h3>
            <div className="grid grid-cols-6 gap-2 text-center">
              <div className="stat">
                <div className="font-bold">STR</div>
                <div>{formatAbilityScore(monster.stats.STR)}</div>
              </div>
              <div className="stat">
                <div className="font-bold">DEX</div>
                <div>{formatAbilityScore(monster.stats.DEX)}</div>
              </div>
              <div className="stat">
                <div className="font-bold">CON</div>
                <div>{formatAbilityScore(monster.stats.CON)}</div>
              </div>
              <div className="stat">
                <div className="font-bold">INT</div>
                <div>{formatAbilityScore(monster.stats.INT)}</div>
              </div>
              <div className="stat">
                <div className="font-bold">WIS</div>
                <div>{formatAbilityScore(monster.stats.WIS)}</div>
              </div>
              <div className="stat">
                <div className="font-bold">CHA</div>
                <div>{formatAbilityScore(monster.stats.CHA)}</div>
              </div>
            </div>
          </div>
        )}

        {monster.traits && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">Traits</h3>
            <div className="prose relative">
              {renderTraitsWithSpellPopovers(monster.traits)}
            </div>
          </div>
        )}

        {monster.actions && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">
              Actions
            </h3>
            <div className="prose">{renderHTML(monster.actions)}</div>
          </div>
        )}

        {monster.legendaryActions && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">
              Legendary Actions
            </h3>
            <div className="prose">{renderHTML(monster.legendaryActions)}</div>
          </div>
        )}

        <div className="modal-action">
          <Button variant="primary" label="Close Stats" onClick={onClose} />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
      {popoverSpell && (
        <SpellPopover
          spell={popoverSpell}
          onClose={() => setPopoverSpell(null)}
        />
      )}
    </dialog>
  );
};

export default MonsterDetailModal;
