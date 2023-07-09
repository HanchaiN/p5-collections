import { Route, Router } from "./router.js";

let router = new Router(document.querySelector("main"));
router.routes.set("", new Route({
    name: "HanchaiN",
    filePath: "/index.wc",
}));
router.routes.set("404", new Route({
    name: "Not Found",
    filePath: "/404.wc",
    isNav: false,
}));
router.routes.set("creative_coding", new Route({
    name: "Creative Coding",
    filePath: "/creative_coding/index.wc",
}));
router.routes.set("creative_coding/boids", new Route({
    name: "Boids",
    filePath: "/creative_coding/boids/index.wc",
    scriptPath: "/creative_coding/boids/main.js",
}));
router.routes.set("creative_coding/brainfuck", new Route({
    name: "Brainfuck",
    filePath: "/creative_coding/brainfuck/index.wc",
    scriptPath: "/creative_coding/brainfuck/main.js",
}));
router.routes.set("creative_coding/complex_function", new Route({
    name: "Complex function",
    filePath: "/creative_coding/complex_function/index.wc",
    scriptPath: "/creative_coding/complex_function/main.js",
}));
router.routes.set("creative_coding/dtmf", new Route({
    name: "DTMF",
    filePath: "/creative_coding/dtmf/index.wc",
    scriptPath: "/creative_coding/dtmf/main.js",
}));
router.routes.set("creative_coding/dungeon", new Route({
    name: "Dungeon Generation",
    filePath: "/creative_coding/dungeon/index.wc",
    scriptPath: "/creative_coding/dungeon/main.js",
}));
router.routes.set("creative_coding/dynamical_system", new Route({
    name: "Dynamical System",
    filePath: "/creative_coding/dynamical_system/index.wc",
    scriptPath: "/creative_coding/dynamical_system/main.js",
}));
router.routes.set("creative_coding/elementary_cellular_automata", new Route({
    name: "Elementary Cellular Automata",
    filePath: "/creative_coding/elementary_cellular_automata/index.wc",
    scriptPath: "/creative_coding/elementary_cellular_automata/main.js",
}));
router.routes.set("creative_coding/fractal_trees", new Route({
    name: "Fractal Trees",
    filePath: "/creative_coding/fractal_trees/index.wc",
    scriptPath: "/creative_coding/fractal_trees/main.js",
}));
router.routes.set("creative_coding/hilbert", new Route({
    name: "Hilbert Curve",
    filePath: "/creative_coding/hilbert/index.wc",
    scriptPath: "/creative_coding/hilbert/main.js",
}));
router.routes.set("creative_coding/hydrogen_cloud", new Route({
    name: "Hydrogen Cloud",
    filePath: "/creative_coding/hydrogen_cloud/index.wc",
    scriptPath: "/creative_coding/hydrogen_cloud/main.js",
}));
router.routes.set("creative_coding/hydrogen_pilot", new Route({
    name: "Hydrogen Pilot Wave",
    filePath: "/creative_coding/hydrogen_pilot/index.wc",
    scriptPath: "/creative_coding/hydrogen_pilot/main.js",
}));
router.routes.set("creative_coding/ideal_gas", new Route({
    name: "Ideal Gas",
    filePath: "/creative_coding/ideal_gas/index.wc",
    scriptPath: "/creative_coding/ideal_gas/main.js",
}));
router.routes.set("creative_coding/poincare_disk", new Route({
    name: "Poincare Disk",
    filePath: "/creative_coding/poincare_disk/index.wc",
    scriptPath: "/creative_coding/poincare_disk/main.js",
}));
router.routes.set("creative_coding/ray_tracing", new Route({
    name: "Ray Tracing",
    filePath: "/creative_coding/ray_tracing/index.wc",
    scriptPath: "/creative_coding/ray_tracing/main.js",
}));
router.routes.set("creative_coding/reaction_diffusion", new Route({
    name: "Reaction-diffusion",
    filePath: "/creative_coding/reaction_diffusion/index.wc",
    scriptPath: "/creative_coding/reaction_diffusion/main.js",
}));
router.routes.set("creative_coding/slit_experiment", new Route({
    name: "Slit Experiment",
    filePath: "/creative_coding/slit_experiment/index.wc",
    scriptPath: "/creative_coding/slit_experiment/main.js",
}));
router.routes.set("creative_coding/spectral_graph", new Route({
    name: "Spectral Graph",
    filePath: "/creative_coding/spectral_graph/index.wc",
    scriptPath: "/creative_coding/spectral_graph/main.js",
}));
router.routes.set("creative_coding/turing_machine", new Route({
    name: "Turing Machine",
    filePath: "/creative_coding/turing_machine/index.wc",
    scriptPath: "/creative_coding/turing_machine/main.js",
}));
router.init();