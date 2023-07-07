import { PriorityQueue } from "../utils/algo.js";
import { Vector, map, randomGaussian } from "../utils/math.js";

function getEdges(triangles) {
    const edges = [];
    triangles.forEach(([ia, ib, ic]) => {
        if (!edges.some(([i, j]) => (i === ia && j === ib) || (i === ib && j === ia)))
            edges.push([ia, ib]);
        if (!edges.some(([i, j]) => (i === ib && j === ic) || (i === ic && j === ib)))
            edges.push([ib, ic]);
        if (!edges.some(([i, j]) => (i === ic && j === ia) || (i === ia && j === ic)))
            edges.push([ic, ia]);
    });
    return edges;
}

function* delaunay_triangulation(nodes, supertriangle) {
    const nodes_ = [];
    {
        const [a, b, c] = supertriangle;
        if (
            (
                a.x * b.y
                + c.x * a.y
                + b.x * c.y
            ) - (
                c.x * b.y
                + a.x * c.y
                + b.x * a.y
            ) > 0
        ) {
            nodes_.push(a, b, c);
        } else {
            nodes_.push(c, b, a);
        }
    }
    nodes_.push(...nodes);
    let triangle = [];
    triangle.push([0, 1, 2]);
    for (let _i = 0; _i < nodes.length; _i++) {
        const node = nodes[_i];
        const i = _i + 3;
        const t = [];
        triangle.forEach(([ia, ib, ic], it) => {
            const a = nodes_[ia];
            const b = nodes_[ib];
            const c = nodes_[ic];
            const a_ = Vector.sub(a, node);
            const b_ = Vector.sub(b, node);
            const c_ = Vector.sub(c, node);
            const s_ = (
                (
                    a_.x * b_.y * c_.magSq()
                    + c_.x * a_.y * b_.magSq()
                    + b_.x * c_.y * a_.magSq()
                ) - (
                    c_.x * b_.y * a_.magSq()
                    + a_.x * c_.y * b_.magSq()
                    + b_.x * a_.y * c_.magSq()
                )
            );
            if (s_ > 0) t.push(it);
        });
        const pol = [];
        t.forEach((it) => {
            const [ia, ib, ic] = triangle[it];
            if (
                t.every((it_) => {
                    const [ia_, ib_, ic_] = triangle[it_];
                    return it === it_
                        || (ia !== ia_ && ia !== ib_ && ia !== ic_)
                        || (ib !== ia_ && ib !== ib_ && ib !== ic_);
                }
                )
            )
                pol.push([ia, ib]);
            if (
                t.every((it_) => {
                    const [ia_, ib_, ic_] = triangle[it_];
                    return it === it_
                        || (ib !== ia_ && ib !== ib_ && ib !== ic_)
                        || (ic !== ia_ && ic !== ib_ && ic !== ic_);
                })
            )
                pol.push([ib, ic]);
            if (
                t.every((it_) => {
                    const [ia_, ib_, ic_] = triangle[it_];
                    return it === it_
                        || (ic !== ia_ && ic !== ib_ && ic !== ic_)
                        || (ia !== ia_ && ia !== ib_ && ia !== ic_);
                })
            )
                pol.push([ic, ia]);
        });
        triangle = triangle.filter((_, it) => !t.includes(it));
        pol.forEach(([ia, ib]) => triangle.push([ia, ib, i]));
        yield getEdges(triangle.filter(([ia, ib, ic]) => ia > 2 && ib > 2 && ic > 2).map(([ia, ib, ic]) => [ia - 3, ib - 3, ic - 3]));
    }
    return getEdges(triangle.filter(([ia, ib, ic]) => ia > 2 && ib > 2 && ic > 2).map(([ia, ib, ic]) => [ia - 3, ib - 3, ic - 3]));
}

function* minimum_spanning_tree(edges) {
    const tree_edges = [];
    const vertex = [];
    const lookup = new PriorityQueue((_) => _.d);
    function addNode(iv) {
        if (vertex.includes(iv)) return;
        vertex.push(iv);
        edges.forEach(([ia, ib, d], ie) => {
            if (ia === iv || ib === iv)
                lookup.push({ ie, d });
        });
    }
    addNode(0);
    while (lookup.top()) {
        const { ie } = lookup.pop();
        const [ia, ib] = edges[ie];
        const a_ = vertex.includes(ia);
        const b_ = vertex.includes(ib);
        if (a_ && b_) continue;
        if (a_) addNode(ib);
        if (b_) addNode(ia);
        tree_edges.push(ie);
        yield (tree_edges);
    }
    return (tree_edges);
}

