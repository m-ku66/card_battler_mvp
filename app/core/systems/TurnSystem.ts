import { eventBus } from "../events/EventBus";
import { GameEventType } from "../events/Events";
import { BattlePhase, GamePhase, GameState } from "../models/Game";
import { Mage } from "../models/Mage";

export class TurnSystem {
  private gameState: GameState;

  constructor(initialState: GameState) {
    this.gameState = initialState;
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
    const previousPhase = this.gameState.phase;
    this.gameState.phase = phase;

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
    const previousPhase = this.gameState.battlePhase;
    this.gameState.battlePhase = phase;

    eventBus.emit(GameEventType.BATTLE_PHASE_CHANGED, {
      previousPhase,
      currentPhase: phase,
    });
  }

  /**
   * Start a new turn
   */
  startTurn(): void {
    // Determine turn order based on mage agility
    if (this.gameState.currentTurn === 0) {
      this.calculateTurnOrder();
    }

    const currentPlayerId = this.getCurrentPlayerId();

    eventBus.emit(GameEventType.TURN_STARTED, {
      turn: this.gameState.currentTurn,
      playerId: currentPlayerId,
    });
  }

  /**
   * End the current turn
   */
  endTurn(): void {
    const currentPlayerId = this.getCurrentPlayerId();

    eventBus.emit(GameEventType.TURN_ENDED, {
      turn: this.gameState.currentTurn,
      playerId: currentPlayerId,
    });

    this.gameState.currentTurn++;

    // If all players have taken a turn, switch battle phase
    if (this.gameState.currentTurn % this.gameState.players.length === 0) {
      if (this.gameState.battlePhase === "spellSelection") {
        this.setBattlePhase("execution");
      } else {
        this.setBattlePhase("spellSelection");
      }
    }

    this.startTurn();
  }

  /**
   * Calculate the turn order based on mage agility
   */
  private calculateTurnOrder(): void {
    const playerMages: Array<{ playerId: string; mage: Mage }> = [];

    // Get the selected mage for each player
    this.gameState.players.forEach((player) => {
      if (player.selectedMageId) {
        const mage = this.gameState.mages[player.selectedMageId];
        if (mage) {
          playerMages.push({ playerId: player.id, mage });
        }
      }
    });

    // Sort by agility (highest to lowest)
    playerMages.sort((a, b) => b.mage.agility - a.mage.agility);

    // Set the turn order
    this.gameState.turnOrder = playerMages.map((pm) => pm.playerId);

    // Debug logs
    console.log("Calculated turn order:", this.gameState.turnOrder);
  }

  /**
   * Get the current player's ID based on turn order
   */
  private getCurrentPlayerId(): string {
    // Debug logs
    console.log("Current turn:", this.gameState.currentTurn);
    console.log("Turn order:", this.gameState.turnOrder);

    // Safety check: if turn order is empty, fallback to first player
    if (
      this.gameState.turnOrder.length === 0 &&
      this.gameState.players.length > 0
    ) {
      console.log("Turn order is empty, using fallback");
      // Add all players to the turn order as a fallback
      this.gameState.turnOrder = this.gameState.players.map((p) => p.id);
    }

    const index = this.gameState.currentTurn % this.gameState.turnOrder.length;
    const playerId = this.gameState.turnOrder[index];
    console.log(
      `Selected player ${playerId} for turn ${this.gameState.currentTurn}`
    );

    return playerId;
  }

  /**
   * Get the current state of the game
   */
  getState(): GameState {
    return this.gameState;
  }
}
