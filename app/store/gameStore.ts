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
  players: [
    // eventually we'll want to dynamically generate these via import or something
    {
      id: "player1",
      name: "Player 1",
      selectedMageId: null,
      studentRoster: ["mage1", "mage2", "mage3", "mage4"], // IDs of mages in roster
      selectedGrimoireIds: [],
      selectedSpellIds: [],
    },
    {
      id: "player2",
      name: "Player 2",
      selectedMageId: null,
      studentRoster: ["mage3", "mage4"],
      selectedGrimoireIds: [],
      selectedSpellIds: [],
    },
  ],
  mages: {
    // eventually we'll want to dynamically generate these via import or something
    mage1: {
      id: "mage1",
      name: "Pyromancer",
      health: 150,
      maxHealth: 150,
      magia: 100,
      maxMagia: 100,
      magiaRegenRate: 5,
      agility: 15,
      resistance: 10,
      wisdom: 12,
      attackPower: 50,
      affinity: "fire",
      personality: "aggressive",
      innateSpellId: "spell1",
      grimoireIds: ["grimoire1"],
    },
    mage2: {
      id: "mage2",
      name: "Aquamancer",
      health: 120,
      maxHealth: 120,
      magia: 50,
      maxMagia: 50,
      magiaRegenRate: 15,
      agility: 20,
      resistance: 15,
      wisdom: 10,
      attackPower: 15,
      affinity: "water",
      personality: "defensive",
      innateSpellId: "spell2",
      grimoireIds: ["grimoire2"],
    },
    mage3: {
      id: "mage3",
      name: "Terramancer",
      health: 110,
      maxHealth: 110,
      magia: 45,
      maxMagia: 45,
      magiaRegenRate: 4,
      agility: 5,
      resistance: 15,
      wisdom: 5,
      attackPower: 15,
      affinity: "earth",
      personality: "supportive",
      innateSpellId: "spell3",
      grimoireIds: ["grimoire3"],
    },
    mage4: {
      id: "mage4",
      name: "Aeromancer",
      health: 90,
      maxHealth: 90,
      magia: 113,
      maxMagia: 113,
      magiaRegenRate: 12,
      agility: 20,
      resistance: 11,
      wisdom: 30,
      attackPower: 15,
      affinity: "wind",
      personality: "cunning",
      innateSpellId: "spell2",
      grimoireIds: ["grimoire4"],
    },
  },
  spells: {
    // eventually we'll want to dynamically generate these via import or something
    spell1: {
      id: "spell1",
      name: "Fireball",
      description: "A ball of fire that deals damage to the target",
      magiaCost: 15,
      basePower: 50,
      castingTime: 0,
      type: "attack",
      affinity: "fire",
      effects: [
        {
          type: "damage",
          target: "opponent",
          name: "burn",
          value: 0.1,
          duration: 3,
        },
      ],
      usesPerBattle: 5,
    },
    spell2: {
      id: "spell2",
      name: "Waterball",
      description: "A ball of water that deals damage to the target",
      magiaCost: 10,
      basePower: 50,
      castingTime: 0,
      type: "attack",
      affinity: "water",
      effects: [],
      usesPerBattle: 5,
    },
    spell3: {
      id: "spell3",
      name: "Earthquake",
      description: "A vibration that deals damage to the target",
      magiaCost: 10,
      basePower: 100,
      castingTime: 1,
      type: "attack",
      affinity: "earth",
      effects: [],
      usesPerBattle: 5,
    },
    spell4: {
      id: "spell4",
      name: "Wind Slash",
      description: "A slash that deals damage to the target",
      magiaCost: 5,
      basePower: 30,
      castingTime: 0,
      type: "attack",
      affinity: "wind",
      effects: [],
      usesPerBattle: 10,
    },
  },
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
