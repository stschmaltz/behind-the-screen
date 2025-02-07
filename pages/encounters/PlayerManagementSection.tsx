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

interface Props {
  startingPlayers: Player[];
}

const PlayerManagementSection: React.FC<Props> = ({ startingPlayers }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const { closeModal, showModal } = useModal('player-management-modal');
  const [newPlayerName, setNewPlayerName] = useState('');
  useEffect(() => {
    setPlayers(startingPlayers);
  }, [startingPlayers]);

  const savePlayer = async (newPlayerName: string) => {
    const response: {
      savePlayer: Player;
    } = await asyncFetch(savePlayerMutation, {
      input: {
        name: newPlayerName,
      },
    });

    if (!response.savePlayer._id) return;

    setPlayers([
      ...players,
      { _id: response.savePlayer._id, name: response.savePlayer.name },
    ]);
    setNewPlayerName('');
  };

  const deletePlayer = async (playerId: string) => {
    await asyncFetch(deletePlayerMutation, {
      id: playerId,
    });
    setPlayers(players.filter((player) => player._id !== playerId));
  };

  return (
    <>
      <Button label="Manage Players" onClick={showModal} />
      <dialog
        id="player-management-modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg mb-4">Players</h3>
          <div className="flex flex-col gap-2 mb-4">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-base-200 rounded text-sm"
              >
                <span className="font-medium">{player.name}</span>
                <Button
                  label="Delete"
                  onClick={() => {
                    deletePlayer(player._id);
                  }}
                  variant="error"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <FormInput
              id="newPlayer"
              type="text"
              placeholder="New Player Name"
              onChange={(event) => {
                setNewPlayerName(event.target.value);
              }}
              value={newPlayerName}
              className="input input-bordered w-full"
            />
            <Button
              label="Save"
              variant="primary"
              disabled={!newPlayerName}
              onClick={() => {
                if (!newPlayerName) return;
                savePlayer(newPlayerName);
              }}
            />
          </div>
          <div className="modal-action">
            <Button variant="secondary" label="close" onClick={closeModal} />
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default PlayerManagementSection;
