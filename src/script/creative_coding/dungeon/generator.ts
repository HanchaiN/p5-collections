import { PriorityQueue } from "@/script/utils/algo";
import { Vector, map } from "@/script/utils/math";
import { randomGaussian } from "@/script/utils/math/random";

function getEdges(triangles: number[][]) {
  const edges: number[][] = [];
  triangles.forEach(([ia, ib, ic]) => {
    if (
      !edges.some(([i, j]) => (i === ia && j === ib) || (i === ib && j === ia))
    )
      edges.push([ia, ib]);
    if (
      !edges.some(([i, j]) => (i === ib && j === ic) || (i === ic && j === ib))
    )
      edges.push([ib, ic]);
    if (
      !edges.some(([i, j]) => (i === ic && j === ia) || (i === ia && j === ic))
    )
      edges.push([ic, ia]);
  });
  return edges;
}
function* delaunay_triangulation(nodes: Vector[], supertriangle: Vector[]) {
  const nodes_: Vector[] = [];
  {
    const [a, b, c] = supertriangle;
    if (
      a.x * b.y + c.x * a.y + b.x * c.y - (c.x * b.y + a.x * c.y + b.x * a.y) >
      0
    ) {
      nodes_.push(a, b, c);
    } else {
      nodes_.push(c, b, a);
    }
  }
  nodes_.push(...nodes);
  let triangle: number[][] = [];
  triangle.push([0, 1, 2]);
  for (let _i = 0; _i < nodes.length; _i++) {
    const node = nodes[_i];
    const i = _i + 3;
    const t: number[] = [];
    triangle.forEach(([ia, ib, ic], it) => {
      const a = nodes_[ia];
      const b = nodes_[ib];
      const c = nodes_[ic];
      const a_ = Vector.sub(a, node);
      const b_ = Vector.sub(b, node);
      const c_ = Vector.sub(c, node);
      const s_ =
        a_.x * b_.y * c_.magSq() +
        c_.x * a_.y * b_.magSq() +
        b_.x * c_.y * a_.magSq() -
        (c_.x * b_.y * a_.magSq() +
          a_.x * c_.y * b_.magSq() +
          b_.x * a_.y * c_.magSq());
      if (s_ > 0) t.push(it);
    });
    const pol: number[][] = [];
    t.forEach((it) => {
      const [ia, ib, ic] = triangle[it];
      if (
        t.every((it_) => {
          const [ia_, ib_, ic_] = triangle[it_];
          return (
            it === it_ ||
            (ia !== ia_ && ia !== ib_ && ia !== ic_) ||
            (ib !== ia_ && ib !== ib_ && ib !== ic_)
          );
        })
      )
        pol.push([ia, ib]);
      if (
        t.every((it_) => {
          const [ia_, ib_, ic_] = triangle[it_];
          return (
            it === it_ ||
            (ib !== ia_ && ib !== ib_ && ib !== ic_) ||
            (ic !== ia_ && ic !== ib_ && ic !== ic_)
          );
        })
      )
        pol.push([ib, ic]);
      if (
        t.every((it_) => {
          const [ia_, ib_, ic_] = triangle[it_];
          return (
            it === it_ ||
            (ic !== ia_ && ic !== ib_ && ic !== ic_) ||
            (ia !== ia_ && ia !== ib_ && ia !== ic_)
          );
        })
      )
        pol.push([ic, ia]);
    });
    triangle = triangle.filter((_, it) => !t.includes(it));
    pol.forEach(([ia, ib]) => triangle.push([ia, ib, i]));
    yield getEdges(
      triangle
        .filter(([ia, ib, ic]) => ia > 2 && ib > 2 && ic > 2)
        .map(([ia, ib, ic]) => [ia - 3, ib - 3, ic - 3]),
    );
  }
  return getEdges(
    triangle
      .filter(([ia, ib, ic]) => ia > 2 && ib > 2 && ic > 2)
      .map(([ia, ib, ic]) => [ia - 3, ib - 3, ic - 3]),
  );
}
function* minimum_spanning_tree(edges: number[][]) {
  const tree_edges: number[] = [];
  const vertex: number[] = [];
  const lookup = new PriorityQueue<{ ie: number; d: number }>((_) => _.d);
  function addNode(iv: number) {
    if (vertex.includes(iv)) return;
    vertex.push(iv);
    edges.forEach(([ia, ib, d], ie) => {
      if (ia === iv || ib === iv) lookup.push({ ie, d });
    });
  }
  addNode(0);
  while (lookup.top()) {
    const { ie } = lookup.pop()!;
    const [ia, ib] = edges[ie];
    const a_ = vertex.includes(ia);
    const b_ = vertex.includes(ib);
    if (a_ && b_) continue;
    if (a_) addNode(ib);
    if (b_) addNode(ia);
    tree_edges.push(ie);
    yield tree_edges;
  }
  return tree_edges;
}
export enum GRID_STATE {
  EMPTY = 1,
  ROOM = 2,
  BORDER = 3,
  PATH = 4,
  INTERNAL_PATH = 5,
  DOOR = 6,
  SEARCH_PATH = 7,
  SEARCH_CURR = 8,
}
export function* generateDungeon(GRID_SIZE: { x: number; y: number }) {
  const EXTRA_NODE_RATE = 0.125;
  const ROOM_COUNT_MAX = 100;
  const ROOM_SIZE_MIN = 5;
  const ROOM_SIZE_MAX = 0.25 * Math.min(GRID_SIZE.x, GRID_SIZE.y);
  const ROOM_AREA_TOTAL = 0.5 * GRID_SIZE.x * GRID_SIZE.y;
  const ROOM_PADDING = 3;
  const DIST_VAL = new Proxy<{ [key in GRID_STATE]?: number }>(
    {
      [GRID_STATE.EMPTY]: 25,
      [GRID_STATE.ROOM]: 1,
      [GRID_STATE.BORDER]: 100,
      [GRID_STATE.PATH]: 1,
      [GRID_STATE.INTERNAL_PATH]: 1,
      [GRID_STATE.DOOR]: 1,
    },
    {
      get: (target, name) => target[name as unknown as GRID_STATE] ?? Infinity,
    },
  ) as { [key in GRID_STATE]: number };
  const DIST_VAR = new Proxy<{ [key in GRID_STATE]?: number }>(
    {
      [GRID_STATE.EMPTY]: 10,
    },
    {
      get: (target, name) => target[name as unknown as GRID_STATE] ?? 0,
    },
  ) as { [key in GRID_STATE]: number };
  const rooms: {
    left: number;
    right: number;
    bottom: number;
    top: number;
    valid: boolean;
  }[] = [];
  const nodes: Vector[] = [];
  const grid = new Array(GRID_SIZE.x)
    .fill(null)
    .map(() => new Array(GRID_SIZE.y).fill(null).map(() => GRID_STATE.EMPTY));
  let edges: number[][] = [];
  let tree: number[] = [];
  yield { grid, rooms, nodes, edges, tree };
  {
    let room_area = 0;
    for (let i = 0; i < ROOM_COUNT_MAX && room_area < ROOM_AREA_TOTAL; i++) {
      const aspect = Math.abs(randomGaussian(1, 0.5 / 3));
      const width =
        ROOM_SIZE_MIN * Math.max(1, 1 / aspect) +
        Math.abs(randomGaussian(0, ROOM_SIZE_MAX / 3));
      const height = width * aspect;
      const node = new Vector(
        map(
          Math.random(),
          0,
          1,
          ROOM_PADDING + width / 2,
          GRID_SIZE.x - ROOM_PADDING - width / 2,
        ),
        map(
          Math.random(),
          0,
          1,
          ROOM_PADDING + height / 2,
          GRID_SIZE.y - ROOM_PADDING - height / 2,
        ),
      );
      const room = {
        left: Math.round(node.x - width / 2),
        right: Math.round(node.x + width / 2),
        bottom: Math.round(node.y - height / 2),
        top: Math.round(node.y + height / 2),
        valid: room_area < ROOM_AREA_TOTAL,
      };
      room.valid &&= rooms.every(
        (room_) =>
          room.left > room_.right + ROOM_PADDING ||
          room.right + ROOM_PADDING < room_.left ||
          room.bottom > room_.top + ROOM_PADDING ||
          room.top + ROOM_PADDING < room_.bottom,
      );
      if (room.valid) {
        rooms.push(room);
        nodes.push(node);
        room_area +=
          (room.right - room.left + 1) * (room.top - room.bottom + 1);
        for (let ix = room.left; ix <= room.right; ix++)
          for (let iy = room.bottom; iy <= room.top; iy++)
            grid[ix][iy] =
              ix === room.left ||
              ix === room.right ||
              iy === room.bottom ||
              iy === room.top
                ? GRID_STATE.BORDER
                : GRID_STATE.ROOM;
      }
      yield {
        grid,
        rooms: rooms.concat(room),
        nodes: nodes.concat(node),
        edges,
        tree,
      };
    }
  }
  yield { grid, rooms, nodes, edges, tree };

  {
    const edges_gen = delaunay_triangulation(nodes, [
      new Vector(0, 0),
      new Vector(2 * GRID_SIZE.x, 0),
      new Vector(0, 2 * GRID_SIZE.y),
    ]);
    while (true) {
      const { value, done } = edges_gen.next();
      edges = value;
      yield { grid, rooms, nodes, edges, tree };
      if (done) break;
    }
  }
  {
    const tree_gen = minimum_spanning_tree(
      edges.map(([ia, ib]) => [
        ia,
        ib,
        Vector.sub(nodes[ia], nodes[ib]).magSq(),
      ]),
    );
    while (true) {
      const { value, done } = tree_gen.next();
      tree = value;
      yield { grid, rooms, nodes, edges, tree };
      if (done) break;
    }
  }
  {
    edges.sort((a, b) => {
      let ia = tree.indexOf(edges.indexOf(a)),
        ib = tree.indexOf(edges.indexOf(b));
      if (ia < 0) ia = Infinity;
      if (ib < 0) ib = Infinity;
      return ia - ib;
    });
    tree = tree.map((_, i) => i);
    for (let i = edges.length - 1; i >= tree.length; i--) {
      if (Math.random() >= EXTRA_NODE_RATE) edges.splice(i, 1);
      yield { grid, rooms, nodes, edges, tree };
    }
  }

  for (const [i_begin, i_target] of edges) {
    const grid_ = grid.map((_) => _.map((_) => _));
    const EST = (
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => {
      let dist = 0;
      const steep = Math.abs(to.y - from.y) > Math.abs(to.x - from.x);
      const fpart = (x: number) => x - Math.floor(x);
      const rfpart = (x: number) => 1 - fpart(x);
      const put = (x: number, y: number, w: number) => {
        const [x_, y_] = steep ? [y, x] : [x, y];
        if (x_ >= grid.length || y_ >= grid[x_].length) return;
        dist += DIST_VAL[grid[x_][y_]] * w;
      };
      let x0 = from.x,
        y0 = from.y,
        x1 = to.x,
        y1 = to.y,
        dx = x1 - x0,
        dy = y1 - y0;
      if (steep) [x0, y0, x1, y1, dx, dy] = [y0, x0, y1, x1, dy, dx];
      if (x1 < x0) [x0, x1, y0, y1] = [x1, x0, y1, y0];
      const grad = dx === 0 ? 1 : dy / dx;
      let intery = y0 + rfpart(x0) * grad;
      const endpoint = (x: number, y: number) => {
        const xend = Math.round(x);
        const yend = y + grad * (xend - x);
        const xgap = rfpart(x + 0.5);
        const px = Math.floor(xend),
          py = Math.floor(yend);
        put(px, py, rfpart(yend) * xgap);
        put(px, py + 1, fpart(yend) * xgap);
        return px;
      };
      const xstart = endpoint(x0, y0) + 1;
      const xend = endpoint(x1, y1);
      for (let x = xstart; x < xend; x++) {
        const y = Math.floor(intery);
        put(x, y, rfpart(intery));
        put(x, y + 1, fpart(intery));
        intery += grad;
      }
      return dist;
    };
    const begins = [
        new Vector(Math.round(nodes[i_begin].x), Math.round(nodes[i_begin].y)),
      ],
      targets = [
        new Vector(
          Math.round(nodes[i_target].x),
          Math.round(nodes[i_target].y),
        ),
      ];
    const target = {
      x: nodes[i_target].x,
      y: nodes[i_target].y,
    };
    const state: {
      parent: { x: number; y: number } | null;
      distance: number;
    }[][] = new Array(GRID_SIZE.x).fill(null).map(() =>
      new Array(GRID_SIZE.y).fill(null).map(() => ({
        parent: null,
        distance: Infinity,
      })),
    );
    const lookup = new PriorityQueue<{
      p: { x: number; y: number };
      distance: number;
      est_distance: number;
    }>((_) => _.est_distance);
    const addNode = (
      p: { x: number; y: number },
      parent: { x: number; y: number } | null,
      dist: number,
    ) => {
      {
        if (p.x < 0 || p.x >= GRID_SIZE.x || p.y < 0 || p.y >= GRID_SIZE.y)
          return;
        for (let p_ = parent; p_ !== null; p_ = state[p_.x][p_.y].parent) {
          if (p_.x === p.x && p_.y === p.y) return;
        }
        const cost = Math.abs(
          randomGaussian(DIST_VAL[grid[p.x][p.y]], DIST_VAR[grid[p.x][p.y]]),
        );
        const distance = dist + cost;
        if (state[p.x][p.y].distance <= distance) return;
        const est = EST(p, target);
        const est_distance = distance + est;
        state[p.x][p.y].distance = distance;
        state[p.x][p.y].parent = parent;
        lookup.push({
          p,
          distance,
          est_distance,
        });
      }
    };
    begins.forEach((p) => {
      addNode(p, null, 0);
    });
    let curr: { x: number; y: number } | null = null;
    while (lookup.top()) {
      const { p, distance } = lookup.pop()!;
      if (state[p.x][p.y].distance < distance) continue;
      if (targets.some((t) => t.x === p.x && t.y === p.y)) {
        curr = p;
        break;
      }
      [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 },
      ]
        .sort(() => 0.5 - Math.random())
        .forEach((p_) => {
          addNode(p_, p, distance);
        });
      let p_: typeof p | null = p;
      do {
        grid_[p_.x][p_.y] = GRID_STATE.PATH;
      } while ((p_ = state[p_.x][p_.y].parent) !== null);
      grid_[p.x][p.y] = GRID_STATE.SEARCH_CURR;
      yield { grid: grid_, rooms, nodes, edges, tree };
      p_ = p;
      do {
        grid_[p_.x][p_.y] = GRID_STATE.SEARCH_PATH;
      } while ((p_ = state[p_.x][p_.y].parent) !== null);
    }
    if (curr === null) continue;
    do {
      switch (grid[curr.x][curr.y]) {
        case GRID_STATE.EMPTY:
          grid[curr.x][curr.y] = GRID_STATE.PATH;
          break;
        case GRID_STATE.ROOM:
          grid[curr.x][curr.y] = GRID_STATE.INTERNAL_PATH;
          break;
        case GRID_STATE.BORDER:
          grid[curr.x][curr.y] = GRID_STATE.DOOR;
          break;
        default:
      }
    } while ((curr = state[curr.x][curr.y].parent) != null);
    yield { grid, rooms, nodes, edges, tree };
  }
  yield { grid, rooms, nodes, edges, tree };
  return;
}

