import React from 'react';
import { NpcType } from '../../types/npc';
import { UserIcon } from '../icons';

interface NpcDisplayProps {
  npc: NpcType | null;
  isGenerating: boolean;
}

const NpcDisplay: React.FC<NpcDisplayProps> = ({ npc, isGenerating }) => {
  if (isGenerating) {
    return (
      <div className="card bg-base-100 shadow-xl h-fit">
        <div className="card-body">
          <div className="flex flex-col items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <p className="text-lg">Generating your NPC...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!npc) {
    return (
      <div className="card bg-base-100 shadow-xl h-fit">
        <div className="card-body">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserIcon className="w-16 h-16 text-base-300 mb-4" />
            <p className="text-lg text-base-content/70">
              Generate an NPC to see the results here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl h-fit">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="w-8 h-8 text-primary" />
          <h2 className="card-title text-2xl">{npc.name}</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-base-content/70">
                Race
              </h3>
              <p className="text-base">{npc.race}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/70">
                Gender
              </h3>
              <p className="text-base">{npc.gender}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/70">
                Age
              </h3>
              <p className="text-base">{npc.age}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/70">
                Occupation
              </h3>
              <p className="text-base">{npc.occupation}</p>
            </div>
          </div>

          <div className="divider"></div>

          <div>
            <h3 className="font-semibold text-sm text-base-content/70 mb-2">
              Appearance
            </h3>
            <p className="text-base">{npc.appearance}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-base-content/70 mb-2">
              Personality
            </h3>
            <p className="text-base">{npc.personality}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-base-content/70 mb-2">
              Quirk
            </h3>
            <p className="text-base">{npc.quirk}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-base-content/70 mb-2">
              Motivation
            </h3>
            <p className="text-base">{npc.motivation}</p>
          </div>

          {npc.secret && (
            <>
              <div className="divider"></div>
              <div className="bg-warning/10 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-warning mb-2">
                  Secret
                </h3>
                <p className="text-base">{npc.secret}</p>
              </div>
            </>
          )}

          {npc.background && (
            <>
              <div className="divider"></div>
              <div className="bg-info/10 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-info mb-2">
                  Background
                </h3>
                <p className="text-base">{npc.background}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NpcDisplay;
