import { eventBus } from "../events/EventBus";
import { GameEventType } from "../events/Events";
import { BattlePhase, GamePhase, GameState } from "../models/Game";
import { Mage } from "../models/Mage";
import { CombatSystem } from "./CombatSystem";
import { useGameStore } from "../../store/gameStore";
import { ChargingSpell } from "../models/Game";

export class TurnSystem {
  private combatSystem: CombatSystem;

  constructor() {
    this.combatSystem = new CombatSystem();
  }

  private getGameState(): GameState {
    return useGameStore.getState().gameState;
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.setPhase("preparation");
    eventBus.emit(GameEventType.GAME_INITIALIZED);
  }

  /**
   * Set the current game phase
   */
  setPhase(phase: GamePhase): void {
    const gameState = this.getGameState();
    const previousPhase = gameState.phase;
    // Update state via the store
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        phase,
      },
    }));

    eventBus.emit(GameEventType.PHASE_CHANGED, {
      previousPhase,
      currentPhase: phase,
    });

    // If entering battle phase, start the first turn
    if (phase === "battle" && previousPhase !== "battle") {
      this.setBattlePhase("spellSelection");
      this.startTurn();
    }
  }

  /**
   * Set the current battle phase
   */
  setBattlePhase(phase: BattlePhase): void {
    const gameState = this.getGameState();
    const previousPhase = gameState.battlePhase;

    // Update state via the store
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        battlePhase: phase,
      },
    }));

    eventBus.emit(GameEventType.BATTLE_PHASE_CHANGED, {
      previousPhase,
      currentPhase: phase,
    });
  }

  /**
   * Execute the spells selected by players
   */
  executeSpells(): void {
    const gameState = this.getGameState();
    if (gameState.battlePhase === "execution") {
      this.combatSystem.executeSpells();
    }
  }

  /**
   * Start a new turn
   */
  startTurn(): void {
    const gameState = this.getGameState();
    // Determine turn order based on mage agility
    if (gameState.currentTurn === 0) {
      this.calculateTurnOrder();
    }

    const currentPlayerId = this.getCurrentPlayerId();

    eventBus.emit(GameEventType.TURN_STARTED, {
      turn: gameState.currentTurn,
      playerId: currentPlayerId,
    });
  }

  /**
   * End the current turn and execute spells when transitioning to execution phase
   */
  endTurn(): void {
    const gameState = this.getGameState();
    const currentPlayerId = this.getCurrentPlayerId();

    console.log(
      `Ending turn ${gameState.currentTurn} for player ${currentPlayerId}`
    );

    // 1. Emit turn ended event
    eventBus.emit(GameEventType.TURN_ENDED, {
      turn: gameState.currentTurn,
      playerId: currentPlayerId,
    });

    // 2. Handle phase transition
    if (gameState.battlePhase === "spellSelection") {
      // If we're in spell selection, move to execution
      console.log("Transitioning to execution phase");

      // Update state in ONE single operation
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          battlePhase: "execution",
        },
      }));

      eventBus.emit(GameEventType.BATTLE_PHASE_CHANGED, {
        previousPhase: "spellSelection",
        currentPhase: "execution",
      });

      // Execute spells immediately
      this.combatSystem.executeSpells();
    } else {
      // If we're in execution, move to the next turn and back to spell selection
      console.log("Transitioning to next turn and spell selection");

      // Update state in ONE single operation
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          battlePhase: "spellSelection",
          currentTurn: state.gameState.currentTurn + 1,
        },
      }));

      eventBus.emit(GameEventType.BATTLE_PHASE_CHANGED, {
        previousPhase: "execution",
        currentPhase: "spellSelection",
      });

      // Process charging spells
      this.processChargingSpells();

      // Process status effects (we'll add this next)
      // this.processStatusEffects();

      // Regenerate magia
      this.regenerateMagia();

      // Start the next turn
      this.startTurn();
    }
  }

  /**
   * Regenerate magia for all mages at the end of a full turn
   */
  private regenerateMagia(): void {
    const gameState = this.getGameState();

    // Regenerate magia for all mages
    gameState.players.forEach((player) => {
      if (player.selectedMageId) {
        const mage = gameState.mages[player.selectedMageId];
        if (mage) {
          const regenAmount = mage.magiaRegenRate;
          mage.magia = Math.min(mage.magia + regenAmount, mage.maxMagia);

          eventBus.emit(GameEventType.MAGIA_REGENERATED, {
            mageId: mage.id,
            amount: regenAmount,
            newMagia: mage.magia,
          });
        }
      }
    });
  }

  /**
   * Calculate the turn order based on mage agility
   */
  private calculateTurnOrder(): void {
    const gameState = this.getGameState();
    const playerMages: Array<{ playerId: string; mage: Mage }> = [];

    // Get the selected mage for each player
    gameState.players.forEach((player) => {
      if (player.selectedMageId) {
        const mage = gameState.mages[player.selectedMageId];
        if (mage) {
          playerMages.push({ playerId: player.id, mage });
        }
      }
    });

    // Sort by agility (highest to lowest)
    playerMages.sort((a, b) => b.mage.agility - a.mage.agility);

    // Set the turn order
    gameState.turnOrder = playerMages.map((pm) => pm.playerId);

    // Debug logs
    console.log("Calculated turn order:", gameState.turnOrder);
  }

  /**
   * Get the current player's ID based on turn order
   */
  private getCurrentPlayerId(): string {
    const gameState = this.getGameState();
    // Debug logs
    console.log("Current turn:", gameState.currentTurn);
    console.log("Turn order:", gameState.turnOrder);

    // Safety check: if turn order is empty, fallback to first player
    if (gameState.turnOrder.length === 0 && gameState.players.length > 0) {
      console.log("Turn order is empty, using fallback");
      // Add all players to the turn order as a fallback
      gameState.turnOrder = gameState.players.map((p) => p.id);
    }

    const index = gameState.currentTurn % gameState.turnOrder.length;
    const playerId = gameState.turnOrder[index];
    console.log(
      `Selected player ${playerId} for turn ${gameState.currentTurn}`
    );

    return playerId;
  }

  // app/core/systems/TurnSystem.ts
  public processChargingSpells(): void {
    const gameState = this.getGameState();
    const updatedChargingSpells: ChargingSpell[] = [];
    const spellsToExecute: ChargingSpell[] = [];

    for (const spell of gameState.chargingSpells) {
      // Decrement the remaining turns
      const remainingTurns = spell.remainingTurns - 1;

      if (remainingTurns <= 0) {
        // Spell is ready to cast, but we'll queue it for execution phase
        spellsToExecute.push(spell);

        // Log that the spell is ready to cast
        this.logCombatEvent(GameEventType.SPELL_CAST, {
          casterId: spell.mageId,
          spellId: spell.spellId,
          isCharged: true, // Important flag for the UI!
          effects: gameState.spells[spell.spellId]?.effects || [],
        });
      } else {
        // Spell is still charging
        updatedChargingSpells.push({
          ...spell,
          remainingTurns,
        });

        // Log that the spell is still charging
        this.logCombatEvent(GameEventType.SPELL_CAST, {
          casterId: spell.mageId,
          spellId: spell.spellId,
          isCharging: true,
          chargingTurns: remainingTurns,
        });
      }
    }

    // Update game state with both arrays
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        chargingSpells: updatedChargingSpells,
        readyChargedSpells: spellsToExecute,
      },
    }));
  }

  public executeChargedSpell(
    playerId: string,
    mageId: string,
    spellId: string,
    isInnate: boolean
  ): void {
    // Use CombatSystem to execute the spell
    this.combatSystem.executeChargedSpell(playerId, mageId, spellId, isInnate);
  }
  public logCombatEvent(eventType: GameEventType, data: any) {
    this.combatSystem.logCombatEvent(eventType, data);
  }

  /**
   * Get the current state of the game
   */
  getState(): GameState {
    const gameState = this.getGameState();
    return gameState;
  }
}
