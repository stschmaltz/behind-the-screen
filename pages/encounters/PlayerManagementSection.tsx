import React from 'react';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import type { Player } from '../../generated/graphql';
import { useModal } from '../../hooks/use-modal';
import { useActiveCampaign } from '../../context/ActiveCampaignContext';
import PlayerCard from '../../components/PlayerCard';
import { usePlayerManagement } from '../../hooks/usePlayerManagement';

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
  const { closeModal, showModal } = useModal('player-management-modal');
  const { campaigns = [], campaignsLoading } = useActiveCampaign();

  const {
    players,
    newPlayerName,
    newPlayerLevel,
    newPlayerAC,
    newPlayerHP,
    bulkLevel,
    selectedCampaignId,
    createPlayer,
    deletePlayer,
    bulkUpdatePlayers,
    updatePlayerField,
    setField,
  } = usePlayerManagement(startingPlayers, campaignId);

  const handleCreatePlayer = async () => {
    if (!newPlayerName || !selectedCampaignId) return;

    await createPlayer(
      newPlayerName,
      selectedCampaignId,
      newPlayerLevel,
      newPlayerAC,
      newPlayerHP,
    );
  };
  const campaignsLoaded =
    !campaignsLoading && campaigns?.length && campaigns.length > 0;

  return (
    <>
      <Button
        variant="secondary"
        label="Manage Players"
        onClick={() => showModal()}
        className={buttonClassName}
      />

      <dialog id="player-management-modal" className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">Player Management</h3>

          <div className="mb-6">
            <div className="form-control w-full md:w-72">
              {campaignsLoaded && (
                <div className="form-control w-full">
                  <label htmlFor="campaign-select" className="label">
                    <span className="label-text">Campaign</span>
                  </label>
                  <select
                    id="campaign-select"
                    className="select select-bordered w-full"
                    value={selectedCampaignId || ''}
                    onChange={(e) =>
                      setField('selectedCampaignId', e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select campaign
                    </option>
                    {campaigns?.map((campaign) => (
                      <option key={campaign._id} value={campaign._id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-4 ">
              <div className="form-control flex-1">
                <FormInput
                  id="player-name"
                  label="Player Name"
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setField('newPlayerName', e.target.value)}
                />
              </div>

              <div className="form-control w-full md:w-16 ">
                <FormInput
                  id="player-level"
                  label="Level"
                  type="number"
                  placeholder="1"
                  value={newPlayerLevel}
                  onChange={(e) =>
                    setField('newPlayerLevel', parseInt(e.target.value) || 1)
                  }
                  min={1}
                  max={20}
                />
              </div>

              <div className="form-control w-full md:w-24">
                <FormInput
                  id="player-ac"
                  label="AC (Optional)"
                  type="number"
                  placeholder="AC"
                  value={newPlayerAC || ''}
                  onChange={(e) =>
                    setField(
                      'newPlayerAC',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                />
              </div>

              <div className="form-control w-full md:w-24">
                <FormInput
                  id="player-hp"
                  label="HP (Optional)"
                  type="number"
                  placeholder="HP"
                  value={newPlayerHP || ''}
                  onChange={(e) =>
                    setField(
                      'newPlayerHP',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                />
              </div>

              <div className="flex flex-col md:flex-row w-full items-end">
                <Button
                  label="Add Player"
                  onClick={handleCreatePlayer}
                  disabled={!newPlayerName || !selectedCampaignId}
                  className="w-full "
                />
              </div>
            </div>

            <div className="divider"></div>

            <div className="overflow-x-auto">
              {campaignsLoaded && (
                <div className="flex items-end gap-4">
                  <div className="form-control">
                    <FormInput
                      id="bulk-level"
                      label="Set Level For All"
                      type="number"
                      placeholder="New level"
                      value={bulkLevel || ''}
                      onChange={(e) =>
                        setField(
                          'bulkLevel',
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      min={1}
                      max={20}
                    />
                  </div>
                  <Button
                    label="Apply"
                    onClick={() =>
                      selectedCampaignId &&
                      bulkUpdatePlayers(selectedCampaignId)
                    }
                    disabled={
                      !bulkLevel ||
                      !selectedCampaignId ||
                      players.filter((p) => p.campaignId === selectedCampaignId)
                        .length === 0
                    }
                    className="btn-sm"
                  />
                  <Button
                    label="Level Up All"
                    onClick={() =>
                      selectedCampaignId &&
                      bulkUpdatePlayers(selectedCampaignId, true)
                    }
                    disabled={
                      !selectedCampaignId ||
                      players.filter((p) => p.campaignId === selectedCampaignId)
                        .length === 0
                    }
                    className="btn-sm"
                  />
                </div>
              )}
              <div className="flex justify-between items-end mb-4">
                <h4 className="font-semibold text-lg">Players</h4>
              </div>

              {players.length === 0 ? (
                <p className="text-sm">No players added yet.</p>
              ) : (
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>AC</th>
                      <th>HP</th>
                      <th>Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .filter(
                        (player) =>
                          !selectedCampaignId ||
                          player.campaignId === selectedCampaignId,
                      )
                      .map((player) => (
                        <PlayerCard
                          key={player._id}
                          player={player}
                          onDeletePlayer={deletePlayer}
                          onUpdatePlayerField={updatePlayerField}
                        />
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <Button label="Close" onClick={closeModal} />
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default PlayerManagementSection;
