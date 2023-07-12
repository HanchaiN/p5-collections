import { Route, Router } from "./router.js";

let router = new Router(document.querySelector("main"));
router.routes.set("", new Route({
    name: "HanchaiN",
    filePath: "/routes/index.wc",
}));
router.routes.set("404", new Route({
    name: "Not Found",
    filePath: "/routes/404.wc",
    isNav: false,
}));
router.routes.set("creative_coding", new Route({
    name: "Creative Coding",
    filePath: "/routes/creative_coding/index.wc",
}));
router.routes.set("creative_coding/boids", new Route({
    name: "Boids",
    filePath: "/routes/creative_coding/boids/index.wc",
}));
router.routes.set("creative_coding/brainfuck", new Route({
    name: "Brainfuck",
    filePath: "/routes/creative_coding/brainfuck/index.wc",
}));
router.routes.set("creative_coding/complex_function", new Route({
    name: "Complex function",
    filePath: "/routes/creative_coding/complex_function/index.wc",
}));
router.routes.set("creative_coding/dtmf", new Route({
    name: "DTMF",
    filePath: "/routes/creative_coding/dtmf/index.wc",
}));
router.routes.set("creative_coding/dungeon", new Route({
    name: "Dungeon Generation",
    filePath: "/routes/creative_coding/dungeon/index.wc",
}));
router.routes.set("creative_coding/dynamical_system", new Route({
    name: "Dynamical System",
    filePath: "/routes/creative_coding/dynamical_system/index.wc",
}));
router.routes.set("creative_coding/elementary_cellular_automata", new Route({
    name: "Elementary Cellular Automata",
    filePath: "/routes/creative_coding/elementary_cellular_automata/index.wc",
}));
router.routes.set("creative_coding/fractal_trees", new Route({
    name: "Fractal Trees",
    filePath: "/routes/creative_coding/fractal_trees/index.wc",
}));
router.routes.set("creative_coding/hilbert", new Route({
    name: "Hilbert Curve",
    filePath: "/routes/creative_coding/hilbert/index.wc",
}));
router.routes.set("creative_coding/hydrogen_cloud", new Route({
    name: "Hydrogen Cloud",
    filePath: "/routes/creative_coding/hydrogen_cloud/index.wc",
}));
router.routes.set("creative_coding/hydrogen_pilot", new Route({
    name: "Hydrogen Pilot Wave",
    filePath: "/routes/creative_coding/hydrogen_pilot/index.wc",
}));
router.routes.set("creative_coding/ideal_gas", new Route({
    name: "Ideal Gas",
    filePath: "/routes/creative_coding/ideal_gas/index.wc",
}));
router.routes.set("creative_coding/poincare_disk", new Route({
    name: "Poincare Disk",
    filePath: "/routes/creative_coding/poincare_disk/index.wc",
}));
router.routes.set("creative_coding/ray_tracing", new Route({
    name: "Ray Tracing",
    filePath: "/routes/creative_coding/ray_tracing/index.wc",
}));
router.routes.set("creative_coding/reaction_diffusion", new Route({
    name: "Reaction-diffusion",
    filePath: "/routes/creative_coding/reaction_diffusion/index.wc",
}));
router.routes.set("creative_coding/slit_experiment", new Route({
    name: "Slit Experiment",
    filePath: "/routes/creative_coding/slit_experiment/index.wc",
}));
router.routes.set("creative_coding/spectral_graph", new Route({
    name: "Spectral Graph",
    filePath: "/routes/creative_coding/spectral_graph/index.wc",
}));
router.routes.set("creative_coding/turing_machine", new Route({
    name: "Turing Machine",
    filePath: "/routes/creative_coding/turing_machine/index.wc",
}));
router.init();
document.body.addEventListener('htmx:responseError', function (e) {
    router.goToRoute(e.detail.xhr.status.toString());
});