import Link from 'next/link';
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/react/24/outline';
import DescriptionDisplay from '../DescriptionDisplay';
import EncounterDifficultyBadge from '../EncounterDifficultyBadge';
import { Campaign } from '../../types/campaigns';
import { TransformedAdventure } from '../../hooks/adventure/get-all-adventures';
import type { Player } from '../../src/generated/graphql';
import { logger } from '../../lib/logger';
import type { Encounter } from '../../src/generated/graphql';

interface EncounterCardProps {
  encounter: Encounter;
  campaigns?: Campaign[];
  adventures?: TransformedAdventure[];
  players?: Player[];
  isSaving: boolean;
  isDeleting: boolean;
  encounterToDelete: string | null;
  onCopyClick: (encounter: Encounter) => void;
  onDeleteClick: (encounterId: string) => void;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'badge-outline badge-success';
    case 'completed':
      return 'badge-outline badge-ghost';
    default:
      return 'badge-outline badge-secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    default:
      return 'Inactive';
  }
};

const EncounterCard: React.FC<EncounterCardProps> = ({
  encounter,
  campaigns,
  adventures,
  players,
  isSaving,
  isDeleting,
  encounterToDelete: _encounterToDelete,
  onCopyClick,
  onDeleteClick,
}) => {
  if (!encounter) return null;

  const campaign = encounter.campaignId
    ? campaigns?.find((c) => c._id === (encounter.campaignId ?? undefined))
    : null;

  const adventure = encounter.adventureId
    ? adventures?.find((a) => a._id === (encounter.adventureId ?? undefined))
    : null;

  const campaignPlayerLevels =
    players
      ?.filter((p) => p.campaignId === (encounter.campaignId ?? undefined))
      .map((p) => p.level || 1) || [];

  return (
    <div key={encounter._id.toString()} className="encounter-card">
      <Link
        href={`/encounters/${encounter._id.toString()}`}
        className="block w-full"
      >
        <div className="p-4 bg-base-200 border border-base-300 rounded shadow-sm hover:bg-base-300 transition-colors">
          <div className="flex justify-between items-start">
            <div className="text-lg font-semibold flex items-center gap-2 flex-grow mr-4">
              <span className="card-title">{encounter.name}</span>
              <DescriptionDisplay
                encounterId={encounter._id.toString()}
                description={encounter.description ?? undefined}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-sm opacity-80 text-right">
                {encounter.createdAt
                  ? new Date(encounter.createdAt).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className={`badge ${getStatusBadgeClass(encounter.status)}`}>
                {getStatusLabel(encounter.status)}
              </div>
            </div>
          </div>

          <div className="mt-2 flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap items-center">
              {encounter.campaignId && (
                <div className="badge badge-primary badge-outline badge-sm font-semibold">
                  {campaign?.name || 'Campaign'}
                </div>
              )}
              {encounter.adventureId && (
                <div className="badge badge-secondary badge-outline badge-sm font-semibold">
                  {adventure?.name || 'Adventure'}
                </div>
              )}
              {encounter.enemies?.length > 0 &&
                campaignPlayerLevels.length > 0 && (
                  <EncounterDifficultyBadge
                    enemies={encounter.enemies.map((e) => ({
                      ...e,
                      meta: e.meta ?? undefined,
                      speed: e.speed ?? undefined,
                      challenge: e.challenge ?? undefined,
                      actions: e.actions ?? undefined,
                      legendaryActions: e.legendaryActions ?? undefined,
                      img_url: e.img_url ?? undefined,
                      monsterSource: e.monsterSource ?? undefined,
                      traits: e.traits ?? undefined,
                      stats: e.stats
                        ? {
                            STR: e.stats.STR ?? 0,
                            DEX: e.stats.DEX ?? 0,
                            CON: e.stats.CON ?? 0,
                            INT: e.stats.INT ?? 0,
                            WIS: e.stats.WIS ?? 0,
                            CHA: e.stats.CHA ?? 0,
                          }
                        : undefined,
                    }))}
                    playerLevels={campaignPlayerLevels}
                    className="badge-sm"
                  />
                )}
            </div>
            <div className="flex gap-2 items-center">
              {(encounter.status === 'inactive' ||
                encounter.status === 'completed') && (
                <>
                  <button
                    className="btn btn-sm btn-secondary bg-opacity-20 hover:bg-opacity-80"
                    title="Re-create Encounter"
                    onClick={(e) => {
                      logger.debug(
                        'Re-create button clicked for:',
                        encounter.name,
                      );
                      e.stopPropagation();
                      e.preventDefault();
                      onCopyClick(encounter);
                    }}
                    disabled={isSaving || isDeleting}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-sm bg-error bg-opacity-20 hover:bg-error hover:bg-opacity-40"
                    title="Delete Encounter"
                    onClick={(e) => {
                      logger.debug(
                        'Delete button clicked for:',
                        encounter.name,
                      );
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteClick(encounter._id.toString());
                    }}
                    disabled={isSaving || isDeleting}
                  >
                    <TrashIcon className="w-4 h-4 text-error" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EncounterCard;
