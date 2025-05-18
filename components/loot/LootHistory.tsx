import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { GenerationEntry } from '../../hooks/use-loot-history.hook';

interface LootHistoryProps {
  history: GenerationEntry[];
  onSelect: (entry: GenerationEntry) => void;
  onDelete: (timestamp: number) => void;
  onClear: () => void;
}

const LootHistory: React.FC<LootHistoryProps> = ({
  history,
  onSelect,
  onDelete,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`collapse collapse-arrow bg-base-200 mt-4 ${isOpen ? 'collapse-open' : ''}`}
    >
      <div
        className="collapse-title flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">History</span>
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
          <p className="text-sm text-base-content/70">No history yet.</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto ">
            {history.map((entry) => (
              <li key={entry.timestamp} className="flex items-center w-full">
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="btn btn-sm btn-outline flex-1 text-left max-h-16 h-auto md:h-auto w-full px-6"
                >
                  <div className="flex justify-between max-h-8 w-full">
                    <span className="overflow-hidden text-ellipsis max-w-[450px]">
                      Lv {entry.partyLevel}, SRD {entry.srdItemCount}, Rand{' '}
                      {entry.randomItemCount} {entry.context}
                    </span>
                    <div className="flex flex-col ml-2">
                      <span className="text-xs opacity-70 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
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
                  className="btn btn-sm btn-square btn-error ml-2 bg-error/25 border-error/40"
                >
                  <TrashIcon className="w-4 h-4 text-white" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LootHistory;
