# Angel & Devil Addon

A Minecraft Bedrock addon with two craftable items:

| Item | Ability |
|---|---|
| **Angel Staff** | Grows crops in a 3×3 area, turns saplings into full trees, blooms grass, and deals no damage. |
| **Devil's Scythe** | 8-damage melee weapon with lifesteal, a frontal sweep attack, and a Soul Harvest buff after kills. |

Both items have custom textures, English names, and crafting recipes. The addon is written in TypeScript and compiled to the JavaScript that Bedrock runs.

## Features in detail

### Angel Staff

- Right-click an immature crop to grow it instantly.
  - Supported: wheat, carrots, potatoes, beetroot, melon stem, pumpkin stem, sweet berry bush, torchflower crop, pitcher crop, nether wart, and cocoa.
- Normal use grows the clicked block and the surrounding 3×3 area.
- Sneak while using the staff to grow only the clicked block.
- Right-click a sapling to grow a full tree immediately using the vanilla `place feature` command. If the command is unavailable, the sapling's `age_bit` is set so it grows on its next random tick.
  - Supported: oak, spruce, birch, jungle, acacia, dark oak, cherry, and pale oak.
- Right-click a grass block to add short grass or a random flower on top. This also applies to grass blocks inside the 3×3 area.
- Successful use plays the bone meal sound and growth particles, then starts a 0.5-second cooldown.
- Hitting a mob with the staff is cancelled, so the staff is a farming tool rather than a weapon.

### Devil's Scythe

- 8 base damage and 500 durability.
- Every successful direct hit heals the holder for 3 hearts (6 HP), never above maximum health.
- **Sweep:** a direct hit also damages up to 4 nearby mobs in a 3-block, 120° frontal arc for 50% of the direct hit's damage.
- **Lifesteal cap:** healing is capped at 6 HP per swing so a large sweep cannot restore unlimited health.
- **Soul Harvest:** killing a mob with the scythe grants Absorption and Speed I for 5 seconds.
- Lifesteal shows heart particles and plays a pickup sound. Sweep hits show critical-hit particles, and Soul Harvest shows totem particles and a level-up sound.

## Requirements

- Minecraft Bedrock **1.26.60** or newer
- Node.js and npm
- Python 3 with Pillow (`pip install pillow`) — only needed to regenerate textures
- `zip` — only needed to build the distributable `.mcaddon`

## Build

```bash
npm install
npm run build        # compile src/*.ts -> BP/scripts/*.js
npm run watch        # compile on save while developing
npm run textures     # regenerate item textures and pack icons
npm run package      # build dist/angel_devil.mcaddon
```

Never edit `BP/scripts/*.js` by hand; those files are overwritten by `npm run build`.

## Tuning

All gameplay values live in `src/config.ts`. After changing them, run `npm run build` and re-enter the world or use `/reload`.

| Setting | Default | Meaning |
|---|---:|---|
| `STAFF.cooldownTicks` | `10` | Staff cooldown after a successful use (20 ticks = 1 second) |
| `STAFF.areaRadius` | `1` | Area growth radius; `1` means 3×3 |
| `STAFF.grassBloomChance` | `0.7` | Chance of short grass instead of a flower |
| `SCYTHE.healHp` | `6` | Direct-hit lifesteal |
| `SCYTHE.healCapPerSwing` | `6` | Maximum healing per swing |
| `SCYTHE.sweepRadius` | `3` | Sweep search radius |
| `SCYTHE.sweepArcDegrees` | `120` | Frontal cone of the sweep |
| `SCYTHE.sweepMaxTargets` | `4` | Maximum extra mobs hit by one swing |
| `SCYTHE.sweepDamageRatio` | `0.5` | Sweep damage as a fraction of the direct hit |
| `SCYTHE.soulHarvestDurationTicks` | `100` | Soul Harvest duration (20 ticks = 1 second) |

## Install for development

Put the development pack folders in the game's data directory. For the common mcpelauncher layout:

```bash
ln -s "$PWD/BP" "$HOME/.local/share/mcpelauncher/games/com.mojang/development_behavior_packs/angel_devil_BP"
ln -s "$PWD/RP" "$HOME/.local/share/mcpelauncher/games/com.mojang/development_resource_packs/angel_devil_RP"
```

Adjust the path to match your launcher (`find ~ -type d -name development_behavior_packs`).

Then create a world, activate **Angel & Devil BP**, enable cheats, and enter the world. Activating the behavior pack automatically activates the resource pack.

## Install as a file

```bash
npm run package
```

Import `dist/angel_devil.mcaddon` into Minecraft, or import the two `.mcpack` files separately. The `.mcaddon` contains both packs with `manifest.json` at the root of each archive.

## Testing

```mcfunction
/give @s kurta:angel_staff
/give @s kurta:devil_scythe
```

### Angel Staff

1. Plant a 3×3 patch of wheat and click the center with the staff. The whole patch should mature at once.
2. Sneak and click one crop. Only that crop should mature.
3. Click a sapling. A full tree should appear immediately. If it does not, the sapling should grow on its next random tick.
4. Click a grass block. Short grass or a flower should appear on top; normal use also blooms the surrounding grass blocks.
5. Click a mature crop or a non-plant. Nothing should happen.
6. Hit a zombie with the staff. Its health must not change.

### Devil's Scythe

1. Damage yourself with `/damage @s 10`.
2. Summon a zombie and hit it with the scythe. You should regain 3 hearts, capped at maximum health.
3. Summon three zombies in front of you and hit one. The other zombies in the frontal arc should take reduced damage.
4. Kill a zombie with the scythe. You should receive Absorption and Speed I for 5 seconds.
5. Hit a zombie with any other item. You must not heal.

### Recipes

- **Angel Staff:** gold ingot over bone meal over stick.
- **Devil's Scythe:** two obsidian over two blaze rods in a hoe shape.

If something does not load, enable **Content Log GUI** in Creator settings and press `Ctrl+H` in-game. The launcher terminal also prints script errors.

## Project layout

```
BP/                     behavior pack
  items/                item definitions
  recipes/              crafting recipes
  scripts/              compiled JavaScript (do not edit)
RP/                     resource pack
  textures/items/       16x16 item sprites
  texts/                item names
src/                    TypeScript source
  config.ts             gameplay tuning values
  main.ts               entry point
  scythe.ts             Devil's Scythe logic
  staff.ts              Angel Staff logic
tools/
  generate_textures.py  texture and pack icon generator
  package.sh            builds the .mcaddon
dist/                   generated .mcpack/.mcaddon files (git-ignored)
ADDON_NOTES.md          full step-by-step development guide
```