export interface IPalette {
  background: string;
  border: string;
  room: string;
  path: string;
  door: string;
  search_path: string;
  search_curr: string;
  invalid: string;
  node: string;
  edge: string;
}
export function drawDungeon(
  data: {
    grid: number[][];
    rooms: {
      left: number;
      right: number;
      bottom: number;
      top: number;
      valid: boolean;
    }[];
    nodes: { x: number; y: number }[];
    edges: number[][];
    tree: number[];
  },
  ctx: CanvasRenderingContext2D,
  unit: { x: number; y: number },
  palette: IPalette,
) {
  ctx.lineWidth = 0;
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!data) return;
  data.grid?.forEach((_, ix) =>
    _.forEach((v, iy) => {
      switch (v) {
        case GRID_STATE.SEARCH_CURR:
          ctx.fillStyle = palette.search_curr;
          break;
        case GRID_STATE.SEARCH_PATH:
          ctx.fillStyle = palette.search_path;
          break;
        case GRID_STATE.PATH:
          ctx.fillStyle = palette.path;
          break;
        case GRID_STATE.DOOR:
          ctx.fillStyle = palette.door;
          break;
        case GRID_STATE.BORDER:
        case GRID_STATE.INTERNAL_PATH:
        case GRID_STATE.ROOM:
          ctx.fillStyle = palette.room;
          break;
        case GRID_STATE.EMPTY:
          ctx.fillStyle = palette.background;
          break;
        default:
          return;
      }
      ctx.beginPath();
      ctx.rect(unit.x * ix, unit.y * iy, unit.x, unit.y);
      ctx.fill();
    }),
  );
  data.rooms?.forEach((room) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = room.valid ? palette.border : palette.invalid;
    ctx.strokeRect(
      unit.x * room.left,
      unit.y * room.bottom,
      unit.x * (room.right - room.left + 1),
      unit.y * (room.top - room.bottom + 1),
    );
  });
  if (!data.nodes) return;
  data.nodes.forEach((p) => {
    ctx.fillStyle = palette.node;
    ctx.beginPath();
    ctx.arc(unit.x * p.x, unit.y * p.y, 1, 0, Math.PI * 2);
    ctx.fill();
  });
  if (!data.edges) return;
  data.edges?.forEach(([ia, ib], i) => {
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = data.tree?.includes?.(i) ? 1.5 : 1;
    const a = data.nodes[ia],
      b = data.nodes[ib];
    ctx.beginPath();
    ctx.moveTo(unit.x * a.x, unit.y * a.y);
    ctx.lineTo(unit.x * b.x, unit.y * b.y);
    ctx.stroke();
  });
}
