import React from 'react';
import { CoinIcon, EmptyLootIcon, TreasureChestIcon } from '../icons';

export type LootItemType = {
  coins?: string;
  item?: string;
  note?: string;
  source?: 'official' | 'random';
};

interface LootDisplayProps {
  loot: LootItemType[] | null;
  context: string;
}

const LootDisplay: React.FC<LootDisplayProps> = ({ loot, context }) => {
  if (!loot) {
    return (
      <div className="card bg-base-100 shadow-xl h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <EmptyLootIcon className="w-16 h-16 mx-auto text-base-300" />
          <p className="text-xl text-base-content/70">
            Fill in the parameters and generate your loot!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden h-full">
      <div className="bg-primary text-primary-content p-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TreasureChestIcon className="w-6 h-6" />
          Generated Loot
        </h2>
        {context && <p className="text-sm opacity-80 mt-1">Theme: {context}</p>}
      </div>

      <div className="card-body divide-y divide-base-300">
        {loot.map((entry, index) => (
          <div
            key={index}
            className={`py-3 ${index === 0 ? 'pt-0' : ''} ${index === loot.length - 1 ? 'pb-0' : ''}`}
          >
            {entry.coins && (
              <div className="flex items-center gap-2 font-bold text-accent mb-1">
                <CoinIcon className="w-5 h-5" />
                {entry.coins}
              </div>
            )}

            {entry.item && (
              <div className="flex items-start">
                <div className="flex-grow">{entry.item}</div>
                {entry.source && (
                  <span
                    className={`badge ${entry.source === 'official' ? 'badge-info' : 'badge-secondary'} ml-2`}
                  >
                    {entry.source}
                  </span>
                )}
              </div>
            )}

            {entry.note && (
              <div className="text-sm italic mt-1 text-base-content/70">
                {entry.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LootDisplay;
