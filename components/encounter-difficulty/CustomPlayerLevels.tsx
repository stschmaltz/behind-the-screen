import React from 'react';

export interface CustomPlayerLevelsProps {
  useCustomLevels: boolean;
  setUseCustomLevels: (v: boolean) => void;
  useCampaignPlayers: boolean;
  hasCampaignPlayers: boolean;
  hasVaryingLevels: boolean;
  customLevels: number[];
  handleLevelChange: (index: number, level: number) => void;
  resetToDefaultLevels: () => void;
}

export function CustomPlayerLevels({
  useCustomLevels,
  setUseCustomLevels,
  useCampaignPlayers,
  hasCampaignPlayers,
  hasVaryingLevels,
  customLevels,
  handleLevelChange,
  resetToDefaultLevels,
}: CustomPlayerLevelsProps) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        {(!useCampaignPlayers || !hasCampaignPlayers) && (
          <label className="label cursor-pointer inline-flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mr-2"
              checked={useCustomLevels}
              onChange={(e) => {
                setUseCustomLevels(e.target.checked);
                if (e.target.checked) {
                  resetToDefaultLevels();
                }
              }}
              disabled={
                useCampaignPlayers && hasCampaignPlayers && hasVaryingLevels
              }
            />
            <span className="label-text">Use custom player levels</span>
          </label>
        )}
      </div>
      {useCustomLevels && !useCampaignPlayers && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="label-text">Individual Player Levels</label>
            <button
              className="btn btn-xs btn-ghost"
              onClick={resetToDefaultLevels}
            >
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {customLevels.map((level, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ maxWidth: '120px' }}
                >
                  {`Player ${index + 1}`}:
                </span>
                <select
                  className="select select-bordered select-sm w-20"
                  value={level}
                  onChange={(e) =>
                    handleLevelChange(index, Number(e.target.value))
                  }
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
