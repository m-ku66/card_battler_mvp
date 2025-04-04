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
  selectSpell: (playerId: string, spellId: string, isInnate?: boolean) => void;
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
      studentRoster: [
        "idlad_001",
        "inaui_001",
        "narnrokhar_001",
        "surha_001",
        "zkilliam_001",
      ], // IDs of mages in roster
      selectedGrimoireIds: [],
      selectedSpellId: null,
      isSelectedSpellInnate: false,
    },
    // AI player
    {
      id: "player2",
      name: "AI Player",
      selectedMageId: null,
      studentRoster: ["narnrokhar_001", "inaui_001", "zkilliam_001"],
      selectedGrimoireIds: [],
      selectedSpellId: null,
      isSelectedSpellInnate: false,
    },
  ],
  mages: mages,
  spells: spells,
  grimoires: grimoires,
  currentTurn: 1,
  turnOrder: [],
  winner: null,
  spellUsesRemaining: {}, // Will be populated when the game starts
  combatLog: [], // Initialize empty combat log
  chargingSpells: [], // Spells that are currently charging
  readyChargedSpells: [], // A queue of spells that are ready to be cast
};

// Create the store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: initialGameState,
  turnSystem: null,

  // Actions
  initializeGame: () => {
    // Create a new turn system with the initial game state
    const turnSystem = new TurnSystem();

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

  selectSpell: (
    playerId: string,
    spellId: string,
    isInnate: boolean = false
  ) => {
    eventBus.emit(GameEventType.SPELL_SELECTED, {
      playerId,
      spellId,
    });

    set((state) => {
      const updatedPlayers = state.gameState.players.map((player) => {
        if (player.id === playerId) {
          // Simply set the selectedSpellId and isSelectedSpellInnate
          console.log(
            `Player ${playerId} selected spell ${spellId}, innate: ${isInnate}`
          );
          return {
            ...player,
            selectedSpellId: spellId,
            isSelectedSpellInnate: isInnate,
          };
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
    const { turnSystem, gameState } = get();

    // Initialize spell uses for all players
    const spellUsesRemaining: Record<string, Record<string, number>> = {};

    // For each player
    gameState.players.forEach((player) => {
      spellUsesRemaining[player.id] = {};

      // For each grimoire
      player.selectedGrimoireIds.forEach((grimoireId) => {
        const grimoire = gameState.grimoires[grimoireId];
        if (!grimoire) return;

        // For each spell in grimoire
        grimoire.spellIds.forEach((spellId) => {
          const spell = gameState.spells[spellId];
          if (!spell) return;

          // Set initial uses
          spellUsesRemaining[player.id][spellId] =
            spell.usesPerBattle || Infinity;
        });
      });
    });

    // Update the state with initialized spell uses
    set((state) => ({
      gameState: {
        ...state.gameState,
        spellUsesRemaining,
      },
    }));

    // Start the battle
    if (turnSystem) {
      turnSystem.setPhase("battle");
    }
  },

  endTurn: () => {
    const { turnSystem, gameState } = get();

    // First, check all players for spell selections with casting time
    gameState.players.forEach((player) => {
      // Skip if no spell is selected
      if (!player.selectedSpellId) return;

      const spell = gameState.spells[player.selectedSpellId];
      const mage = player.selectedMageId
        ? gameState.mages[player.selectedMageId]
        : null;

      if (!spell || !mage) return;

      // In app/store/gameStore.ts - endTurn function
      // Inside the code that handles charging spells

      // First, check if this is a charging spell (casting time > 0)
      if (spell.castingTime > 0) {
        console.log(
          `Adding spell ${spell.name} to charging queue for ${player.id}`
        );

        // Create a unique ID for this charging spell event
        const chargeStartEventId = `spell-charging-start-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;

        // Create the charging spell log entry FIRST to ensure it's always recorded
        const chargingLogEntry = {
          id: chargeStartEventId,
          eventType: GameEventType.SPELL_CAST,
          data: {
            casterId: mage.id,
            spellId: spell.id,
            isCharging: true,
            chargingTurns: spell.castingTime,
            isInitialCharge: true, // New flag to indicate this is the start of charging
          },
          timestamp: Date.now(),
        };

        // Update state with both the charging spell and the log entry
        useGameStore.setState((state) => ({
          gameState: {
            ...state.gameState,
            chargingSpells: [
              ...state.gameState.chargingSpells,
              {
                playerId: player.id,
                mageId: player.selectedMageId!,
                spellId: player.selectedSpellId!,
                remainingTurns: spell.castingTime,
                isInnate: player.isSelectedSpellInnate,
              },
            ],
            // Clear player's selected spell since it's now charging
            players: state.gameState.players.map((p) =>
              p.id === player.id
                ? { ...p, selectedSpellId: null, isSelectedSpellInnate: false }
                : p
            ),
            // Add to combat log that spell is charging
            combatLog: [...state.gameState.combatLog, chargingLogEntry],
          },
        }));

        // Remove spell uses immediately (same as when cast)
        if (!player.isSelectedSpellInnate) {
          // Decrement uses like normal
          useGameStore.setState((state) => {
            const usesRemaining =
              state.gameState.spellUsesRemaining[player.id]?.[
                player.selectedSpellId!
              ] || 0;
            return {
              gameState: {
                ...state.gameState,
                spellUsesRemaining: {
                  ...state.gameState.spellUsesRemaining,
                  [player.id]: {
                    ...state.gameState.spellUsesRemaining[player.id],
                    [player.selectedSpellId!]: Math.max(0, usesRemaining - 1),
                  },
                },
              },
            };
          });
        }

        // Consume magia immediately
        const magiaCost = player.isSelectedSpellInnate
          ? Math.floor(spell.magiaCost * 0.5)
          : spell.magiaCost;

        mage.magia -= magiaCost;

        turnSystem?.logCombatEvent(GameEventType.MAGIA_CONSUMED, {
          mageId: mage.id,
          amount: magiaCost,
          newMagia: mage.magia,
        });
      }
    });

    // Then proceed with the normal turn end
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

    // If in battle phase and spell selection, select a single spell
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

        // Select a random spell from available spells
        if (availableSpells.length > 0) {
          const randomSpellIndex = Math.floor(
            Math.random() * availableSpells.length
          );
          const randomSpellId = availableSpells[randomSpellIndex];

          // Check if the selected spell is innate
          const isInnate = mage && mage.innateSpellId === randomSpellId;

          console.log(
            `AI selecting spell: ${randomSpellId}, innate: ${isInnate}`
          );
          selectSpell("player2", randomSpellId, isInnate);
        }
      }
    }
  },
}));
