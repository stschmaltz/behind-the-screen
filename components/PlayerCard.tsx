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
    <tr className="hover">
      <td className="font-semibold">{player.name}</td>
      <td>
        {editing === 'armorClass' ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="input input-bordered input-sm w-16"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button className="btn btn-xs btn-primary" onClick={submitEdit}>
              Save
            </button>
            <button className="btn btn-xs" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => startEditing('armorClass')}
            title="Click to edit AC"
          >
            {player.armorClass || '—'}
          </div>
        )}
      </td>
      <td>
        {editing === 'maxHP' ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="input input-bordered input-sm w-16"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button className="btn btn-xs btn-primary" onClick={submitEdit}>
              Save
            </button>
            <button className="btn btn-xs" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => startEditing('maxHP')}
            title="Click to edit HP"
          >
            {player.maxHP || '—'}
          </div>
        )}
      </td>
      <td>
        {editing === 'level' ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="input input-bordered input-sm w-16"
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
            <button className="btn btn-xs btn-primary" onClick={submitEdit}>
              Save
            </button>
            <button className="btn btn-xs" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => startEditing('level')}
            title="Click to edit Level"
          >
            {player.level || 1}
          </div>
        )}
      </td>
      <td>
        <button
          className="btn btn-xs btn-ghost text-error"
          onClick={() => onDeletePlayer(player._id)}
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default PlayerCard;
