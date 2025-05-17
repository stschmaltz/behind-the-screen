import React from 'react';
import { useEncounterDifficultyCalculatorState } from './EncounterDifficultyCalculatorState';
import { CampaignPlayerToggle } from './CampaignPlayerToggle';
import { PlayerCountAndLevel } from './PlayerCountAndLevel';
import { CustomPlayerLevels } from './CustomPlayerLevels';
import { DifficultyResultPanel } from './DifficultyResultPanel';
import {
  capitalizeFirstLetter,
  getDifficultyClass,
  getDifficultyTooltip,
} from './DifficultyCalculatorCore';
import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../../types/encounters';
import type { Player } from '../../src/generated/graphql';

interface EncounterDifficultyProps {
  enemies: EncounterCharacter[];
  initiativeOrder?: InitiativeOrderCharacter[];
  players?: Player[];
}

function VaryingLevelsInfo() {
  return (
    <div className="text-sm text-info mt-1">
      Campaign players have different levels, using individual levels by default
    </div>
  );
}

export const EncounterDifficultyCalculator: React.FC<
  EncounterDifficultyProps
> = ({ enemies, initiativeOrder = [], players = [] }) => {
  const state = useEncounterDifficultyCalculatorState({
    enemies,
    initiativeOrder,
    players,
  });

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-lg font-medium flex items-center peer-checked:bg-base-200 peer-checked:text-base-content">
        <span>Encounter Difficulty</span>
        {state.difficultyResult && (
          <div
            className="tooltip tooltip-right ml-2"
            data-tip={getDifficultyTooltip(
              state.difficultyResult.difficulty,
              state.difficultyResult.adjustedXp,
              state.difficultyResult.thresholds,
            )}
            data-tip-class="max-w-md whitespace-pre-line p-2"
          >
            <span
              className={`${getDifficultyClass(state.difficultyResult.difficulty)} cursor-help`}
            >
              ({capitalizeFirstLetter(state.difficultyResult.difficulty)})
            </span>
          </div>
        )}
      </div>
      <div className="collapse-content peer-checked:bg-base-100 peer-checked:text-base-content">
        <div className="p-2">
          <CampaignPlayerToggle
            campaignId={state.campaignId}
            useCampaignPlayers={state.useCampaignPlayers}
            setUseCampaignPlayers={state.setUseCampaignPlayers}
            hasCampaignPlayers={state.hasCampaignPlayers}
            playersLoading={state.playersLoading}
            campaignPlayers={state.campaignPlayers}
            campaignPlayerLevels={state.campaignPlayerLevels}
            hasVaryingLevels={state.hasVaryingLevels}
            setPlayerCount={state.setPlayerCount}
            setUseCustomLevels={state.setUseCustomLevels}
            setUniformLevel={state.setUniformLevel}
          />
          <PlayerCountAndLevel
            playerCount={state.playerCount}
            setPlayerCount={state.setPlayerCount}
            uniformLevel={state.uniformLevel}
            setUniformLevel={state.setUniformLevel}
            useCampaignPlayers={state.useCampaignPlayers}
            hasCampaignPlayers={state.hasCampaignPlayers}
            useCustomLevels={state.useCustomLevels}
          />
          <CustomPlayerLevels
            useCustomLevels={state.useCustomLevels}
            setUseCustomLevels={state.setUseCustomLevels}
            useCampaignPlayers={state.useCampaignPlayers}
            hasCampaignPlayers={state.hasCampaignPlayers}
            hasVaryingLevels={state.hasVaryingLevels}
            customLevels={state.customLevels}
            handleLevelChange={state.handleLevelChange}
            resetToDefaultLevels={state.resetToDefaultLevels}
          />
          {state.useCampaignPlayers &&
            state.hasCampaignPlayers &&
            state.hasVaryingLevels && <VaryingLevelsInfo />}
          <DifficultyResultPanel difficultyResult={state.difficultyResult} />
        </div>
      </div>
    </div>
  );
};

export default EncounterDifficultyCalculator;
