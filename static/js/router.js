import { generateNav } from "./navbar.js";
export class Route {
    /**
     * @type {string}
    */
    filePath = ""
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
     * 
     * @param {Object} param
     * @param {string} param.filePath
     * @param {boolean} param.isNav
     * @param {string} param.name
     * @param {string} param.title
     */
    constructor({ filePath, isNav = true, name, title = name }) {
        this.filePath = filePath;
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
        generateNav(document.querySelector(".menu"));
        window.addEventListener('hashchange', function (e) {
            window.location.reload();
        });
        window.addEventListener('load', function onLoad(e) {
            Router.instance.update();
            window.removeEventListener('load', onLoad);
        })
    }
    update() {
        this.goToRoute(window.location.hash.substring(1));
    }
    /**
     * @param {string} route 
     */
    goToRoute(route = null) {
        const data = this.routes.get(route) ?? this.routes.get("404");
        htmx.ajax('GET', data.filePath, {
            target: '#main-content',
            swap: 'innerHTML',
        });
    }
}