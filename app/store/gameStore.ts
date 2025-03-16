// src/store/gameStore.ts
import { create } from "zustand";
import { GameState, GamePhase, BattlePhase } from "../core/models/Game";
import { eventBus } from "../core/events/EventBus";
import { GameEventType } from "../core/events/Events";
import { TurnSystem } from "../core/systems/TurnSystem";

// Define the store state interface
interface GameStore {
  // Game state
  gameState: GameState;

  // Systems
  turnSystem: TurnSystem | null;

  // Actions
  initializeGame: () => void;
  selectMage: (playerId: string, mageId: string) => void;
  selectGrimoire: (playerId: string, grimoireIds: string[]) => void;
  selectSpell: (playerId: string, spellId: string, slotIndex: number) => void;
  startBattle: () => void;
  endTurn: () => void;
}

// Initial game state
const initialGameState: GameState = {
  phase: "preparation",
  battlePhase: "spellSelection",
  players: [],
  mages: {},
  spells: {},
  currentTurn: 0,
  turnOrder: [],
  winner: null,
};

// Create the store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: initialGameState,
  turnSystem: null,

  // Actions
  initializeGame: () => {
    // Create a new turn system with the initial game state
    const turnSystem = new TurnSystem(initialGameState);

    set({ turnSystem });

    // Subscribe to events from the turn system
    const unsubscribeTurnStarted = eventBus.on(
      GameEventType.TURN_STARTED,
      (data) => {
        console.log(`Turn ${data.turn} started for player ${data.playerId}`);
        set((state) => ({
          gameState: { ...state.gameState },
        }));
      }
    );

    const unsubscribePhaseChanged = eventBus.on(
      GameEventType.PHASE_CHANGED,
      (data) => {
        console.log(
          `Phase changed from ${data.previousPhase} to ${data.currentPhase}`
        );
        set((state) => ({
          gameState: {
            ...state.gameState,
            phase: data.currentPhase as GamePhase,
          },
        }));
      }
    );

    const unsubscribeBattlePhaseChanged = eventBus.on(
      GameEventType.BATTLE_PHASE_CHANGED,
      (data) => {
        console.log(
          `Battle phase changed from ${data.previousPhase} to ${data.currentPhase}`
        );
        set((state) => ({
          gameState: {
            ...state.gameState,
            battlePhase: data.currentPhase as BattlePhase,
          },
        }));
      }
    );

    // Start the game
    turnSystem.startGame();
  },

  selectMage: (playerId: string, mageId: string) => {
    eventBus.emit(GameEventType.MAGE_SELECTED, { playerId, mageId });

    set((state) => {
      const updatedPlayers = state.gameState.players.map((player) =>
        player.id === playerId ? { ...player, selectedMageId: mageId } : player
      );

      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
        },
      };
    });
  },

  selectGrimoire: (playerId: string, grimoireIds: string[]) => {
    eventBus.emit(GameEventType.GRIMOIRE_SELECTED, { playerId, grimoireIds });

    set((state) => {
      const updatedPlayers = state.gameState.players.map((player) =>
        player.id === playerId
          ? { ...player, selectedGrimoireIds: grimoireIds }
          : player
      );

      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
        },
      };
    });
  },

  selectSpell: (playerId: string, spellId: string, slotIndex: number) => {
    eventBus.emit(GameEventType.SPELL_SELECTED, {
      playerId,
      spellId,
      slotIndex,
    });

    set((state) => {
      const updatedPlayers = state.gameState.players.map((player) => {
        if (player.id === playerId) {
          const selectedSpellIds = [...player.selectedSpellIds];
          while (selectedSpellIds.length <= slotIndex) {
            selectedSpellIds.push("");
          }
          selectedSpellIds[slotIndex] = spellId;

          return { ...player, selectedSpellIds };
        }
        return player;
      });

      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
        },
      };
    });
  },

  startBattle: () => {
    const { turnSystem } = get();
    if (turnSystem) {
      turnSystem.setPhase("battle");
    }
  },

  endTurn: () => {
    const { turnSystem } = get();
    if (turnSystem) {
      turnSystem.endTurn();
    }
  },
}));
