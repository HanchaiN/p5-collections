import { generateNav } from "./navbar.js";
import { HTTP_STATUS } from "./utils.js";
export class Route {
    /**
     * @type {string}
    */
    filePath = ""
    /**
     * @type {string}
    */
    scriptPath = ""
    /**
     * @type {boolean}
    */
    isNav = true;
    /**
     * @type {string}
     */
    name = ""
    /**
     * @type {string}
     */
    title = "";
    /**
     * @param {{filePath: string, scriptPath: string, isNav: boolean, name: string, title: string}} 
     */
    constructor({ filePath, scriptPath = "", isNav = true, name, title = name }) {
        this.filePath = filePath;
        this.scriptPath = scriptPath;
        this.isNav = isNav;
        this.name = name;
        this.title = title;
    }
}
export class Router {
    /**
     * @type {Router}
     */
    static instance = null;
    /**
     * @type {Map<string, Route>}
     */
    routes = new Map();
    /**
     * @type {() => void}
     */
    stop = () => { };
    /**
     * 
     * @param {Route[]} routes
     * @param {HTMLElement} rootElem
     */
    constructor(rootElem) {
        if (Router.instance !== null) {
            throw new Error("Singleton classes can't be instantiated more than once.");
        }
        this.rootElem = rootElem;
        Router.instance = this;
    }
    init() {
        this.update();
        window.addEventListener('hashchange', function (e) {
            Router.instance.update();
        });
        generateNav(document.querySelector(".menu"));
    }
    update() {
        this.goToRoute(this.routes.get(window.location.hash.substring(1)) ?? null);
    }
    /**
     * 
     * @param {Route} route 
     */
    goToRoute(route = null) {
        const fallback = route != null;
        if (route == null) {
            route = this.routes.get("404");
        }
        let url = '/routes/' + route.filePath,
            scriptUrl = '/routes/' + route.scriptPath,
            xhttp = new XMLHttpRequest();
        xhttp.addEventListener('readystatechange', function () {
            if (this.readyState === this.DONE) {
                if (this.status !== HTTP_STATUS.OK) {
                    if (fallback) Router.instance.goToRoute();
                    return;
                }
                Router.instance.stop();
                Router.instance.rootElem.innerHTML = this.responseText;
                if (route.scriptPath)
                    import(scriptUrl).then(module => {
                        const loader = module.default();
                        loader.start();
                        Router.instance.stop = loader.stop;
                    }).catch(_ => {
                        if (fallback) Router.instance.goToRoute()
                    });
                document.title = route.title;
            }
        });
        xhttp.open('GET', url, true);
        xhttp.send();
    }
}