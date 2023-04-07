import { generateDungeon } from "./generator.js";

self.addEventListener("message", (e) => {
    self.postMessage(generateDungeon(e.data.grid_size));
})