import React from 'react';

export interface AiModeConfig {
  enabled: boolean;
  fastMode: boolean;
  remainingUses: number;
  hasAvailableUses: boolean;
  hasRequestedMoreUses: boolean;
}

interface AiModeToggleProps {
  aiMode: AiModeConfig;
  onAiModeChange: (enabled: boolean) => void;
  onFastModeChange: (fastMode: boolean) => void;
  onRequestMoreUses: () => void;
  disabled: boolean;
}

export const AiModeToggle: React.FC<AiModeToggleProps> = ({
  aiMode,
  onAiModeChange,
  onFastModeChange,
  onRequestMoreUses,
  disabled,
}) => {
  const usageText = aiMode.hasAvailableUses
    ? aiMode.remainingUses > 1000
      ? 'Unlimited'
      : `${aiMode.remainingUses}/25 remaining (7-day window)`
    : 'No generations remaining';

  return (
    <div className="form-control">
      <div className="flex flex-wrap items-start gap-6">
        {/* AI Enhanced Toggle */}
        <label className="label cursor-pointer justify-start gap-3 py-1">
          <input
            type="checkbox"
            checked={aiMode.enabled}
            onChange={(e) => onAiModeChange(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
            disabled={disabled || !aiMode.hasAvailableUses}
          />
          <div className="flex flex-col">
            <span className="label-text font-semibold text-sm">
              AI Enhanced Mode
            </span>
            <span className="label-text-alt text-xs">{usageText}</span>
            {!aiMode.hasAvailableUses && !aiMode.hasRequestedMoreUses && (
              <button
                type="button"
                onClick={onRequestMoreUses}
                className="btn btn-xs btn-ghost mt-1 self-start p-0 h-auto min-h-0"
              >
                Request More Uses
              </button>
            )}
            {aiMode.hasRequestedMoreUses && (
              <span className="text-xs text-success mt-1">
                ✓ Request submitted
              </span>
            )}
          </div>
        </label>

        {/* Fast/Pro Mode Toggle - only shown when AI is enabled */}
        {aiMode.enabled && (
          <label className="label cursor-pointer justify-start gap-3 py-1 min-w-[160px]">
            <input
              type="checkbox"
              checked={!aiMode.fastMode}
              onChange={(e) => onFastModeChange(!e.target.checked)}
              className="toggle toggle-secondary toggle-sm"
              disabled={disabled}
            />
            <div className="flex flex-col">
              <span className="label-text font-semibold text-sm">
                {aiMode.fastMode ? 'Fast' : 'Pro'}
              </span>
              <span className="label-text-alt text-xs">
                {aiMode.fastMode ? 'Quick generation' : 'Higher quality'}
              </span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};
