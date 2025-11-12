import React, { useState } from 'react';
import type { Player } from '../generated/graphql';

interface PlayerCardProps {
  player: Player;
  onDeletePlayer: (playerId: string) => void;
  onUpdatePlayerField: (
    playerId: string,
    field: 'armorClass' | 'maxHP' | 'level',
    value: number,
  ) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onDeletePlayer,
  onUpdatePlayerField,
}) => {
  const [editing, setEditing] = useState<
    'armorClass' | 'maxHP' | 'level' | null
  >(null);
  const [editValue, setEditValue] = useState<number>(0);

  const startEditing = (field: 'armorClass' | 'maxHP' | 'level') => {
    setEditing(field);
    setEditValue((player[field] as number) || 0);
  };

  const submitEdit = () => {
    if (editing) {
      onUpdatePlayerField(player._id, editing, editValue);
      setEditing(null);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  return (
    <tr className="hover transition-colors duration-200">
      <td className="font-semibold">{player.name}</td>
      <td>
        {editing === 'armorClass' ? (
          <div className="flex items-center space-x-2 slide-down">
            <input
              type="number"
              className="input input-bordered input-sm w-16 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              className="btn btn-xs btn-primary hover:scale-105 transition-transform duration-200"
              onClick={submitEdit}
            >
              Save
            </button>
            <button
              className="btn btn-xs hover:scale-105 transition-transform duration-200"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
            onClick={() => startEditing('armorClass')}
            title="Click to edit AC"
          >
            {player.armorClass || '—'}
          </div>
        )}
      </td>
      <td>
        {editing === 'maxHP' ? (
          <div className="flex items-center space-x-2 slide-down">
            <input
              type="number"
              className="input input-bordered input-sm w-16 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              className="btn btn-xs btn-primary hover:scale-105 transition-transform duration-200"
              onClick={submitEdit}
            >
              Save
            </button>
            <button
              className="btn btn-xs hover:scale-105 transition-transform duration-200"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
            onClick={() => startEditing('maxHP')}
            title="Click to edit HP"
          >
            {player.maxHP || '—'}
          </div>
        )}
      </td>
      <td>
        {editing === 'level' ? (
          <div className="flex items-center space-x-2 slide-down">
            <input
              type="number"
              className="input input-bordered input-sm w-16 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={editValue}
              min={1}
              max={20}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 1)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              className="btn btn-xs btn-primary hover:scale-105 transition-transform duration-200"
              onClick={submitEdit}
            >
              Save
            </button>
            <button
              className="btn btn-xs hover:scale-105 transition-transform duration-200"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
            onClick={() => startEditing('level')}
            title="Click to edit Level"
          >
            {player.level || 1}
          </div>
        )}
      </td>
      <td>
        <button
          className="btn btn-xs btn-ghost text-error hover:scale-105 hover:bg-error/10 transition-all duration-200 active:scale-95"
          onClick={() => onDeletePlayer(player._id)}
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default PlayerCard;
