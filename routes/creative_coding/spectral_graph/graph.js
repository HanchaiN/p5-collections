export class Graph {
    constructor(directed = false) {
        this.node = [];
        this.adj = [];
        this.__directed = directed;
    }
    addNode(name) {
        if (name in this.node) {
            return false;
        }
        this.node.push(name);
        this.adj.push(new Array(this.node.length - 1).fill(0));
        this.adj.forEach(elem => elem.push(0));
        return true;
    }
    deleteNode(name) {
        let ind = this.node.findIndex(elem => elem == name);
        if (ind == -1) {
            return false;
        }
        this.node.splice(ind, 1);
        this.adj.splice(ind, 1);
        this.adj = this.adj.map(elem => elem.pop(ind));
        return true;
    }
    addEdge(a_, b_) {
        let a = this.node.findIndex(elem => elem == a_);
        let b = this.node.findIndex(elem => elem == b_);
        if (a * b < 0) {
            return false;
        }
        this.adj[a][b]++;
        if (this.__directed) {
            return true;
        }
        this.adj[b][a]++;
        return true;
    }
    removeEdge(a_, b_) {
        let a = this.node.findIndex(elem => elem == a_);
        let b = this.node.findIndex(elem => elem == b_);
        if (a * b < 0) {
            return false;
        }
        if (this.adj[a][b] <= 0 && (this.adj[b][a] <= 0 || this.__directed)) {
            return false;
        }
        this.adj[a][b]--;
        if (this.__directed) {
            return true;
        }
        this.adj[b][a]--;
        return true;
    }
    degree() {
        return this.adj.map(elem => elem.reduce((acc, val) => acc + val));
    }
    simplify() {
        this.adj = this.adj.map((elem, i) => elem.map((val, j) => i == j || val <= 0 ? 0 : 1));
        return true;
    }
    spectral() {
        let lap = math.subtract(
            math.diag(this.degree()),
            math.matrix(this.adj)
        );
        return math.transpose(math.eigs(lap).vectors)._data;
    }
}