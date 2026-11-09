import { world } from "@minecraft/server";
import { setupScythe } from "./scythe.js";
import { setupStaff } from "./staff.js";
setupScythe();
setupStaff();
world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn)
        return;
    event.player.sendMessage("Script API works (from TypeScript)!");
});
