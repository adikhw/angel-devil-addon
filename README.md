# Angel & Devil Addon

A Minecraft Bedrock addon with two craftable items:

| Item | Ability |
|---|---|
| **Angel Staff** | Right-click a crop to grow it instantly. Right-click a sapling to make it ready to grow. Deals no damage. |
| **Devil's Scythe** | Melee weapon with 8 damage and 500 durability. Every successful hit heals the holder for 3 hearts (6 HP). |

Both items have custom textures, English names, and crafting recipes. The addon is written in TypeScript and compiled to the JavaScript that Bedrock runs.

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

- **Angel Staff:** click immature wheat, carrots, potatoes, beetroot, stems, nether wart, cocoa, sweet berries, torchflower, or pitcher crop. It should become fully grown with particles and the bone meal sound. Click a sapling to set it ready for its next growth tick. Clicking a mature plant or a non-plant should do nothing.
- **Devil's Scythe:** damage yourself with `/damage @s 10`, summon a zombie, and hit it while holding the scythe. Each hit should restore 3 hearts, never above maximum health. Hitting with any other item must not heal you.
- **Recipes:** craft the staff with gold ingot over bone meal over stick. Craft the scythe with two obsidian over two blaze rods in a hoe shape.

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
tools/
  generate_textures.py  texture and pack icon generator
  package.sh            builds the .mcaddon
ADDON_NOTES.md          full step-by-step development guide
```
