import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormInput';
import { asyncFetch } from '../../data/graphql/graphql-fetcher';
import {
  createPlayerMutation,
  deletePlayerMutation,
  updatePlayerMutation,
  updatePlayersMutation,
} from '../../data/graphql/snippets/player';
import { Player } from '../../types/player';
import { useModal } from '../../hooks/use-modal';
import { getAllCampaigns } from '../../hooks/campaign/get-all-campaigns';
import { logger } from '../../lib/logger';

interface Props {
  startingPlayers: Player[];
  campaignId?: string;
  buttonClassName?: string;
}

const PlayerManagementSection: React.FC<Props> = ({
  startingPlayers,
  campaignId,
  buttonClassName,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const { closeModal, showModal } = useModal('player-management-modal');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState<number>(1);
  const [newPlayerAC, setNewPlayerAC] = useState<number | undefined>(undefined);
  const [newPlayerHP, setNewPlayerHP] = useState<number | undefined>(undefined);
  const [bulkLevel, setBulkLevel] = useState<number | undefined>(undefined);
  const [editingPlayer, setEditingPlayer] = useState<{
    id: string;
    field: 'armorClass' | 'maxHP';
    value: number;
  } | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    string | undefined
  >(campaignId);
  const { campaigns, loading: campaignsLoading } = getAllCampaigns();

  useEffect(() => {
    setPlayers(startingPlayers);
  }, [startingPlayers]);

  useEffect(() => {
    setSelectedCampaignId(campaignId);
  }, [campaignId]);

  const createPlayer = async (
    playerName: string,
    playerCampaignId: string,
    level: number = 1,
    armorClass?: number,
    maxHP?: number,
  ) => {
    if (!playerCampaignId) {
      logger.error('Campaign ID is required to create a player');

      return;
    }

    const response: {
      createPlayer: Player;
    } = await asyncFetch(createPlayerMutation, {
      input: {
        name: playerName,
        campaignId: playerCampaignId,
        level,
        armorClass,
        maxHP,
      },
    });

    if (!response.createPlayer._id) return;

    setPlayers([
      ...players,
      {
        _id: response.createPlayer._id,
        name: response.createPlayer.name,
        userId: response.createPlayer.userId,
        campaignId: response.createPlayer.campaignId,
        armorClass: response.createPlayer.armorClass,
        maxHP: response.createPlayer.maxHP,
        level: response.createPlayer.level,
      },
    ]);
    setNewPlayerName('');
    setNewPlayerLevel(1);
    setNewPlayerAC(undefined);
    setNewPlayerHP(undefined);
  };

  const deletePlayer = async (playerId: string) => {
    await asyncFetch(deletePlayerMutation, {
      id: playerId,
    });
    setPlayers(players.filter((player) => player._id !== playerId));
  };

  const bulkUpdatePlayers = async (
    campaignId: string,
    levelUp: boolean = false,
  ) => {
    if (!campaignId) return;

    await asyncFetch(updatePlayersMutation, {
      input: {
        campaignId,
        level: levelUp ? undefined : bulkLevel,
        levelUp,
      },
    });

    if (levelUp) {
      setPlayers(
        players.map((player) => {
          if (player.campaignId === campaignId) {
            return {
              ...player,
              level: (player.level || 1) + 1,
            };
          }

          return player;
        }),
      );
    } else {
      setPlayers(
        players.map((player) => {
          if (player.campaignId === campaignId) {
            const updated = { ...player };
            if (bulkLevel !== undefined) updated.level = bulkLevel;

            return updated;
          }

          return player;
        }),
      );
    }

    setBulkLevel(undefined);
  };

  const updatePlayerField = async (
    playerId: string,
    field: 'armorClass' | 'maxHP',
    value: number,
  ) => {
    const player = players.find((p) => p._id === playerId);
    if (!player) return;

    try {
      const response: {
        updatePlayer: Player | null;
      } = await asyncFetch(updatePlayerMutation, {
        input: {
          _id: player._id,
          name: player.name,
          campaignId: player.campaignId,
          level: player.level,
          armorClass: field === 'armorClass' ? value : player.armorClass,
          maxHP: field === 'maxHP' ? value : player.maxHP,
        },
      });

      if (response.updatePlayer) {
        setPlayers(
          players.map((p) => {
            if (p._id === playerId) {
              return {
                ...p,
                [field]: value,
              };
            }

            return p;
          }),
        );

        setEditingPlayer(null);
      } else {
        logger.error('Failed to update player field', {
          playerId,
          field,
          value,
          response,
        });
        alert('Failed to update player. Please try again.');
        setEditingPlayer(null);
      }
    } catch (error) {
      logger.error('Error updating player field', {
        playerId,
        field,
        value,
        error: error instanceof Error ? error.message : String(error),
      });
      alert('An error occurred while updating the player. Please try again.');
      setEditingPlayer(null);
    }
  };

  const startEditing = (playerId: string, field: 'armorClass' | 'maxHP') => {
    const player = players.find((p) => p._id === playerId);
    if (!player) return;

    setEditingPlayer({
      id: playerId,
      field,
      value: (player[field] as number) || 0,
    });
  };

  return (
    <>
      <Button
        label="Manage Players"
        onClick={showModal}
        className={
          buttonClassName
            ? `btn-accent ${buttonClassName}`
            : 'btn-accent btn-sm'
        }
      />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">
                    Player Name
                  </span>
                </label>
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
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">Level</span>
                </label>
                <FormInput
                  id="newPlayerLevel"
                  type="number"
                  placeholder="1"
                  min={1}
                  max={20}
                  value={
                    newPlayerLevel !== undefined
                      ? newPlayerLevel.toString()
                      : ''
                  }
                  onChange={(e) => setNewPlayerLevel(Number(e.target.value))}
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">
                    Armor Class
                  </span>
                </label>
                <FormInput
                  id="newPlayerAC"
                  type="number"
                  placeholder="Armor Class"
                  min={1}
                  value={
                    newPlayerAC !== undefined ? newPlayerAC.toString() : ''
                  }
                  onChange={(e) => setNewPlayerAC(Number(e.target.value))}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">
                    Hit Points
                  </span>
                </label>
                <FormInput
                  id="newPlayerHP"
                  type="number"
                  placeholder="Max HP"
                  min={1}
                  value={
                    newPlayerHP !== undefined ? newPlayerHP.toString() : ''
                  }
                  onChange={(e) => setNewPlayerHP(Number(e.target.value))}
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>

            <Button
              label="Add Player"
              variant="primary"
              disabled={!newPlayerName || !selectedCampaignId}
              onClick={() => {
                if (!newPlayerName || !selectedCampaignId) return;
                createPlayer(
                  newPlayerName,
                  selectedCampaignId,
                  newPlayerLevel,
                  newPlayerAC !== undefined ? newPlayerAC : undefined,
                  newPlayerHP !== undefined ? newPlayerHP : undefined,
                );
              }}
              className="w-full mt-3"
            />
          </div>

          {selectedCampaignId &&
            players.filter((p) => p.campaignId === selectedCampaignId).length >
              0 && (
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-sm opacity-70 mb-3">
                  Bulk Update Levels
                </h4>

                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="form-control flex-1">
                    <label className="label py-1"></label>
                    <FormInput
                      id="bulkLevel"
                      type="number"
                      placeholder="Set Level"
                      min={1}
                      max={20}
                      value={
                        bulkLevel !== undefined ? bulkLevel.toString() : ''
                      }
                      onChange={(e) => setBulkLevel(Number(e.target.value))}
                      className="input input-bordered input-sm w-full"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      label="Set Level For All"
                      variant="secondary"
                      disabled={!selectedCampaignId || bulkLevel === undefined}
                      onClick={() => {
                        if (!selectedCampaignId) return;
                        bulkUpdatePlayers(selectedCampaignId);
                      }}
                      className="btn-sm flex-1 md:flex-auto"
                    />
                    <Button
                      label="Level Up All"
                      variant="secondary"
                      disabled={!selectedCampaignId}
                      onClick={() => {
                        if (!selectedCampaignId) return;
                        bulkUpdatePlayers(selectedCampaignId, true);
                      }}
                      className="btn-sm flex-1 md:flex-auto"
                    />
                  </div>
                </div>
              </div>
            )}

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
                      <th className="text-left">Level</th>
                      <th className="text-left">AC</th>
                      <th className="text-left">HP</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .filter(
                        (player) => player.campaignId === selectedCampaignId,
                      )
                      .map((player, _index) => (
                        <tr key={player._id} className="hover:bg-base-200">
                          <td className="font-medium">{player.name}</td>
                          <td>{player.level || 1}</td>
                          <td>
                            {editingPlayer?.id === player._id &&
                            editingPlayer.field === 'armorClass' ? (
                              <div className="flex items-center gap-1">
                                <FormInput
                                  id={`edit-ac-${player._id}`}
                                  type="number"
                                  value={editingPlayer.value.toString()}
                                  onChange={(e) =>
                                    setEditingPlayer({
                                      ...editingPlayer,
                                      value: Number(e.target.value),
                                    })
                                  }
                                  className="input input-bordered input-xs w-14"
                                  min={1}
                                />
                                <Button
                                  label="✓"
                                  onClick={() =>
                                    updatePlayerField(
                                      player._id,
                                      'armorClass',
                                      editingPlayer.value,
                                    )
                                  }
                                  className="btn-xs btn-success"
                                />
                                <Button
                                  label="✕"
                                  onClick={() => setEditingPlayer(null)}
                                  className="btn-xs btn-error"
                                />
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  startEditing(player._id, 'armorClass')
                                }
                                className="cursor-pointer hover:underline"
                              >
                                {player.armorClass || '-'}
                              </div>
                            )}
                          </td>
                          <td>
                            {editingPlayer?.id === player._id &&
                            editingPlayer.field === 'maxHP' ? (
                              <div className="flex items-center gap-1">
                                <FormInput
                                  id={`edit-hp-${player._id}`}
                                  type="number"
                                  value={editingPlayer.value.toString()}
                                  onChange={(e) =>
                                    setEditingPlayer({
                                      ...editingPlayer,
                                      value: Number(e.target.value),
                                    })
                                  }
                                  className="input input-bordered input-xs w-14"
                                  min={1}
                                />
                                <Button
                                  label="✓"
                                  onClick={() =>
                                    updatePlayerField(
                                      player._id,
                                      'maxHP',
                                      editingPlayer.value,
                                    )
                                  }
                                  className="btn-xs btn-success"
                                />
                                <Button
                                  label="✕"
                                  onClick={() => setEditingPlayer(null)}
                                  className="btn-xs btn-error"
                                />
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  startEditing(player._id, 'maxHP')
                                }
                                className="cursor-pointer hover:underline"
                              >
                                {player.maxHP || '-'}
                              </div>
                            )}
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
