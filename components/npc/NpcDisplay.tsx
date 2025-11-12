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
        <div className="card-body py-20">
          <div className="flex flex-col items-center justify-center space-y-6">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <div className="space-y-2 text-center">
              <p className="text-2xl font-semibold text-primary">
                Generating your NPC...
              </p>
              <p className="text-base text-base-content/60">
                Creating a unique character
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!npc) {
    return (
      <div className="card bg-base-100 shadow-xl h-fit">
        <div className="card-body py-20">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <UserIcon className="w-20 h-20 text-base-300" />
            <p className="text-xl text-base-content/60">
              Generate an NPC to see the results here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl h-fit">
      <div className="card-body p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
          <UserIcon className="w-10 h-10 text-primary" />
          <h2 className="card-title text-3xl font-bold">{npc.name}</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm text-base-content/60 uppercase tracking-wide mb-1">
                Race
              </h3>
              <p className="text-base font-medium">{npc.race}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/60 uppercase tracking-wide mb-1">
                Gender
              </h3>
              <p className="text-base font-medium">{npc.gender}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/60 uppercase tracking-wide mb-1">
                Age
              </h3>
              <p className="text-base font-medium">{npc.age}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-base-content/60 uppercase tracking-wide mb-1">
                Occupation
              </h3>
              <p className="text-base font-medium">{npc.occupation}</p>
            </div>
          </div>

          <div className="divider my-6"></div>

          <div>
            <h3 className="font-semibold text-base text-base-content/80 mb-3">
              Appearance
            </h3>
            <p className="text-base leading-relaxed">{npc.appearance}</p>
          </div>

          <div>
            <h3 className="font-semibold text-base text-base-content/80 mb-3">
              Personality
            </h3>
            <p className="text-base leading-relaxed">{npc.personality}</p>
          </div>

          <div>
            <h3 className="font-semibold text-base text-base-content/80 mb-3">
              Quirk
            </h3>
            <p className="text-base leading-relaxed">{npc.quirk}</p>
          </div>

          <div>
            <h3 className="font-semibold text-base text-base-content/80 mb-3">
              Motivation
            </h3>
            <p className="text-base leading-relaxed">{npc.motivation}</p>
          </div>

          {npc.secret && (
            <>
              <div className="divider my-6"></div>
              <div className="bg-warning/10 p-5 rounded-lg border border-warning/20">
                <h3 className="font-semibold text-base text-warning mb-3 flex items-center gap-2">
                  <span>Secret</span>
                </h3>
                <p className="text-base leading-relaxed">{npc.secret}</p>
              </div>
            </>
          )}

          {npc.background && (
            <>
              <div className="divider my-6"></div>
              <div className="bg-info/10 p-5 rounded-lg border border-info/20">
                <h3 className="font-semibold text-base text-info mb-3 flex items-center gap-2">
                  <span>Background</span>
                </h3>
                <p className="text-base leading-relaxed">{npc.background}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NpcDisplay;
