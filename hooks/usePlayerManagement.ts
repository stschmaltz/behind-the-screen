import { useState, useEffect } from 'react';
import type { Player } from '../generated/graphql';
import { asyncFetch } from '../data/graphql/graphql-fetcher';
import {
  createPlayerMutation,
  deletePlayerMutation,
  updatePlayerMutation,
  updatePlayersMutation,
} from '../data/graphql/snippets/player';
import type {
  CreatePlayerMutation,
  UpdatePlayerMutation,
  DeletePlayerMutation,
  UpdatePlayersMutation,
} from '../generated/graphql';
import { logger } from '../lib/logger';

export interface PlayerManagementState {
  players: Player[];
  newPlayerName: string;
  newPlayerLevel: number;
  newPlayerAC?: number;
  newPlayerHP?: number;
  bulkLevel?: number;
  editingPlayer: {
    id: string;
    field: 'armorClass' | 'maxHP' | 'level';
    value: number;
  } | null;
  selectedCampaignId?: string;
}

export const usePlayerManagement = (
  startingPlayers: Player[],
  initialCampaignId?: string,
) => {
  const [state, setState] = useState<PlayerManagementState>({
    players: [],
    newPlayerName: '',
    newPlayerLevel: 1,
    newPlayerAC: undefined,
    newPlayerHP: undefined,
    bulkLevel: undefined,
    editingPlayer: null,
    selectedCampaignId: initialCampaignId,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, players: startingPlayers }));
  }, [startingPlayers]);

  useEffect(() => {
    setState((prev) => ({ ...prev, selectedCampaignId: initialCampaignId }));
  }, [initialCampaignId]);

  const createPlayer = async (
    playerName: string,
    playerCampaignId: string,
    level: number = 1,
    armorClass?: number,
    maxHP?: number,
  ) => {
    if (!playerCampaignId) {
      logger.error('Campaign ID is required to create a player');
      return;
    }

    const response = await asyncFetch<CreatePlayerMutation>(
      createPlayerMutation,
      {
        input: {
          name: playerName,
          campaignId: playerCampaignId,
          level,
          armorClass,
          maxHP,
        },
      },
    );
    const newPlayer = response.createPlayer;
    if (!newPlayer || !newPlayer._id) return;

    setState((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
      newPlayerName: '',
      newPlayerLevel: 1,
      newPlayerAC: undefined,
      newPlayerHP: undefined,
    }));
  };

  const deletePlayer = async (playerId: string) => {
    await asyncFetch<DeletePlayerMutation>(deletePlayerMutation, {
      id: playerId,
    });
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player._id !== playerId),
    }));
  };

  const bulkUpdatePlayers = async (
    campaignId: string,
    levelUp: boolean = false,
  ) => {
    if (!campaignId) return;

    await asyncFetch<UpdatePlayersMutation>(updatePlayersMutation, {
      input: {
        campaignId,
        level: levelUp ? undefined : state.bulkLevel,
        levelUp,
      },
    });

    if (levelUp) {
      setState((prev) => ({
        ...prev,
        players: prev.players.map((player) => {
          if (player.campaignId === campaignId) {
            return {
              ...player,
              level: (player.level || 1) + 1,
            };
          }
          return player;
        }),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        players: prev.players.map((player) => {
          if (player.campaignId === campaignId) {
            const updated = { ...player };
            if (prev.bulkLevel !== undefined) updated.level = prev.bulkLevel;
            return updated;
          }
          return player;
        }),
        bulkLevel: undefined,
      }));
    }
  };

  const updatePlayerField = async (
    playerId: string,
    field: 'armorClass' | 'maxHP' | 'level',
    value: number,
  ) => {
    const player = state.players.find((p) => p._id === playerId);
    if (!player) return;

    try {
      const response = await asyncFetch<UpdatePlayerMutation>(
        updatePlayerMutation,
        {
          input: {
            _id: player._id,
            name: player.name,
            campaignId: player.campaignId,
            level: field === 'level' ? value : player.level,
            armorClass: field === 'armorClass' ? value : player.armorClass,
            maxHP: field === 'maxHP' ? value : player.maxHP,
          },
        },
      );

      if (response.updatePlayer) {
        setState((prev) => ({
          ...prev,
          players: prev.players.map((p) => {
            if (p._id === playerId) {
              return {
                ...p,
                [field]: value,
              };
            }
            return p;
          }),
          editingPlayer: null,
        }));
      } else {
        logger.error('Failed to update player field', {
          playerId,
          field,
          value,
          response,
        });
        alert('Failed to update player. Please try again.');
        setState((prev) => ({ ...prev, editingPlayer: null }));
      }
    } catch (error) {
      logger.error('Error updating player field', {
        playerId,
        field,
        value,
        error,
      });
      alert('Error updating player. Please try again.');
      setState((prev) => ({ ...prev, editingPlayer: null }));
    }
  };

  const setEditingPlayer = (
    id: string,
    field: 'armorClass' | 'maxHP' | 'level',
    value: number,
  ) => {
    setState((prev) => ({
      ...prev,
      editingPlayer: { id, field, value },
    }));
  };

  const setField = <K extends keyof PlayerManagementState>(
    key: K,
    value: PlayerManagementState[K],
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    ...state,
    createPlayer,
    deletePlayer,
    bulkUpdatePlayers,
    updatePlayerField,
    setEditingPlayer,
    setField,
  };
};
