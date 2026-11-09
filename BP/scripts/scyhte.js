import { world, Player, EntityDamageCause, EquipmentSlot, } from "@minecraft/server";
const SCYTHE_ID = "kurta:devil_scythe";
const HEAL_HP = 6; // 3 hearts = 6 HP
export function setupScyhte() {
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
        const next = Math.min(health.currentValue + HEAL_HP, health.effectiveMax);
        health.setCurrentValue(next);
    });
}
