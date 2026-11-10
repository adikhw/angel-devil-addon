/** Shared tuning values for the addon. Change these instead of editing logic. */
export const STAFF_ID = "kurta:angel_staff";
export const SCYTHE_ID = "kurta:devil_scythe";
export const STAFF = {
    cooldownCategory: "kurta:angel_staff",
    cooldownTicks: 10, // 0.5 seconds
    areaRadius: 1, // 1 = 3x3 area
    growthSound: "item.bone_meal.use",
    growthParticle: "minecraft:crop_growth_emitter",
    grassBloomChance: 0.7, // chance of short grass; otherwise a flower
};
export const SCYTHE = {
    healHp: 6, // 3 hearts per successful direct hit
    healCapPerSwing: 6, // total health restored per swing
    sweepRadius: 3,
    sweepArcDegrees: 120,
    sweepMaxTargets: 4,
    sweepDamageRatio: 0.5, // 50% of the damage dealt to the main target
    sweepMinDamage: 1,
    sweepHealPerTarget: 1,
    lifestealParticle: "minecraft:heart_particle",
    lifestealSound: "random.orb",
    sweepParticle: "minecraft:critical_hit_emitter",
    soulHarvestDurationTicks: 100, // 5 seconds
    soulHarvestAbsorptionAmplifier: 0,
    soulHarvestSpeedAmplifier: 0,
    soulHarvestParticle: "minecraft:totem_particle",
    soulHarvestSound: "random.levelup",
};
