import { Vector, randomGaussian, map } from "../utils/math.js";
import { PriorityQueue, minimum_spanning_tree } from "../utils/algo.js";

function delaunay_triangulation(nodes, supertriangle) {
    const edges = [];
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
    nodes.forEach((node, _i) => {
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
    });
    triangle.forEach(([ia, ib, ic]) => {
        if (ia > 2 && ib > 2 && !edges.some(([i, j]) => (i === ia - 3 && j === ib - 3) || (i === ib - 3 && j === ia - 3)))
            edges.push([ia - 3, ib - 3]);
        if (ib > 2 && ic > 2 && !edges.some(([i, j]) => (i === ib - 3 && j === ic - 3) || (i === ic - 3 && j === ib - 3)))
            edges.push([ib - 3, ic - 3]);
        if (ic > 2 && ia > 2 && !edges.some(([i, j]) => (i === ic - 3 && j === ia - 3) || (i === ia - 3 && j === ic - 3)))
            edges.push([ic - 3, ia - 3]);
    });
    return edges;
}

export function generateDungeon(GRID_SIZE) {
    const EXTRA_NODE_RATE = .125;
    const ROOM_SIZE_MIN = 5;
    const ROOM_SIZE_BOUND = .25 * Math.min(GRID_SIZE.x, GRID_SIZE.y);
    const ROOM_AREA_MAX = .5 * GRID_SIZE.x * GRID_SIZE.y;
    const ROOM_COUNT_BOUND = 1e2;
    const DIST_WEIGHT = [5, 20, 1, 10];
    const EST = (from, to) => {
        const order = 1;
        return 5 * Math.pow(Math.pow(Math.abs(to.x - from.x), order) + Math.pow(Math.abs(to.y - from.y), order), 1 / order);
    }
    const rooms = [];
    const nodes = [];
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
            nodes.push(new Vector(Math.round(_node.x), Math.round(_node.y)));
            room_area += (room.right - room.left) * (room.top - room.bottom);
        }
    }

    let edges = delaunay_triangulation(nodes, [
        new Vector(0, 0),
        new Vector(2 * GRID_SIZE.x, 0),
        new Vector(0, 2 * GRID_SIZE.y),
    ]);
    const tree = minimum_spanning_tree(edges.map(([ia, ib]) => [ia, ib, Vector.sub(nodes[ia], nodes[ib]).magSq()]))
    edges = edges.filter((_, ie) => tree.includes(ie) || Math.random() < EXTRA_NODE_RATE);

    const grid = new Array(GRID_SIZE.x).fill(0).map((_, ix) =>
        new Array(GRID_SIZE.y).fill(0).map((_, iy) => {
            if (rooms.some(({ left, right, top, bottom }) => left <= ix && ix <= right && bottom <= iy && iy <= top))
                return 1;
            return 0;
        })
    );
    edges.forEach(([i_begin, i_target]) => {
        const room_begin = rooms[i_begin], room_target = rooms[i_target];
        const begins = [
            nodes[i_begin],
            // ...new Array(room_begin.right - room_begin.left).fill(0).map((_, i) => ({ x: room_begin.left + i, y: room_begin.top })),
            // ...new Array(room_begin.top - room_begin.bottom).fill(0).map((_, i) => ({ x: room_begin.right, y: room_begin.top - i })),
            // ...new Array(room_begin.right - room_begin.left).fill(0).map((_, i) => ({ x: room_begin.right - i, y: room_begin.bottom })),
            // ...new Array(room_begin.top - room_begin.bottom).fill(0).map((_, i) => ({ x: room_begin.left, y: room_begin.bottom + i })),
        ], targets = [
            nodes[i_target],
            // ...new Array(room_target.right - room_target.left).fill(0).map((_, i) => ({ x: room_target.left + i, y: room_target.top })),
            // ...new Array(room_target.top - room_target.bottom).fill(0).map((_, i) => ({ x: room_target.right, y: room_target.top - i })),
            // ...new Array(room_target.right - room_target.left).fill(0).map((_, i) => ({ x: room_target.right - i, y: room_target.bottom })),
            // ...new Array(room_target.top - room_target.bottom).fill(0).map((_, i) => ({ x: room_target.left, y: room_target.bottom + i })),
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
        const lookup = new PriorityQueue((_) => _.est_distance);
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
    });

    return {
        grid,
        rooms,
        nodes: nodes.map(node => ({ x: node.x, y: node.y })),
        edges,
    };
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
    data.nodes?.forEach(p => {
        ctx.fillStyle = palette[4];
        ctx.beginPath();
        ctx.arc(
            unit.x * p.x, unit.y * p.y,
            1,
            0, Math.PI * 2
        );
        ctx.fill();
    });
    if (data.nodes)
        data.edges?.forEach(([ia, ib]) => {
            ctx.strokeStyle = palette[4];
            ctx.lineWidth = 1;
            const a = data.nodes[ia],
                b = data.nodes[ib];
            ctx.beginPath();
            ctx.moveTo(unit.x * a.x, unit.y * a.y);
            ctx.lineTo(unit.x * b.x, unit.y * b.y);
            ctx.stroke();
        });
}