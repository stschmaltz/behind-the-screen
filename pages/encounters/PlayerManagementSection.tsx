import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormInput';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  deletePlayerMutation,
  savePlayerMutation,
} from '../../data/graphql/snippets/player';
import { Player } from '../../types/player';
import { useModal } from '../../hooks/use-modal';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { logger } from '../../lib/logger';

interface Props {
  startingPlayers: Player[];
  campaignId?: string;
}

const PlayerManagementSection: React.FC<Props> = ({
  startingPlayers,
  campaignId,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const { closeModal, showModal } = useModal('player-management-modal');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    string | undefined
  >(campaignId);
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  useEffect(() => {
    setPlayers(startingPlayers);
  }, [startingPlayers]);

  // Set the initial campaign ID when it changes from parent
  useEffect(() => {
    setSelectedCampaignId(campaignId);
  }, [campaignId]);

  const savePlayer = async (playerName: string, playerCampaignId: string) => {
    if (!playerCampaignId) {
      logger.error('Campaign ID is required to create a player');

      return;
    }

    const response: {
      savePlayer: Player;
    } = await asyncFetch(savePlayerMutation, {
      input: {
        name: playerName,
        campaignId: playerCampaignId,
      },
    });

    if (!response.savePlayer._id) return;

    setPlayers([
      ...players,
      {
        _id: response.savePlayer._id,
        name: response.savePlayer.name,
        userId: response.savePlayer.userId,
        campaignId: response.savePlayer.campaignId,
        armorClass: response.savePlayer.armorClass,
        maxHP: response.savePlayer.maxHP,
      },
    ]);
    setNewPlayerName('');
  };

  const deletePlayer = async (playerId: string) => {
    await asyncFetch(deletePlayerMutation, {
      id: playerId,
    });
    setPlayers(players.filter((player) => player._id !== playerId));
  };

  // Find campaign name by ID
  const getCampaignName = (id: string) => {
    const campaign = campaigns?.find((c) => c._id === id);

    return campaign?.name || 'Unknown Campaign';
  };

  return (
    <>
      <Button label="Manage Players" onClick={showModal} />
      <dialog
        id="player-management-modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Players</h3>

          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-sm opacity-70 mb-3">
              Add New Player
            </h4>

            <div className="form-control mb-3">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Campaign</span>
              </label>
              <select
                className="select select-bordered w-full select-sm"
                value={selectedCampaignId || ''}
                onChange={(e) =>
                  setSelectedCampaignId(e.target.value || undefined)
                }
                disabled={campaignsLoading}
              >
                <option value="" disabled>
                  Select a campaign
                </option>
                {campaigns?.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              {!selectedCampaignId && (
                <label className="label py-0">
                  <span className="label-text-alt text-error">
                    Campaign is required
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">
                  Player Name
                </span>
              </label>
              <div className="flex items-center gap-2">
                <FormInput
                  id="newPlayer"
                  type="text"
                  placeholder="Enter player name"
                  onChange={(event) => {
                    setNewPlayerName(event.target.value);
                  }}
                  value={newPlayerName}
                  className="input input-bordered input-sm w-full"
                />
                <Button
                  label="Add"
                  variant="primary"
                  disabled={!newPlayerName || !selectedCampaignId}
                  onClick={() => {
                    if (!newPlayerName || !selectedCampaignId) return;
                    savePlayer(newPlayerName, selectedCampaignId);
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm opacity-70 mb-2">
              Current Players
            </h4>

            {players.length === 0 ? (
              <div className="bg-base-200 rounded-lg p-6 text-center opacity-70">
                <p>No players added yet</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-64 rounded-lg border border-base-300">
                <table className="table table-compact w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="text-left">Name</th>
                      <th className="text-left">Campaign</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, _index) => (
                      <tr key={player._id} className="hover:bg-base-200">
                        <td className="font-medium">{player.name}</td>
                        <td className="text-sm opacity-70">
                          {getCampaignName(player.campaignId)}
                        </td>
                        <td className="text-right">
                          <Button
                            label="Delete"
                            onClick={() => deletePlayer(player._id)}
                            variant="error"
                            className="btn-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <Button variant="secondary" label="Close" onClick={closeModal} />
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default PlayerManagementSection;
