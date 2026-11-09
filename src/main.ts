import { world } from "@minecraft/server";
import { setupScythe } from "./scythe.js";

setupScythe();

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  event.player.sendMessage("Script API works (from TypeScript)!");
});
