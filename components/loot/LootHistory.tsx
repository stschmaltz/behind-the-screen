import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { GenerationEntry } from '../../hooks/use-loot-history.hook';

interface LootHistoryProps {
  history: GenerationEntry[];
  onSelect: (entry: GenerationEntry) => void;
  onDelete: (timestamp: number) => void;
}

const LootHistory: React.FC<LootHistoryProps> = ({
  history,
  onSelect,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="collapse collapse-arrow bg-base-200 mt-4">
      <input
        type="checkbox"
        checked={isOpen}
        onChange={(e) => setIsOpen(e.target.checked)}
      />
      <div className="collapse-title font-medium">History</div>
      <div className="collapse-content">
        {history.length === 0 ? (
          <p className="text-sm text-base-content/70">No history yet.</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <li
                key={entry.timestamp}
                className="flex items-center justify-between"
              >
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="btn btn-sm btn-outline flex-1 text-left"
                >
                  <div className="flex justify-between">
                    <span>
                      Lv {entry.partyLevel}, SRD {entry.srdItemCount}, Rand{' '}
                      {entry.randomItemCount}
                      {entry.context && ` (${entry.context})`}
                    </span>
                    <span className="text-xs opacity-70 ml-2">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
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
