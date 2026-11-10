import { world, Player, EntityDamageCause, EquipmentSlot, } from "@minecraft/server";
import { SCYTHE, SCYTHE_ID } from "./config.js";
export function setupScythe() {
    world.afterEvents.entityHurt.subscribe((event) => {
        const attacker = event.damageSource.damagingEntity;
        if (!(attacker instanceof Player))
            return;
        if (event.damageSource.cause !== EntityDamageCause.entityAttack)
            return;
        const equippable = attacker.getComponent("minecraft:equippable");
        const held = equippable?.getEquipment(EquipmentSlot.Mainhand);
        if (held?.typeId !== SCYTHE_ID)
            return;
        const health = attacker.getComponent("minecraft:health");
        if (!health)
            return;
        const next = Math.min(health.currentValue + SCYTHE.healHp, health.effectiveMax);
        health.setCurrentValue(next);
    });
}
