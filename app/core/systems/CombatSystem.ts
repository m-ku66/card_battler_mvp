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
  executeSpells(): void {
    const gameState = this.getGameState();
    // Debug: Log player states to see what spells are selected
    console.log(
      "Player states during spell execution:",
      gameState.players.map((player) => ({
        id: player.id,
        selectedMageId: player.selectedMageId,
        selectedSpellIds: player.selectedSpellIds,
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

    // Collect all selected spells for this turn
    gameState.players.forEach((player) => {
      const mageId = player.selectedMageId;
      if (!mageId) return;

      const mage = gameState.mages[mageId];
      if (!mage) return;

      player.selectedSpellIds.forEach((spellId) => {
        if (!spellId) return;

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
    });

    // Sort spells by casting time (lower = faster) and then by agility (higher = faster)
    spellActions.sort((a, b) => {
      if (a.castingTime !== b.castingTime) {
        return a.castingTime - b.castingTime;
      }
      return b.agility - a.agility;
    });

    console.log("Executing spells in order:", spellActions);

    // Execute each spell in order
    spellActions.forEach((action) => {
      this.executeSpell(action.casterId, action.casterMageId!, action.spellId);
    });
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

    // Find target (for simplicity, we'll just target the opponent's mage)
    const targetPlayerId = gameState.players.find((p) => p.id !== casterId)?.id;
    if (!targetPlayerId) return;

    const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId);
    if (!targetPlayer || !targetPlayer.selectedMageId) return;

    const targetMageId = targetPlayer.selectedMageId;
    const targetMage = gameState.mages[targetMageId];
    if (!targetMage) return;

    // Check if the caster has enough magia
    const magiaCost = spell.magiaCost;
    if (casterMage.magia < magiaCost) {
      console.log(
        `${casterMage.name} doesn't have enough magia to cast ${spell.name}`
      );
      return;
    }

    // Consume magia
    casterMage.magia -= magiaCost;
    eventBus.emit(GameEventType.MAGIA_CONSUMED, {
      mageId: casterMageId,
      amount: magiaCost,
      newMagia: casterMage.magia,
    });

    // Emit spell cast event
    eventBus.emit(GameEventType.SPELL_CAST, {
      casterId: casterMageId,
      targetId: targetMageId,
      spellId: spellId,
      effects: spell.effects.map((effect) => ({
        type: effect.type,
        value: effect.value,
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
      eventBus.emit(GameEventType.GAME_OVER, {
        winnerId: casterId,
        reason: `${targetMage.name} was defeated`,
      });
    }
  }

  /**
   * Apply a specific spell effect
   */
  private applySpellEffect(
    effect: SpellEffect,
    caster: Mage,
    target: Mage,
    spell: Spell
  ): void {
    switch (effect.type) {
      case "damage":
        this.applyDamage(caster, target, spell);
        break;

      case "heal":
        const healAmount = Math.floor(
          (spell.basePower * caster.attackPower) / 100
        );
        caster.health = Math.min(caster.health + healAmount, caster.maxHealth);

        eventBus.emit(GameEventType.HEALING_RECEIVED, {
          targetId: caster.id,
          amount: healAmount,
          newHealth: caster.health,
          sourceId: caster.id,
          spellId: spell.id,
        });
        break;

      case "status":
        eventBus.emit(GameEventType.STATUS_APPLIED, {
          targetId: target.id,
          statusType: effect.name || "unknown",
          duration: effect.duration || 3,
          sourceId: caster.id,
        });
        break;

      // Add more effect types as needed
    }
  }

  /**
   * Apply damage to a target
   */
  private applyDamage(caster: Mage, target: Mage, spell: Spell): void {
    // Basic damage calculation
    let baseDamage = Math.floor((spell.basePower * caster.attackPower) / 100);

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
      baseDamage = Math.floor(baseDamage * 1.5);
      console.log(`Critical hit! Damage increased to ${baseDamage}`);
    }

    // Apply resistance
    const resistedDamage = Math.max(
      1,
      Math.floor(baseDamage * (1 - target.resistance / 100))
    );

    // Apply damage to target
    target.health -= resistedDamage;

    console.log(
      `${caster.name} dealt ${resistedDamage} damage to ${target.name}`
    );

    // Emit damage event
    eventBus.emit(GameEventType.DAMAGE_DEALT, {
      targetId: target.id,
      amount: resistedDamage,
      newHealth: target.health,
      sourceId: caster.id,
      spellId: spell.id,
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
      return 1.2; // Fire beats earth
    }
    if (attackerAffinity === "earth" && defenderAffinity === "lightning") {
      return 0.5; // Earth resists lightning
    }
    if (attackerAffinity === "lightning" && defenderAffinity === "water") {
      return 1.5; // Lightning beats water
    }
    if (attackerAffinity === "wind" && defenderAffinity === "earth") {
      return 1.2; // Wind beats earth
    }

    // Same affinity or no special relationship
    if (attackerAffinity === defenderAffinity) {
      return 0.8; // Slight resistance against same element
    }

    return 1.0; // Normal damage for other combinations
  }
}
