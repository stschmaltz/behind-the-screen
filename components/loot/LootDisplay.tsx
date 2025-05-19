import React from 'react';
import { CoinIcon, EmptyLootIcon, TreasureChestIcon } from '../icons';

export type LootItemType = {
  level?: string;
  coins?: string;
  item?: string;
  description?: string;
  note?: string;
  source?: 'official' | 'random';
};

interface LootDisplayProps {
  loot: LootItemType[] | null;
  context: string;
  isGenerating: boolean;
}

const LootDisplay: React.FC<LootDisplayProps> = ({
  loot,
  context,
  isGenerating,
}) => {
  if (!loot) {
    return (
      <div className="card bg-base-100 shadow-xl h-full flex items-center justify-center p-8 max-w-xl max-h-96">
        <div className="text-center space-y-4">
          {isGenerating ? (
            <>
              <div className="relative">
                <TreasureChestIcon className="w-20 h-20 mx-auto text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-medium text-primary">
                  Generating loot...
                </p>
                <p className="text-sm text-base-content/70">
                  Searching for treasures worthy of your adventure
                </p>
              </div>
              <div className="flex justify-center space-x-1 mt-2">
                <div
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <EmptyLootIcon className="w-16 h-16 mx-auto text-base-300" />
              <p className="text-xl text-base-content/70">
                Fill in the parameters and generate your loot!
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const coinEntries = loot.filter((e) => e.coins);
  const otherEntries = loot.filter((e) => !e.coins);

  // Pre-defined ordering for typical loot tiers. Anything unrecognised will follow in original order.
  const levelOrder = ['low', 'mid', 'high'];
  const sortedCoinEntries = [...coinEntries].sort((a, b) => {
    const aIndex = levelOrder.indexOf((a.level || '').toLowerCase());
    const bIndex = levelOrder.indexOf((b.level || '').toLowerCase());

    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  const getCoinColor = (coinString: string): string => {
    if (coinString.includes('cp')) return 'text-amber-600';
    if (coinString.includes('sp')) return 'text-gray-400';
    if (coinString.includes('ep')) return 'text-blue-300';
    if (coinString.includes('gp')) return 'text-yellow-400';
    if (coinString.includes('pp')) return 'text-blue-500';

    return 'text-accent';
  };

  const sourceToDisplay = (source: string): string => {
    if (source === 'official') return 'Official';
    if (source === 'random') return 'AI Gen';

    return source;
  };

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden h-full">
      <div className="bg-primary text-primary-content p-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TreasureChestIcon className="w-6 h-6" />
          Generated Loot
        </h2>
        {context && <p className="text-sm opacity-80 mt-1">Theme: {context}</p>}
      </div>

      <div className="card-body divide-y divide-base-300 max-h-[60vh] overflow-y-auto">
        {sortedCoinEntries.length > 0 && (
          <div className="py-1">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              {sortedCoinEntries.map((entry, idx) => (
                <div key={idx} className="space-y-1">
                  {entry.level && (
                    <span className="text-xs sm:text-sm text-base-content/70 uppercase tracking-wide">
                      {entry.level}
                    </span>
                  )}
                  <div className="flex justify-center items-center gap-1 font-bold text-base sm:text-lg">
                    <CoinIcon
                      className={`w-5 h-5 ${getCoinColor(entry.coins || '')}`}
                    />
                    <span className={getCoinColor(entry.coins || '')}>
                      {entry.coins}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {otherEntries.length > 0 && (
          <div className="pt-4 flex flex-col gap-4">
            {otherEntries.map((entry, index) => (
              <div key={index} className="">
                <div className="flex items-start">
                  <div className="flex-grow">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    {entry.item}
                  </div>
                  {entry.source && (
                    <span
                      className={`badge badge-outline whitespace-nowrap ${entry.source === 'official' ? 'badge-info' : 'badge-secondary'} ml-2`}
                    >
                      {sourceToDisplay(entry.source)}
                    </span>
                  )}
                </div>
                {entry.description && (
                  <div className="text-sm mt-1 text-base-content/80 ml-6">
                    {entry.description}
                  </div>
                )}
                {entry.note && (
                  <div className="text-sm italic mt-1 text-base-content/70 ml-6">
                    {entry.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LootDisplay;
