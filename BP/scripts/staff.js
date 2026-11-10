import { EntityDamageCause, EquipmentSlot, Player, system, world, } from "@minecraft/server";
import { STAFF, STAFF_ID } from "./config.js";
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
 * Saplings can be grown into full trees immediately with the vanilla feature
 * command. If the command is unavailable, falling back to `age_bit` still
 * makes the sapling grow on its next random tick.
 */
const SAPLING_FEATURES = {
    "minecraft:oak_sapling": "minecraft:oak_tree_feature",
    "minecraft:spruce_sapling": "minecraft:spruce_tree_feature",
    "minecraft:birch_sapling": "minecraft:birch_tree_feature",
    "minecraft:jungle_sapling": "minecraft:jungle_tree_feature",
    "minecraft:acacia_sapling": "minecraft:savanna_tree_feature",
    "minecraft:dark_oak_sapling": "minecraft:roofed_tree_feature",
    "minecraft:cherry_sapling": "minecraft:cherry_tree_feature",
    "minecraft:pale_oak_sapling": "minecraft:pale_oak_tree_feature",
};
const lastUseTick = new Map();
function getTargetBlocks(player, center) {
    if (player.isSneaking)
        return [center];
    const blocks = [];
    const radius = STAFF.areaRadius;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
            const block = center.dimension.getBlock({
                x: center.location.x + dx,
                y: center.location.y,
                z: center.location.z + dz,
            });
            if (block)
                blocks.push(block);
        }
    }
    return blocks;
}
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
    const feature = SAPLING_FEATURES[block.typeId];
    if (!feature)
        return false;
    try {
        const { x, y, z } = block.location;
        const result = block.dimension.runCommand(`place feature ${feature} ${x} ${y} ${z}`);
        if (result.successCount > 0)
            return true;
    }
    catch {
        // Fall through to natural growth when the command is unavailable.
    }
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
    block.dimension.playSound(STAFF.growthSound, location);
    block.dimension.spawnParticle(STAFF.growthParticle, location);
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
        let grown = false;
        for (const block of getTargetBlocks(player, event.block)) {
            if (growCrop(block) || growSapling(block))
                grown = true;
        }
        if (!grown)
            return;
        playGrowthEffects(event.block);
        player.startItemCooldown(STAFF.cooldownCategory, STAFF.cooldownTicks);
    });
}
