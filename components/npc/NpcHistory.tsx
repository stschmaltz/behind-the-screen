import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { NpcGenerationEntry } from '../../hooks/use-npc-history.hook';

interface NpcHistoryProps {
  history: NpcGenerationEntry[];
  onSelect: (entry: NpcGenerationEntry) => void;
  onDelete: (timestamp: number) => void;
  onClear: () => void;
}

const NpcHistory: React.FC<NpcHistoryProps> = ({
  history,
  onSelect,
  onDelete,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`collapse collapse-arrow bg-base-100 shadow-lg rounded-box ${isOpen ? 'collapse-open' : ''}`}
    >
      <div
        className="collapse-title flex justify-between items-center cursor-pointer hover:bg-base-200/50 transition-colors py-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-lg">Generation History</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="btn btn-sm btn-outline btn-error pointer-events-auto"
        >
          Clear
        </button>
      </div>
      <div className="collapse-content">
        {history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-base text-base-content/50">
              No history yet. Generate some NPCs to get started!
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto py-2">
            {history.map((entry) => (
              <li key={entry.timestamp} className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="btn btn-ghost flex-1 text-left h-auto min-h-[3rem] py-3 px-4 justify-start hover:bg-base-200"
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <span className="overflow-hidden text-ellipsis line-clamp-2 flex-1">
                      {entry.npc.name} • {entry.npc.race} {entry.npc.occupation}
                      {entry.context && ` • ${entry.context}`}
                    </span>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xs opacity-70 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs opacity-70 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.timestamp)}
                  className="btn btn-square btn-ghost hover:btn-error flex-shrink-0"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NpcHistory;
