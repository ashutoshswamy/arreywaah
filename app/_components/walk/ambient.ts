import * as THREE from "three";
import { AMBIENT_LAYOUT } from "./ambient-layout";
import type { WorldPoint } from "./stations";

type Builders = {
  root: THREE.Group;
  group: (
    parent: THREE.Group,
    name: string,
    x?: number,
    y?: number,
    z?: number,
  ) => THREE.Group;
  box: (
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => THREE.Mesh;
  softBox: (
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => THREE.Mesh;
  cylinder: (
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
  ) => THREE.Mesh;
  material: (color: string, roughness?: number) => THREE.MeshStandardMaterial;
  sign: (
    parent: THREE.Group,
    text: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    background?: string,
    foreground?: string,
  ) => THREE.Mesh;
  sceneryBox: (
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => void;
  batchRigid: (node: THREE.Group) => void;
};

/** Pure poses from the journey clock: no timers, random seeds, or independent frame loop. */
export function createAmbient(b: Builders) {
  const {
    root,
    group,
    box,
    softBox,
    cylinder,
    material,
    sign,
    sceneryBox,
    batchRigid,
  } = b;
  const ink = material("#17123f");
  const cream = material("#fff4d6");
  const silver = material("#b7c5c6", 0.55);
  const glass = material("#315868", 0.35);
  const yellow = material("#ffb81c");
  const teal = material("#27c2b0");
  const pink = material("#e8336d");
  const rubber = material("#282a32");
  const ballast = material("#938c80");
  const sleeper = material("#695e53");
  const railway = AMBIENT_LAYOUT.railway;

  for (const x of railway.lanes) {
    sceneryBox(ballast, x, 0.205, 0, 3.8, 0.09, railway.maxZ - railway.minZ);
    for (let z = railway.minZ + 1; z <= railway.maxZ - 1; z += 1.35)
      sceneryBox(sleeper, x, 0.27, z, 2.8, 0.04, 0.22);
    for (const dx of [-0.83, 0.83])
      sceneryBox(
        silver,
        x + dx,
        0.32,
        0,
        0.075,
        0.06,
        railway.maxZ - railway.minZ,
      );
  }
  // Fences never cross either running line; overhead arms clear the train roofs.
  for (const x of [railway.westFence, railway.eastFence]) {
    for (const y of [0.75, 1.35])
      sceneryBox(teal, x, y, 0, 0.07, 0.07, railway.maxZ - railway.minZ);
    for (let z = railway.minZ + 1; z <= railway.maxZ - 1; z += 2.7)
      sceneryBox(cream, x, 0.85, z, 0.1, 1.35, 0.1);
  }
  for (let z = -112; z <= 112; z += 14) {
    sceneryBox(ink, 52.2, 3.4, z, 0.13, 6.4, 0.13);
    sceneryBox(ink, 47, 6.55, z, 10.5, 0.12, 0.12);
    for (const x of railway.lanes) {
      sceneryBox(cream, x, 6.32, z, 0.2, 0.34, 0.2);
    }
  }
  for (const x of railway.lanes)
    sceneryBox(silver, x, 6.1, 0, 0.025, 0.025, railway.maxZ - railway.minZ);
  const board = group(root, "local-line-board", 40.4, 0.3, 15.5);
  box(board, ink, 0, 1, 0, 0.12, 2, 0.12);
  box(board, cream, 0, 2.15, 0, 1.35, 0.65, 0.12);
  sign(board, "LOCAL", 0, 2.15, 0.071, 1.2, 0.5);
  batchRigid(board);

  function wheel(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    radius: number,
  ) {
    const tire = cylinder(parent, rubber, x, y, z, radius, 0.16);
    tire.rotation.z = Math.PI / 2;
    const hub = cylinder(
      parent,
      silver,
      x + (Math.sign(x) || 1) * 0.09,
      y,
      z,
      radius * 0.48,
      0.025,
    );
    hub.rotation.z = Math.PI / 2;
  }

  function train(x: number, reverse: boolean) {
    const node = group(root, "suburban-local", x, 0.3, 0);
    node.rotation.y = reverse ? Math.PI : 0;
    for (const offset of [-7.8, 0, 7.8]) {
      const car = group(node, "local-carriage", 0, 0, offset);
      softBox(car, cream, 0, 1.65, 0, 2.65, 2.04, 7.1);
      softBox(car, silver, 0, 2.76, 0, 2.72, 0.18, 7.2);
      box(car, ink, 0, 0.63, 0, 2.45, 0.14, 6.85);
      for (const side of [-1, 1]) {
        box(car, pink, side * 1.333, 0.97, 0, 0.025, 0.35, 6.85);
        for (const z of [-2.65, -1.85, 0, 1.85, 2.65]) {
          box(car, silver, side * 1.338, 2, z, 0.025, 0.81, 0.68);
          box(car, glass, side * 1.355, 2, z, 0.012, 0.66, 0.54);
          box(car, cream, side * 1.365, 2, z, 0.012, 0.66, 0.025);
        }
        for (const z of [-1, 1]) {
          box(car, silver, side * 1.34, 1.67, z, 0.025, 1.72, 0.61);
          box(car, glass, side * 1.36, 2.12, z, 0.015, 0.53, 0.44);
          box(car, ink, side * 1.37, 1.3, z, 0.012, 0.3, 0.025);
        }
        for (const z of [-2.3, 2.3]) wheel(car, side * 0.88, 0.33, z, 0.28);
      }
      for (const z of [-3.575, 3.575]) {
        box(car, glass, 0, 2.07, z, 1.95, 0.66, 0.025);
        box(car, yellow, 0, 1.23, z, 2.15, 0.45, 0.025);
        for (const dx of [-0.81, 0.81])
          box(car, cream, dx, 1.21, z * 1.004, 0.2, 0.16, 0.018);
      }
    }
    for (const z of [-3.9, 3.9])
      softBox(node, rubber, 0, 1.4, z, 1.6, 1.4, 0.58);
    batchRigid(node);
    return node;
  }
  const trains = railway.lanes.map((x, i) => ({
    node: train(x, i === 1),
    direction: i === 0 ? 1 : -1,
    phase: i === 0 ? 106 : 129,
  }));

  function vehicle(x: number, index: number, reverse: boolean) {
    const node = group(
      root,
      index % 3 === 0
        ? "moving-auto"
        : index % 3 === 1
          ? "kaali-peeli-taxi"
          : "city-car",
      x,
      0.22,
      0,
    );
    node.rotation.y = reverse ? Math.PI : 0;
    const auto = index % 3 === 0;
    const taxi = index % 3 === 1;
    const finish = auto ? teal : taxi ? yellow : pink;
    softBox(node, auto ? teal : ink, 0, 0.61, 0, 1.25, 0.43, 2.65);
    box(node, silver, 0, 0.4, 0, 1.14, 0.12, 2.3);
    if (auto) {
      softBox(node, yellow, 0, 1.64, -0.2, 1.38, 0.14, 2);
      softBox(node, yellow, 0, 0.98, 0.91, 1.2, 0.46, 0.65);
      box(node, ink, 0, 0.94, -0.4, 0.95, 0.22, 0.6);
      for (const side of [-1, 1]) {
        for (const z of [-1.1, 0.65])
          box(node, ink, side * 0.59, 1.23, z, 0.055, 0.7, 0.055);
        wheel(node, side * 0.6, 0.27, -0.8, 0.27);
      }
      box(node, glass, 0, 1.31, 0.69, 1.07, 0.47, 0.035);
      wheel(node, 0, 0.27, 1.05, 0.27);
      box(node, cream, 0, 0.94, 1.25, 0.29, 0.17, 0.035);
    } else {
      softBox(node, finish, 0, 1.05, -0.18, 1.19, 0.65, 1.5);
      box(node, glass, 0, 1.16, 0.585, 1.02, 0.36, 0.025);
      box(node, glass, 0, 1.16, -0.945, 1.02, 0.33, 0.025);
      for (const side of [-1, 1]) {
        for (const z of [-0.56, 0.19])
          box(node, glass, side * 0.608, 1.15, z, 0.022, 0.36, 0.58);
        box(node, silver, side * 0.631, 0.92, -0.4, 0.025, 0.035, 0.17);
        for (const z of [-0.85, 0.85]) wheel(node, side * 0.6, 0.28, z, 0.28);
        box(node, cream, side * 0.4, 0.66, 1.339, 0.23, 0.16, 0.025);
        box(node, pink, side * 0.4, 0.66, -1.339, 0.22, 0.13, 0.025);
      }
      if (taxi) softBox(node, yellow, 0, 1.45, -0.16, 0.45, 0.12, 0.25);
    }
    for (const z of [-1.37, 1.37])
      box(node, silver, 0, 0.49, z, 1.05, 0.09, 0.065);
    box(node, cream, 0, 0.57, -1.412, 0.32, 0.11, 0.015);
    batchRigid(node);
    return node;
  }
  const vehicles = AMBIENT_LAYOUT.road.lanes.flatMap((x, lane) =>
    Array.from({ length: 3 }, (_, i) => ({
      node: vehicle(x, i + lane, lane === 1),
      direction: lane === 0 ? 1 : -1,
      phase: i * 50 + lane * 19,
    })),
  );

  const people = AMBIENT_LAYOUT.pedestrians.map((path, index) => {
    const node = group(root, "station-neighbour", 0, 0.3, path.z);
    const shirt = material(path.color);
    const skin = material(["#b97c56", "#dca77e", "#976142"][index]);
    const hair = material("#40312f");
    const limbs: THREE.Group[] = [];
    for (const x of [-0.14, 0.14]) {
      const leg = group(node, "trouser-leg", x, 0.68, 0);
      softBox(leg, ink, 0, -0.27, 0, 0.19, 0.54, 0.21);
      softBox(leg, cream, 0, -0.62, 0.045, 0.22, 0.12, 0.32);
      batchRigid(leg);
      limbs.push(leg);
    }
    softBox(node, shirt, 0, 1, 0, 0.5, 0.64, 0.31);
    box(node, cream, 0, 1.24, 0.167, 0.17, 0.085, 0.025);
    for (const x of [-0.34, 0.34]) {
      const arm = group(node, "shirt-sleeve", x, 1.26, 0);
      softBox(arm, shirt, 0, -0.13, 0, 0.16, 0.26, 0.2);
      softBox(arm, skin, 0, -0.36, 0, 0.13, 0.2, 0.16);
      batchRigid(arm);
      limbs.push(arm);
    }
    cylinder(node, skin, 0, 1.39, 0, 0.08, 0.14);
    softBox(node, skin, 0, 1.58, 0, 0.36, 0.35, 0.33);
    softBox(node, hair, 0, 1.78, -0.035, 0.38, 0.1, 0.33);
    for (const x of [-0.065, 0.065])
      box(node, ink, x, 1.62, 0.174, 0.025, 0.032, 0.018);
    softBox(node, skin, 0, 1.55, 0.18, 0.055, 0.055, 0.055);
    softBox(node, yellow, 0, 1.02, -0.25, 0.37, 0.45, 0.16);
    for (const x of [-0.18, 0.18])
      box(node, ink, x, 1.06, 0.168, 0.025, 0.39, 0.025);
    // Batch only the rigid body; articulated limb instances remain under their pivots.
    const body = group(node, "neighbour-body");
    for (const child of [...node.children])
      if (child instanceof THREE.Mesh) body.add(child);
    batchRigid(body);
    return { node, limbs, path };
  });

  function updateAmbient(
    elapsed: number,
    _player: WorldPoint,
    reducedMotion: boolean,
  ) {
    const time = reducedMotion ? 0 : elapsed;
    for (const actor of trains) {
      // Wrapping is beyond both ends of the visible neighbourhood, including carriage overhang.
      actor.node.position.z =
        actor.direction * (((time * 4.2 + actor.phase) % 220) - 110);
    }
    for (const actor of vehicles)
      actor.node.position.z =
        actor.direction * (((time * 2.8 + actor.phase) % 156) - 78);
    for (const { node, limbs, path } of people) {
      const phase = (time * Math.PI * 2) / path.period + path.phase;
      node.position.x =
        (path.minX + path.maxX) / 2 +
        (Math.sin(phase) * (path.maxX - path.minX)) / 2;
      // Slow turns at path ends, all inside a conservative 0.6-unit swept radius.
      node.rotation.y =
        Math.PI / 2 + (Math.PI / 2) * (1 - Math.tanh(Math.cos(phase) * 8));
      const swing = reducedMotion
        ? 0
        : Math.sin(time * 7 + path.phase) * 0.3 * Math.abs(Math.cos(phase));
      limbs.forEach((limb, i) => {
        limb.rotation.x = swing * (i === 0 || i === 3 ? 1 : -1);
      });
    }
  }

  updateAmbient(0, { x: 31, z: 12 }, false);
  return { updateAmbient };
}
