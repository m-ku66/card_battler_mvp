import { create } from "zustand";
import { GameState, GamePhase, BattlePhase } from "../core/models/Game";
import { eventBus } from "../core/events/EventBus";
import { GameEventType } from "../core/events/Events";
import { TurnSystem } from "../core/systems/TurnSystem";
import { mages } from "../data/mageRoster";
import { spells } from "../data/spellEncyclopedia";
import { grimoires } from "../data/grimoireLibrary";

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

  // AI methods
  makeAIMove: () => void;
}

// Initial game state
const initialGameState: GameState = {
  phase: "preparation",
  battlePhase: "spellSelection",
  players: [
    // Human player
    {
      id: "player1",
      name: "Player 1",
      selectedMageId: null,
      studentRoster: ["mage1", "mage2"], // IDs of mages in roster
      selectedGrimoireIds: [],
      selectedSpellIds: [],
    },
    // AI player
    {
      id: "player2",
      name: "AI Player",
      selectedMageId: null,
      studentRoster: ["mage3", "mage4"],
      selectedGrimoireIds: [],
      selectedSpellIds: [],
    },
  ],
  mages: mages,
  spells: spells,
  grimoires: grimoires, // Add this to your GameState type
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

        // If it's the AI's turn, make a move
        if (data.playerId === "player2") {
          get().makeAIMove();
        }
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

        // If entering preparation phase, have AI select a mage and grimoire
        if (data.currentPhase === "preparation") {
          get().makeAIMove();
        }
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

    const unsubscribeDamageDealt = eventBus.on(
      GameEventType.DAMAGE_DEALT,
      (data) => {
        console.log(`Damage dealt: ${data.amount} to ${data.targetId}`);
        // We don't need to update state here since the CombatSystem already updated the mages directly
        // But we'll force a re-render to show the updated health
        set((state) => ({ gameState: { ...state.gameState } }));
      }
    );

    const unsubscribeGameOver = eventBus.on(GameEventType.GAME_OVER, (data) => {
      console.log(
        `Game over! Winner: ${data.winnerId}, Reason: ${data.reason}`
      );
      set((state) => ({
        gameState: {
          ...state.gameState,
          phase: "result",
          winner: data.winnerId,
        },
      }));
    });

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

  // AI logic
  makeAIMove: () => {
    const { gameState, selectMage, selectGrimoire, selectSpell } = get();
    const aiPlayer = gameState.players.find((p) => p.id === "player2");

    if (!aiPlayer) return;

    // If in preparation phase and no mage selected, select one
    if (gameState.phase === "preparation" && !aiPlayer.selectedMageId) {
      // Randomly select a mage from the AI's roster
      const randomMageIndex = Math.floor(
        Math.random() * aiPlayer.studentRoster.length
      );
      const randomMageId = aiPlayer.studentRoster[randomMageIndex];

      console.log(`AI selecting mage: ${randomMageId}`);
      selectMage("player2", randomMageId);

      // Select appropriate grimoire based on the mage
      const mage = gameState.mages[randomMageId];
      if (mage && mage.grimoireIds.length > 0) {
        console.log(`AI selecting grimoire: ${mage.grimoireIds[0]}`);
        selectGrimoire("player2", [mage.grimoireIds[0]]);
      }
    }

    // If in battle phase and spell selection, select spells
    if (
      gameState.phase === "battle" &&
      gameState.battlePhase === "spellSelection"
    ) {
      // Get AI's selected mage and grimoire
      const selectedMageId = aiPlayer.selectedMageId;
      const selectedGrimoireIds = aiPlayer.selectedGrimoireIds;

      if (selectedMageId && selectedGrimoireIds.length > 0) {
        // Get available spells from grimoire
        const availableSpells: string[] = [];

        selectedGrimoireIds.forEach((grimoireId) => {
          const grimoire = gameState.grimoires[grimoireId];
          if (grimoire) {
            availableSpells.push(...grimoire.spellIds);
          }
        });

        // Also add innate spell
        const mage = gameState.mages[selectedMageId];
        if (mage && mage.innateSpellId) {
          availableSpells.push(mage.innateSpellId);
        }

        // Select a random spell for each slot (3 slots)
        for (let i = 0; i < 3; i++) {
          if (availableSpells.length > 0) {
            const randomSpellIndex = Math.floor(
              Math.random() * availableSpells.length
            );
            const randomSpellId = availableSpells[randomSpellIndex];

            console.log(`AI selecting spell for slot ${i}: ${randomSpellId}`);
            selectSpell("player2", randomSpellId, i);
          }
        }
      }
    }
  },
}));
