import { eventBus } from "../events/EventBus";
import { GameEventType } from "../events/Events";
import { GameState } from "../models/Game";
import { Mage } from "../models/Mage";
import { Spell, SpellEffect } from "../models/Spell";
import { useGameStore } from "../../store/gameStore";

export class CombatSystem {
  constructor() {}

  private getGameState(): GameState {
    return useGameStore.getState().gameState;
  }

  /**
   * Process all spells selected for the current turn
   */
  async executeSpells(): Promise<void> {
    const gameState = this.getGameState();
    // Debug: Log player states to see what spells are selected
    console.log(
      "Player states during spell execution:",
      gameState.players.map((player) => ({
        id: player.id,
        selectedMageId: player.selectedMageId,
        selectedSpellId: player.selectedSpellId,
      }))
    );

    // Get all selected spells from all players
    const spellActions: Array<{
      casterId: string;
      casterMageId: string | null;
      spellId: string;
      castingTime: number;
      agility: number;
    }> = [];

    // Collect the single selected spell for each player
    gameState.players.forEach((player) => {
      // Skip players who didn't select a spell (passed their turn)
      if (!player.selectedSpellId) {
        console.log(`${player.name} passed their turn`);
        return;
      }

      const mageId = player.selectedMageId;
      if (!mageId) return;

      const mage = gameState.mages[mageId];
      if (!mage) return;

      const spellId = player.selectedSpellId;
      const spell = gameState.spells[spellId];
      if (!spell) return;

      spellActions.push({
        casterId: player.id,
        casterMageId: mageId,
        spellId: spell.id,
        castingTime: spell.castingTime,
        agility: mage.agility,
      });
    });

    // If no spells to execute, just return
    if (spellActions.length === 0) {
      console.log("No spells to execute this turn");
      return;
    }

    // Sort spells by casting time (lower = faster) and then by agility (higher = faster)
    spellActions.sort((a, b) => {
      if (a.castingTime !== b.castingTime) {
        return a.castingTime - b.castingTime;
      }
      return b.agility - a.agility;
    });

    console.log("Executing spells in order:", spellActions);

    // Clear any existing combat log for this turn
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        combatLog: [],
      },
    }));

    // Execute ready charged spells first
    if (
      gameState.readyChargedSpells &&
      gameState.readyChargedSpells.length > 0
    ) {
      console.log(
        "Executing ready charged spells:",
        gameState.readyChargedSpells
      );

      for (const spell of gameState.readyChargedSpells) {
        // Add a small delay for dramatic effect
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Execute the spell
        this.executeChargedSpell(
          spell.playerId,
          spell.mageId,
          spell.spellId,
          spell.isInnate
        );
      }

      // Clear the ready charged spells list
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          readyChargedSpells: [],
        },
      }));
    }

    // Execute each spell with a delay between them
    for (let i = 0; i < spellActions.length; i++) {
      const action = spellActions[i];

      // Execute the spell
      this.executeSpell(action.casterId, action.casterMageId!, action.spellId);

      // Wait before executing the next spell (except for the last one)
      if (i < spellActions.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
  }

  /**
   * Execute a charged spell
   */
  // In CombatSystem.ts
  public executeChargedSpell(
    playerId: string,
    mageId: string,
    spellId: string,
    isInnate: boolean
  ): void {
    const gameState = this.getGameState();

    const casterMage = gameState.mages[mageId];
    if (!casterMage) return;

    const spell = gameState.spells[spellId];
    if (!spell) return;

    // Find target player
    const targetPlayerId = gameState.players.find((p) => p.id !== playerId)?.id;
    if (!targetPlayerId) return;

    const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId);
    if (!targetPlayer || !targetPlayer.selectedMageId) return;

    const targetMageId = targetPlayer.selectedMageId;
    const targetMage = gameState.mages[targetMageId];
    if (!targetMage) return;

    // Log that the spell is now being cast
    this.logCombatEvent(GameEventType.SPELL_CAST, {
      casterId: mageId,
      targetId: targetMageId,
      spellId: spellId,
      effects: spell.effects.map((effect) => ({
        type: effect.type,
        value: effect.value,
        name: effect.name,
      })),
      isCharged: true,
    });

    // Apply spell effects
    spell.effects.forEach((effect) => {
      this.applySpellEffect(effect, casterMage, targetMage, spell, true);
    });

    // If no effects, apply default damage based on spell power
    if (spell.effects.length === 0 && spell.type === "attack") {
      this.applyDamage(casterMage, targetMage, spell, true);
    }

    // Check if target is defeated
    if (targetMage.health <= 0) {
      targetMage.health = 0;
      this.logCombatEvent(GameEventType.MAGE_DEFEATED, {
        mageId: targetMageId,
        playerId: targetPlayerId,
      });

      this.logCombatEvent(GameEventType.GAME_OVER, {
        winnerId: playerId,
        reason: `${targetMage.name} was defeated`,
      });
    }
  }

  // Helper method to find the target mage ID for a caster
  private getTargetMageId(casterId: string): string {
    const gameState = this.getGameState();
    const targetPlayer = gameState.players.find((p) => p.id !== casterId);
    return targetPlayer?.selectedMageId || "";
  }

  /**
   * Execute a single spell
   */
  private executeSpell(
    casterId: string,
    casterMageId: string,
    spellId: string
  ): void {
    const gameState = this.getGameState();
    const caster = gameState.players.find((p) => p.id === casterId);
    if (!caster) return;

    const casterMage = gameState.mages[casterMageId];
    if (!casterMage) return;

    const spell = gameState.spells[spellId];
    if (!spell) return;

    // Check if spell has uses remaining
    const usesRemaining =
      gameState.spellUsesRemaining[casterId]?.[spellId] || 0;
    if (usesRemaining <= 0) {
      console.log(`${casterMage.name} has no uses left for ${spell.name}`);
      alert(`${casterMage.name} has no uses left for ${spell.name}`);
      return;
    }

    // Find target (for simplicity, we'll just target the opponent's mage)
    const targetPlayerId = gameState.players.find((p) => p.id !== casterId)?.id;
    if (!targetPlayerId) return;

    const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId);
    if (!targetPlayer || !targetPlayer.selectedMageId) return;

    const targetMageId = targetPlayer.selectedMageId;
    const targetMage = gameState.mages[targetMageId];
    if (!targetMage) return;

    // Check if this is the mage's innate spell
    const isInnateSpell =
      spellId === casterMage.innateSpellId && caster.isSelectedSpellInnate;

    // Check if spell has uses remaining (only if NOT using as innate spell)
    if (!isInnateSpell) {
      const usesRemaining =
        gameState.spellUsesRemaining[casterId]?.[spellId] || 0;
      if (usesRemaining <= 0) {
        console.log(`${casterMage.name} has no uses left for ${spell.name}`);
        alert(`${casterMage.name} has no uses left for ${spell.name}`);
        return;
      }
    }

    // Calculate the actual magia cost (50% reduction for innate spells)
    const baseMagiaCost = spell.magiaCost;
    const actualMagiaCost = isInnateSpell
      ? Math.floor(baseMagiaCost * 0.5)
      : baseMagiaCost;

    // Check if the caster has enough magia
    if (casterMage.magia < actualMagiaCost) {
      console.log(
        `${casterMage.name} doesn't have enough magia to cast ${spell.name}`
      );
      // alert(
      //   `${casterMage.name} doesn't have enough magia to cast ${spell.name}`
      // );
      return;
    }

    // Only decrement uses if NOT casting as innate spell
    if (!isInnateSpell) {
      gameState.spellUsesRemaining[casterId][spellId]--;

      if (gameState.spellUsesRemaining[casterId][spellId] === 0) {
        console.log(`${casterMage.name} has used up all uses of ${spell.name}`);
      }
    }

    // Consume magia (using the calculated cost)
    casterMage.magia -= actualMagiaCost;

    this.logCombatEvent(GameEventType.MAGIA_CONSUMED, {
      mageId: casterMageId,
      amount: actualMagiaCost,
      newMagia: casterMage.magia,
    });

    this.logCombatEvent(GameEventType.SPELL_CAST, {
      casterId: casterMageId,
      targetId: targetMageId,
      spellId: spellId,
      effects: spell.effects.map((effect) => ({
        type: effect.type,
        value: effect.value,
        name: effect.name,
      })),
    });

    // Apply spell effects
    spell.effects.forEach((effect) => {
      this.applySpellEffect(effect, casterMage, targetMage, spell);
    });

    // If no effects, apply default damage based on spell power
    if (spell.effects.length === 0 && spell.type === "attack") {
      this.applyDamage(casterMage, targetMage, spell);
    }

    // Check if target is defeated
    if (targetMage.health <= 0) {
      targetMage.health = 0;
      eventBus.emit(GameEventType.MAGE_DEFEATED, {
        mageId: targetMageId,
        playerId: targetPlayerId,
      });

      // Check if game is over

      this.logCombatEvent(GameEventType.GAME_OVER, {
        winnerId: casterId,
        reason: `${targetMage.name} was defeated`,
      });
      console.log(`${targetMage.name} has been defeated!`);
    }
  }

  /**
   * Apply a specific spell effect
   */
  private applySpellEffect(
    effect: SpellEffect,
    caster: Mage,
    target: Mage,
    spell: Spell,
    isCharged: boolean = false
  ): void {
    switch (effect.type) {
      case "damage":
        this.applyDamage(caster, target, spell, isCharged);
        break;

      case "heal":
        const healAmount = Math.floor(
          (spell.basePower * caster.attackPower) / 100
        );
        caster.health = Math.min(caster.health + healAmount, caster.maxHealth);

        this.logCombatEvent(GameEventType.HEALING_RECEIVED, {
          targetId: caster.id,
          amount: healAmount,
          newHealth: caster.health,
          sourceId: caster.id,
          spellId: spell.id,
        });
        break;

      case "status":
        // For status effects, we should ensure damage is still applied
        // if no explicit damage effect exists and it's an attack spell
        if (
          spell.type === "attack" &&
          !spell.effects.some((e) => e.type === "damage")
        ) {
          this.applyDamage(caster, target, spell);
        }

        this.logCombatEvent(GameEventType.STATUS_APPLIED, {
          targetId: target.id,
          statusType: effect.name || "unknown",
          duration: effect.duration || 0,
          sourceId: caster.id,
          spellId: spell.id,
        });
        break;

      // Add more effect types as needed
    }
  }

  /**
   * Apply damage to a target
   */
  private applyDamage(
    caster: Mage,
    target: Mage,
    spell: Spell,
    isCharged: boolean = false
  ): void {
    // Basic damage calculation
    let baseDamage = Math.floor((spell.basePower * caster.attackPower) / 100);

    // Add multiplier for charged spells
    if (isCharged) {
      baseDamage = baseDamage; // leave alone for now
    }

    // Apply elemental affinity modifiers
    const affinityMultiplier = this.getAffinityMultiplier(
      caster.affinity,
      target.affinity
    );
    baseDamage = Math.floor(baseDamage * affinityMultiplier);

    // Apply critical hit (wisdom-based)
    const criticalChance = caster.wisdom / 100;
    const isCritical = Math.random() < criticalChance;
    if (isCritical) {
      baseDamage = Math.floor(baseDamage * 1.8); // Critical hit multiplier
      console.log(`Critical hit! Damage increased to ${baseDamage}`);
    }

    // Apply resistance
    const resistedDamage = Math.max(
      1,
      Math.floor(baseDamage * (1 - target.resistance / 100)) // Resistance reduction. Ex: if target has 12 poimts of resistance, damage is reduced by 12%
    );

    // Apply damage to target
    target.health -= resistedDamage;

    console.log(
      `${caster.name} dealt ${resistedDamage} damage to ${target.name}`
    );

    this.logCombatEvent(GameEventType.DAMAGE_DEALT, {
      targetId: target.id,
      amount: resistedDamage,
      newHealth: target.health,
      sourceId: caster.id,
      spellId: spell.id,
      isCharged: isCharged, // Pass the charged flag
    });
  }

  /**
   * Get affinity multiplier based on attacker and defender affinities
   */
  private getAffinityMultiplier(
    attackerAffinity: string,
    defenderAffinity: string
  ): number {
    // Implement elemental advantage rules
    if (attackerAffinity === "water" && defenderAffinity === "fire") {
      return 1.5; // Water beats fire
    }
    if (attackerAffinity === "fire" && defenderAffinity === "earth") {
      return 1.2; // Fire slightly beats earth
    }
    if (attackerAffinity === "earth" && defenderAffinity === "lightning") {
      return 0.5; // Earth resists lightning
    }
    if (attackerAffinity === "earth" && defenderAffinity === "wind") {
      return 0.8; // Wind slightly resists earth
    }
    if (attackerAffinity === "lightning" && defenderAffinity === "water") {
      return 1.5; // Lightning beats water
    }
    if (attackerAffinity === "wind" && defenderAffinity === "earth") {
      return 1.2; // Wind slightly beats earth
    }

    // Same affinity or no special relationship
    if (attackerAffinity === defenderAffinity) {
      return 0.8; // Slight resistance against same element
    }

    return 1.0; // Normal damage for other combinations
  }

  // This method is used to log combat events in the game
  // It creates a unique ID for each event and adds it to the combat log in the store
  public logCombatEvent(eventType: GameEventType, data: any): void {
    // Create a unique ID for this event
    const eventId = `${eventType}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    // Add the event to the combat log in the store
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        combatLog: [
          ...state.gameState.combatLog,
          {
            id: eventId,
            eventType,
            data,
            timestamp: Date.now(),
          },
        ],
      },
    }));

    // Also emit the event through the event bus (for backward compatibility)
    eventBus.emit(eventType, data);
  }
}
