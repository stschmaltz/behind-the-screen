import React from 'react';
import { CoinIcon, EmptyLootIcon, TreasureChestIcon } from '../icons';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';

export type LootItemType = {
  level?: string;
  coins?: string;
  item?: string;
  description?: string;
  note?: string;
  source?: 'official' | 'random';
  rarity?: Rarity;
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
      <div className="card bg-base-100 shadow-xl h-full flex items-center justify-center">
        <div className="card-body text-center py-20">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <TreasureChestIcon className="w-24 h-24 mx-auto text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-semibold text-primary">
                  Generating loot...
                </p>
                <p className="text-base text-base-content/60">
                  Searching for treasures worthy of your adventure
                </p>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                <div
                  className="w-3 h-3 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <EmptyLootIcon className="w-20 h-20 mx-auto text-base-300" />
              <p className="text-xl text-base-content/60">
                Fill in the parameters and generate your loot!
              </p>
            </div>
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

  const getRarityColor = (rarity?: Rarity): string => {
    switch (rarity) {
      case 'common':
        return 'badge-ghost';
      case 'uncommon':
        return 'badge-success';
      case 'rare':
        return 'badge-info';
      case 'very rare':
        return 'badge-secondary';
      case 'legendary':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  const getRarityLabel = (rarity?: Rarity): string => {
    if (!rarity) return 'Common';

    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const hasJackpot = otherEntries.some(
    (e) => e.rarity === 'very rare' || e.rarity === 'legendary',
  );

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden h-full">
      <div className="bg-primary text-primary-content p-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <TreasureChestIcon className="w-7 h-7" />
          Generated Loot Table
        </h2>
        {context && <p className="text-sm opacity-90 mt-2">Theme: {context}</p>}
        {hasJackpot && (
          <div className="mt-3 px-4 py-2 bg-warning text-warning-content rounded-lg text-sm font-semibold animate-pulse">
            ✨ JACKPOT! You found rare treasure! ✨
          </div>
        )}
      </div>

      <div className="card-body divide-y divide-base-300 max-h-[65vh] overflow-y-auto">
        {sortedCoinEntries.length > 0 && (
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
              {sortedCoinEntries.map((entry, idx) => (
                <div key={idx} className="space-y-2">
                  {entry.level && (
                    <span className="text-xs sm:text-sm text-base-content/70 uppercase tracking-wider font-medium">
                      {entry.level}
                    </span>
                  )}
                  <div className="flex justify-center items-center gap-2 font-bold text-lg sm:text-xl">
                    <CoinIcon
                      className={`w-6 h-6 ${getCoinColor(entry.coins || '')}`}
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
          <div className="pt-6 flex flex-col gap-5">
            {otherEntries
              .filter((e) => e.item)
              .map((entry, index) => (
                <div key={index} className="pb-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-grow">
                      <span className="font-semibold mr-2 text-base-content/60">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{entry.item}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {entry.rarity && (
                        <span
                          className={`badge badge-lg ${getRarityColor(entry.rarity)} whitespace-nowrap`}
                        >
                          {getRarityLabel(entry.rarity)}
                        </span>
                      )}
                      {entry.source && (
                        <span
                          className={`badge badge-lg badge-outline whitespace-nowrap ${entry.source === 'official' ? 'badge-info' : 'badge-secondary'}`}
                        >
                          {sourceToDisplay(entry.source)}
                        </span>
                      )}
                    </div>
                  </div>
                  {entry.description && (
                    <div className="text-sm mt-2 text-base-content/75 ml-7 leading-relaxed">
                      {entry.description}
                    </div>
                  )}
                  {entry.note && (
                    <div className="text-sm italic mt-2 text-base-content/60 ml-7">
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
