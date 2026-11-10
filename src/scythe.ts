import {
  Entity,
  EntityDamageCause,
  EquipmentSlot,
  Player,
  system,
  world,
} from "@minecraft/server";
import { SCYTHE, SCYTHE_ID } from "./config.js";

/**
 * Entities damaged by a sweep are marked for a couple of ticks so their own
 * `entityHurt` event does not trigger another sweep or a second lifesteal.
 */
const sweepImmuneUntil = new Map<string, number>();

function isHoldingScythe(player: Player): boolean {
  const equippable = player.getComponent("minecraft:equippable");
  const held = equippable?.getEquipment(EquipmentSlot.Mainhand);
  return held?.typeId === SCYTHE_ID;
}

function healPlayer(player: Player, amount: number): number {
  const health = player.getComponent("minecraft:health");
  if (!health) return 0;

  const current = health.currentValue;
  const next = Math.min(current + amount, health.effectiveMax);
  const healed = next - current;

  if (healed > 0) health.setCurrentValue(next);
  return healed;
}

function isSweepImmune(entity: Entity): boolean {
  const until = sweepImmuneUntil.get(entity.id);
  return until !== undefined && until >= system.currentTick;
}

function markSweepImmune(entity: Entity): void {
  const now = system.currentTick;

  if (sweepImmuneUntil.size > 256) {
    for (const [id, until] of sweepImmuneUntil) {
      if (until < now) sweepImmuneUntil.delete(id);
    }
  }

  sweepImmuneUntil.set(entity.id, now + 2);
}

function getSweepTargets(player: Player, primary: Entity): Entity[] {
  const view = player.getViewDirection();
  const viewLength = Math.hypot(view.x, view.z);
  const forwardX = viewLength > 0.001 ? view.x / viewLength : 0;
  const forwardZ = viewLength > 0.001 ? view.z / viewLength : 0;
  const minDot = Math.cos((SCYTHE.sweepArcDegrees / 2) * (Math.PI / 180));
  const origin = player.location;

  const candidates = player.dimension.getEntities({
    location: origin,
    maxDistance: SCYTHE.sweepRadius,
    families: ["mob"],
    excludeTypes: ["minecraft:player"],
  });

  const targets: { entity: Entity; distance: number }[] = [];

  for (const entity of candidates) {
    if (entity.id === player.id || entity.id === primary.id) continue;
    if (isSweepImmune(entity)) continue;

    const health = entity.getComponent("minecraft:health");
    if (!health || health.currentValue <= 0) continue;

    const dx = entity.location.x - origin.x;
    const dz = entity.location.z - origin.z;
    const distance = Math.hypot(dx, dz);

    // A player looking straight up or down has no horizontal forward vector,
    // so treat that as a full circle instead of an empty arc.
    if (distance > 0.001 && viewLength > 0.001) {
      const dot = (dx / distance) * forwardX + (dz / distance) * forwardZ;
      if (dot < minDot) continue;
    }

    targets.push({ entity, distance });
  }

  targets.sort((a, b) => a.distance - b.distance);
  return targets
    .slice(0, SCYTHE.sweepMaxTargets)
    .map((entry) => entry.entity);
}

function sweep(
  player: Player,
  primary: Entity,
  primaryDamage: number,
): Entity[] {
  const targets = getSweepTargets(player, primary);
  if (targets.length === 0) return targets;

  const damage = Math.max(
    SCYTHE.sweepMinDamage,
    Math.round(primaryDamage * SCYTHE.sweepDamageRatio),
  );

  for (const target of targets) {
    markSweepImmune(target);
    try {
      target.applyDamage(damage, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: player,
      });
    } catch {
      // The target may have died or unloaded between the query and the hit.
    }
  }

  return targets;
}

export function setupScythe(): void {
  world.afterEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    if (!(attacker instanceof Player)) return;
    if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;
    if (isSweepImmune(event.hurtEntity)) return;
    if (!isHoldingScythe(attacker)) return;

    let healed = healPlayer(attacker, SCYTHE.healHp);
    const targets = sweep(attacker, event.hurtEntity, event.damage);

    // The direct hit usually fills the per-swing heal cap. This loop still
    // matters if healHp or the cap is changed in config.ts.
    for (const target of targets) {
      const remaining = SCYTHE.healCapPerSwing - healed;
      if (remaining <= 0) break;

      healed += healPlayer(
        attacker,
        Math.min(SCYTHE.sweepHealPerTarget, remaining),
      );
    }
  });
}
