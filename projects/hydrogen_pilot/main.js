import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getParentSize } from "../utils/dom.js";
export default function execute() {
    let camera, scene, renderer, controls, electron_mesh, clock;
    let ended = true;
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker;

    const counts = 1000;

    function init(node) {
        ended = false;
        const states = [
            { coeff: { re: 1 }, psi: { n: 3, l: 1, m: +1 } },
        ];
        worker?.postMessage?.({
            states,
            counts,
            time_scale: 5e3,
        });
        const n_max = states.reduce(
            (n_max, { psi: { n } }) => Math.max(n_max, n),
            0
        );
        const unit = Math.pow(n_max, 2);
        const { width, height } = getParentSize(parent, canvas);
        clock = new THREE.Clock();
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.z = 3 * unit;
        camera.up = new THREE.Vector3(0, 0, 1);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        canvas = node.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;

        resizeObserver = new ResizeObserver(function () {
            const { width, height } = getParentSize(parent, canvas);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }).observe(parent);

        {
            const nucleus = new THREE.Mesh(
                new THREE.SphereGeometry(unit / 500, 32, 16),
                new THREE.MeshPhongMaterial({
                    color: 0x804040,
                    emissive: 0x302020,
                })
            );
            scene.add(nucleus);
        }

        {
            electron_mesh = new THREE.InstancedMesh(
                new THREE.SphereGeometry(unit / 100, 32, 16),
                new THREE.MeshPhongMaterial(),
                counts,
            );
            electron_mesh.instanceMatrix.setUsage(THREE.StreamDrawUsage);
            for (let i = 0; i < counts; i++) electron_mesh.setColorAt(i, new THREE.Color(0x000000));
            electron_mesh.instanceColor.setUsage(THREE.StreamDrawUsage);
            scene.add(electron_mesh);
        }
        {
            const light = new THREE.AmbientLight(0x404040);
            scene.add(light);
        }
        {
            const light = new THREE.HemisphereLight(0xffffff, 0x888888);
            light.position.set(0, 1, 0);
            scene.add(light);
        }
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
        worker.addEventListener("message", function (e) {
            if (ended) return;
            const time = clock.getElapsedTime();
            worker?.postMessage?.({ time });
            e.data.states.forEach(({ x, y, z, c }, index) => {
                const matrix = new THREE.Matrix4();
                matrix.setPosition(x, y, z);
                electron_mesh.setMatrixAt(index, matrix);
                electron_mesh.setColorAt(index, new THREE.Color(c));
            });
            electron_mesh.instanceMatrix.needsUpdate = true;
            electron_mesh.instanceColor.needsUpdate = true;
        });
    }
    function animate() {
        if (!ended) window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    function dispose() {
        ended = true;
        renderer.dispose();
        controls.dispose();
        electron_mesh.dispose();
    }

    return {
        start: (node) => {
            parent = node;
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            init(node);
            animate();
        },
        stop: () => {
            dispose();
            canvas?.remove();
            resizeObserver?.disconnect();
            worker = parent = canvas = resizeObserver = null;
        },
    }
}