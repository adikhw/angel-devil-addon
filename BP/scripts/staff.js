import { EntityDamageCause, EquipmentSlot, Player, system, world, } from "@minecraft/server";
const STAFF_ID = "kurta:angel_staff";
const COOLDOWN_CATEGORY = "kurta:angel_staff";
const COOLDOWN_TICKS = 10; // 0.5 seconds
const GROW_SOUND = "item.bone_meal.use";
const GROW_PARTICLE = "minecraft:crop_growth_emitter";
/**
 * Crops whose growth is stored in a numeric block state. Setting the state to
 * its maximum value makes the crop fully grown instantly.
 */
const CROPS = {
    "minecraft:wheat": { state: "growth", max: 7 },
    "minecraft:carrots": { state: "growth", max: 7 },
    "minecraft:potatoes": { state: "growth", max: 7 },
    "minecraft:beetroot": { state: "growth", max: 7 },
    "minecraft:melon_stem": { state: "growth", max: 7 },
    "minecraft:pumpkin_stem": { state: "growth", max: 7 },
    "minecraft:sweet_berry_bush": { state: "growth", max: 3 },
    "minecraft:torchflower_crop": { state: "growth", max: 1 },
    "minecraft:pitcher_crop": { state: "growth", max: 4 },
    "minecraft:nether_wart": { state: "age", max: 3 },
    "minecraft:cocoa": { state: "age", max: 2 },
};
/**
 * Saplings use the `age_bit` state. Setting it makes the sapling eligible for
 * growth on the next random tick.
 */
const SAPLINGS = new Set([
    "minecraft:oak_sapling",
    "minecraft:spruce_sapling",
    "minecraft:birch_sapling",
    "minecraft:jungle_sapling",
    "minecraft:acacia_sapling",
    "minecraft:dark_oak_sapling",
    "minecraft:cherry_sapling",
    "minecraft:pale_oak_sapling",
]);
const lastUseTick = new Map();
function growCrop(block) {
    const rule = CROPS[block.typeId];
    if (!rule)
        return false;
    const current = block.permutation.getState(rule.state);
    if (typeof current !== "number" || current >= rule.max)
        return false;
    block.setPermutation(block.permutation.withState(rule.state, rule.max));
    return true;
}
function growSapling(block) {
    if (!SAPLINGS.has(block.typeId))
        return false;
    const current = block.permutation.getState("age_bit");
    if (current !== false)
        return false;
    block.setPermutation(block.permutation.withState("age_bit", true));
    return true;
}
function playGrowthEffects(block) {
    const location = {
        x: block.location.x + 0.5,
        y: block.location.y + 0.5,
        z: block.location.z + 0.5,
    };
    block.dimension.playSound(GROW_SOUND, location);
    block.dimension.spawnParticle(GROW_PARTICLE, location);
}
export function setupStaff() {
    world.beforeEvents.entityHurt.subscribe((event) => {
        const attacker = event.damageSource.damagingEntity;
        if (!(attacker instanceof Player))
            return;
        if (event.damageSource.cause !== EntityDamageCause.entityAttack)
            return;
        const equippable = attacker.getComponent("minecraft:equippable");
        const held = equippable?.getEquipment(EquipmentSlot.Mainhand);
        if (held?.typeId !== STAFF_ID)
            return;
        // The Angel Staff is a farming tool, not a weapon.
        event.cancel = true;
    });
    world.afterEvents.playerInteractWithBlock.subscribe((event) => {
        if (event.itemStack?.typeId !== STAFF_ID)
            return;
        if (!event.isFirstEvent)
            return;
        const player = event.player;
        const tick = system.currentTick;
        if (lastUseTick.get(player.id) === tick)
            return;
        lastUseTick.set(player.id, tick);
        const grown = growCrop(event.block) || growSapling(event.block);
        if (!grown)
            return;
        playGrowthEffects(event.block);
        player.startItemCooldown(COOLDOWN_CATEGORY, COOLDOWN_TICKS);
    });
}
