import { world } from "@minecraft/server";
world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn)
        return;
    event.player.sendMessage("Script API works (from TypeScript)!");
});