export function* generateDungeon(GRID_SIZE) {
    const EXTRA_NODE_RATE = .125;
    const ROOM_SIZE_MIN = 5;
    const ROOM_SIZE_BOUND = .25 * Math.min(GRID_SIZE.x, GRID_SIZE.y);
    const ROOM_AREA_MAX = .5 * GRID_SIZE.x * GRID_SIZE.y;
    const ROOM_COUNT_BOUND = 1e2;
    const DIST_WEIGHT = [2, 5, 1, 0];
    const rooms = [];
    const nodes = [];
    const grid = new Array(GRID_SIZE.x).fill(0).map(_ =>
        new Array(GRID_SIZE.y).fill(0)
    );
    let edges = [];
    let tree = [];
    yield ({ grid, rooms, nodes, edges, tree });
    {
        let room_area = 0;
        for (let i = 0; i < ROOM_COUNT_BOUND; i++) {
            if (room_area >= ROOM_AREA_MAX) break;
            const aspect = Math.abs(randomGaussian(1, .5 / 3));
            const width = ROOM_SIZE_MIN * Math.max(1, 1 / aspect) + Math.abs(randomGaussian(0, ROOM_SIZE_BOUND / 3));
            const height = width * aspect
            const _node = new Vector(
                map(Math.random(), 0, 1, width / 2, GRID_SIZE.x - width / 2),
                map(Math.random(), 0, 1, height / 2, GRID_SIZE.y - height / 2),
            );
            const room = {
                left: Math.round(_node.x - width / 2),
                right: Math.round(_node.x + width / 2),
                bottom: Math.round(_node.y - height / 2),
                top: Math.round(_node.y + height / 2),
            };
            if (rooms.every(room_ =>
                (room.left > room_.right + 1 || room.right + 1 < room_.left)
                || (room.bottom > room_.top + 1 || room.top + 1 < room_.bottom)
            )) {
                rooms.push(room);
                nodes.push(_node);
                room_area += (room.right - room.left) * (room.top - room.bottom);
                for (let ix = room.left; ix <= room.right; ix++)
                    for (let iy = room.bottom; iy <= room.top; iy++)
                        if (typeof grid?.[ix]?.[iy] === "number")
                            grid[ix][iy] = 1;
            }
            yield ({ grid, rooms: rooms.concat(room), nodes: nodes.concat(_node), edges, tree });
        }
    }
    yield ({ grid, rooms, nodes, edges, tree });

    {
        const edges_gen = delaunay_triangulation(nodes, [
            new Vector(0, 0),
            new Vector(2 * GRID_SIZE.x, 0),
            new Vector(0, 2 * GRID_SIZE.y),
        ]);
        while (true) {
            const { value, done } = edges_gen.next();
            edges = value;
            yield ({ grid, rooms, nodes, edges, tree });
            if (done)
                break;
        }
    }
    {
        const tree_gen = minimum_spanning_tree(edges.map(([ia, ib]) => [ia, ib, Vector.sub(nodes[ia], nodes[ib]).magSq()]));
        while (true) {
            const { value, done } = tree_gen.next();
            tree = value;
            yield ({ grid, rooms, nodes, edges, tree });
            if (done)
                break;
        }
    }
    {
        edges.sort((a, b) => tree.indexOf(edges.indexOf(b)) - tree.indexOf(edges.indexOf(a)));
        tree = tree.map((_, i) => i);
        for (let i = edges.length - 1; i >= tree.length; i--) {
            if (Math.random() >= EXTRA_NODE_RATE)
                edges.splice(i);
            yield ({ grid, rooms, nodes, edges, tree });
        }
    }

    for (let [i_begin, i_target] of edges) {
        const begins = [
            new Vector(Math.round(nodes[i_begin].x), Math.round(nodes[i_begin].y)),
        ], targets = [
            new Vector(Math.round(nodes[i_target].x), Math.round(nodes[i_target].y)),
        ];
        const target = {
            x: nodes[i_target].x,
            y: nodes[i_target].y,
        };
        const state = new Array(GRID_SIZE.x).fill(0).map(_ =>
            new Array(GRID_SIZE.y).fill(0).map(_ => ({
                parent: null,
                distance: Infinity,
            }))
        );
        const grid_ = grid.map(_ => _.map(_ => _));
        const lookup = new PriorityQueue((_) => _.est_distance);
        const EST = (from, to) => {
            let dist = 0;
            const steep = Math.abs(to.y - from.y) > Math.abs(to.x - from.x);
            const fpart = (x) => x - Math.floor(x);
            const rfpart = (x) => 1 - fpart(x);
            const p = (x, y) => (steep ? [y, x] : [x, y]);
            const put = (x, y, w) => {
                const [x_, y_] = p(x, y);
                dist += DIST_WEIGHT?.[grid?.[x_]?.[y_] ?? -1] ?? 10000 * w;
            }
            let x0 = from.x,
                y0 = from.y,
                x1 = to.x,
                y1 = to.y,
                dx = Math.abs(x1 - x0),
                dy = Math.abs(y1 - y0);
            if (steep)
                [x0, y0, x1, y1, dx, dy] = [y0, x0, y1, x1, dy, dx];
            if (x1 < x0)
                [x0, x1, y0, y1] = [x1, x0, y1, y0];
            const grad = dx === 0 ? 1 : dy / dx;
            let intery = y0 + rfpart(x0) * grad;
            const endpoint = (x, y) => {
                const xend = Math.round(x);
                const yend = y + grad * (xend - x);
                const xgap = rfpart(x + .5);
                const px = Math.floor(xend), py = Math.floor(yend);
                put(px, py, rfpart(yend) * xgap);
                put(px, py + 1, fpart(yend) * xgap);
                return (px);
            }
            const xstart = endpoint(x0, y0) + 1;
            const xend = endpoint(x1, y1);
            for (let x = xstart; x < xend; x++) {
                let y = Math.floor(intery);
                put(x, y, rfpart(intery));
                put(x, y + 1, fpart(intery));
                intery += grad;
            }
            return dist * randomGaussian(1, 0.3);
        }
        function addNode(p, parent, dist) {
            {
                if (
                    p.x < 0 || p.x >= GRID_SIZE.x
                    || p.y < 0 || p.y >= GRID_SIZE.y
                ) return;
                const cost = DIST_WEIGHT[grid[p.x][p.y]];
                const distance = dist + cost;
                const est = EST(p, target);
                const est_distance = distance + est;
                if (state[p.x][p.y].distance <= distance) return;
                state[p.x][p.y].distance = distance;
                state[p.x][p.y].parent = parent;
                lookup.push({
                    p,
                    distance,
                    est_distance,
                });
            }
        }
        begins.forEach(p => {
            addNode(p, { x: -1, y: -1 }, 0);
        })
        let curr;
        while (lookup.top()) {
            const { p, distance } = lookup.pop();
            if (targets.some(t => t.x === p.x && t.y === p.y)) {
                curr = p;
                break;
            }
            [
                { x: p.x + 1, y: p.y },
                { x: p.x - 1, y: p.y },
                { x: p.x, y: p.y + 1 },
                { x: p.x, y: p.y - 1 },
            ].sort(_ => .5 - Math.random()).forEach(p_ => {
                addNode(p_, p, distance);
            });
            grid_[p.x][p.y] = 5;
            yield ({ grid: grid_, rooms, nodes, edges, tree });
            grid_[p.x][p.y] = 4;
        }
        do {
            switch (grid[curr.x][curr.y]) {
                case 0:
                    grid[curr.x][curr.y] = 2;
                    break;
                case 1:
                    grid[curr.x][curr.y] = 3;
                    break;
                default:
            }
        } while ((curr = state[curr.x][curr.y].parent).x !== -1);
        yield ({ grid, rooms, nodes, edges, tree });
    }
    return ({ grid, rooms, nodes, edges, tree });
}

