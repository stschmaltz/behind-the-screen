import React from 'react';
import Image from 'next/image';
import { EncounterCharacter } from '../../../types/encounters';
import { useModal } from '../../../hooks/use-modal';
import { Button } from '../../../components/Button';

interface Props {
  monster?: EncounterCharacter;
}

const MonsterDetailModal: React.FC<Props> = ({ monster }) => {
  // Create a unique modal ID for each monster using its _id
  const modalId = `monster-detail-modal-${monster?._id}`;
  const { showModal, closeModal } = useModal(modalId);

  // Helper to render HTML content from the monster data
  const renderHTML = (html?: string) => {
    if (!html) return null;

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Format ability score with modifier
  const formatAbilityScore = (score?: number) => {
    if (!score) return '--';
    const modifier = Math.floor((score - 10) / 2);
    const sign = modifier >= 0 ? '+' : '';

    return `${score} (${sign}${modifier})`;
  };

  if (!monster) return null;

  return (
    <>
      <button
        onClick={showModal}
        className="btn btn-ghost btn-xs text-blue-600 hover:text-blue-800 p-0"
      >
        View Stats
      </button>

      <dialog className="modal" id={modalId}>
        <div className="modal-box max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Monster header */}
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
                    <span className="font-semibold">Speed:</span>{' '}
                    {monster.speed}
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

            {/* Monster image if available */}
            {monster.img_url && (
              <div className="w-full md:w-1/3">
                <Image
                  src={monster.img_url}
                  alt={monster.name}
                  width={300}
                  height={200}
                  className="rounded-lg w-full max-h-40 object-cover"
                  unoptimized={!monster.img_url.startsWith('/')}
                />
              </div>
            )}
          </div>

          {/* Ability scores */}
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

          {/* Traits */}
          {monster.traits && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">
                Traits
              </h3>
              <div className="prose">{renderHTML(monster.traits)}</div>
            </div>
          )}

          {/* Actions */}
          {monster.actions && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">
                Actions
              </h3>
              <div className="prose">{renderHTML(monster.actions)}</div>
            </div>
          )}

          {/* Legendary Actions */}
          {monster.legendaryActions && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">
                Legendary Actions
              </h3>
              <div className="prose">
                {renderHTML(monster.legendaryActions)}
              </div>
            </div>
          )}

          <div className="modal-action">
            <Button variant="primary" label="Close" onClick={closeModal} />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default MonsterDetailModal;