export function drawDungeon(data, ctx, unit, palette) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    data.grid?.forEach((_, ix) => _.forEach((v, iy) => {
        switch (v) {
            case 0:
                ctx.fillStyle = palette[0];
                break;
            case 1:
                ctx.fillStyle = palette[1];
                break;
            case 2:
                ctx.fillStyle = palette[3];
                break;
            case 3:
                if (
                    data.grid[ix + 1][iy] === 2
                    || data.grid[ix - 1][iy] === 2
                    || data.grid[ix][iy + 1] === 2
                    || data.grid[ix][iy - 1] === 2
                )
                    ctx.fillStyle = palette[2];
                else
                    ctx.fillStyle = palette[1];
                break;
            case 4:
                ctx.fillStyle = palette[2];
                break;
            case 5:
                ctx.fillStyle = palette[4];
                break;
            default:
                ctx.fillStyle = "#000";
        }
        ctx.beginPath();
        ctx.rect(
            unit.x * ix, unit.y * iy,
            unit.x, unit.y,
        );
        ctx.fill();
    }))
    data.rooms?.forEach((room) => {
        ctx.lineWidth = 1;
        ctx.strokeStyle = palette[2];
        ctx.beginPath();
        ctx.rect(
            unit.x * room.left,
            unit.y * room.bottom,
            unit.x * (room.right - room.left + 1),
            unit.y * (room.top - room.bottom + 1),
        );
        ctx.stroke();
    });
    if (!data.nodes) return;
    data.nodes.forEach(p => {
        ctx.fillStyle = palette[4];
        ctx.beginPath();
        ctx.arc(
            unit.x * p.x, unit.y * p.y,
            1,
            0, Math.PI * 2
        );
        ctx.fill();
    });
    if (!data.edges) return;
    data.edges?.forEach(([ia, ib], i) => {
        ctx.strokeStyle = palette[4];
        ctx.lineWidth = data.tree?.includes?.(i) ? 1.5 : 1;
        const a = data.nodes[ia], b = data.nodes[ib];
        ctx.beginPath();
        ctx.moveTo(unit.x * a.x, unit.y * a.y);
        ctx.lineTo(unit.x * b.x, unit.y * b.y);
        ctx.stroke();
    });
}