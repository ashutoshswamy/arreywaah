import * as THREE from "three";
import { DISCOVERIES, type DiscoveryId } from "./gameplay";
import { STATIONS, type WorldPoint } from "./stations";
import { createAmbient } from "./ambient";
import { AMBIENT_LAYOUT } from "./ambient-layout";

const PALETTE = {
  ink: "#17123f",
  marigold: "#ffb81c",
  pink: "#e8336d",
  teal: "#27c2b0",
  chalk: "#fff4d6",
};

type World = {
  root: THREE.Group;
  traveller: THREE.Group;
  limbs: THREE.Group[];
  doors: THREE.Group[];
  /** Shared-coordinate pickups; the controller owns bobbing, rotation and visibility. */
  discoveries: { id: DiscoveryId; node: THREE.Group }[];
  /** Office entrance beacon; the controller may pulse its scale. */
  destinationMarker: THREE.Group;
  /** Hidden ground feedback ring; the controller owns positioning and scale. */
  destinationRing: THREE.Mesh;
  updateAmbient: (
    elapsed: number,
    player: WorldPoint,
    reducedMotion: boolean,
  ) => void;
  dispose: () => void;
};

/** Call in the browser; all returned groups belong to root, in world units. */
export function createWorld(): World {
  if (typeof document === "undefined") {
    throw new Error(
      "createWorld must be called in the browser (signs use CanvasTexture).",
    );
  }

  const root = new THREE.Group();
  root.name = "arrey-waah-neighbourhood";
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const instances = new Set<THREE.InstancedMesh>();
  const materialCache = new Map<string, THREE.MeshStandardMaterial>();
  const bevelCache = new Map<string, THREE.BufferGeometry>();

  function geometry<T extends THREE.BufferGeometry>(value: T): T {
    geometries.add(value);
    return value;
  }

  function material(
    color: string,
    roughness = 0.85,
  ): THREE.MeshStandardMaterial {
    const key = `${color}:${roughness}`;
    const existing = materialCache.get(key);
    if (existing) return existing;
    const value = new THREE.MeshStandardMaterial({
      color,
      roughness,
      flatShading: false,
    });
    materials.add(value);
    materialCache.set(key, value);
    return value;
  }

  const ink = material(PALETTE.ink);
  const yellow = material(PALETTE.marigold);
  const pink = material(PALETTE.pink);
  const teal = material(PALETTE.teal);
  const chalk = material(PALETTE.chalk);
  const paving = material("#d9d3c5", 0.96);
  const road = material("#393b40", 0.92);
  const earth = material("#78674d", 0.98);
  const leaf = material("#329d82");
  const darkLeaf = material("#237968");
  const glass = material("#539ca1", 0.3);
  const skin = material("#c98d66");
  const unitBox = geometry(new THREE.BoxGeometry(1, 1, 1));
  const unitCylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 10));
  const unitBall = geometry(new THREE.IcosahedronGeometry(1, 0));
  const unitPlane = geometry(new THREE.PlaneGeometry(1, 1));

  function group(parent: THREE.Group, name: string, x = 0, y = 0, z = 0) {
    const value = new THREE.Group();
    value.name = name;
    value.position.set(x, y, z);
    parent.add(value);
    return value;
  }

  function mesh(
    parent: THREE.Group,
    shape: THREE.BufferGeometry,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
  ) {
    const value = new THREE.Mesh(shape, finish);
    value.position.set(x, y, z);
    value.scale.set(sx, sy, sz);
    value.castShadow = true;
    value.receiveShadow = true;
    parent.add(value);
    return value;
  }

  function box(
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ) {
    return mesh(parent, unitBox, finish, x, y, z, width, height, depth);
  }

  // Dimension-keyed bevels retain exact outer bounds; thin trim and paving stay square.
  function softBox(
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ) {
    const key = `${width}:${height}:${depth}`;
    let shape = bevelCache.get(key);
    if (!shape) {
      const radius = Math.min(0.055, width / 5, height / 5, depth / 5);
      const profile = new THREE.Shape();
      profile.moveTo(-width / 2 + radius, -height / 2 + radius);
      profile.lineTo(width / 2 - radius, -height / 2 + radius);
      profile.lineTo(width / 2 - radius, height / 2 - radius);
      profile.lineTo(-width / 2 + radius, height / 2 - radius);
      profile.closePath();
      shape = geometry(
        new THREE.ExtrudeGeometry(profile, {
          depth: depth - radius * 2,
          bevelEnabled: true,
          bevelSize: radius,
          bevelThickness: radius,
          bevelSegments: 1,
          steps: 1,
          curveSegments: 1,
        }),
      );
      shape.translate(0, 0, -depth / 2 + radius);
      bevelCache.set(key, shape);
    }
    return mesh(parent, shape, finish, x, y, z);
  }

  function cylinder(
    parent: THREE.Group,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
  ) {
    return mesh(parent, unitCylinder, finish, x, y, z, radius, height, radius);
  }

  function sign(
    parent: THREE.Group,
    text: string,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    background = PALETTE.ink,
    foreground = PALETTE.chalk,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.max(128, Math.round((1024 * height) / width));
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Unable to create the neighbourhood sign canvas.");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = foreground;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const displayFont =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-yatra")
        .trim() || "Arial, sans-serif";
    let fontSize = Math.floor(canvas.height * 0.61);
    context.font = `400 ${fontSize}px ${displayFont}`;
    const measured = context.measureText(text).width;
    if (measured > canvas.width * 0.88) {
      fontSize = Math.floor((fontSize * canvas.width * 0.88) / measured);
      context.font = `400 ${fontSize}px ${displayFont}`;
    }
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.add(texture);
    const finish = new THREE.MeshBasicMaterial({ map: texture });
    materials.add(finish);
    const panel = mesh(parent, unitPlane, finish, x, y, z, width, height, 1);
    panel.castShadow = false;
    panel.receiveShadow = false;
    return panel;
  }

  // Batch repeated scenery by geometry/material, not by building or window.
  const sceneryBatches = new Map<
    THREE.BufferGeometry,
    Map<THREE.Material, THREE.Matrix4[]>
  >();
  const sceneryTransform = new THREE.Object3D();
  function scenery(
    shape: THREE.BufferGeometry,
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ) {
    let finishes = sceneryBatches.get(shape);
    if (!finishes) {
      finishes = new Map();
      sceneryBatches.set(shape, finishes);
    }
    let transforms = finishes.get(finish);
    if (!transforms) {
      transforms = [];
      finishes.set(finish, transforms);
    }
    sceneryTransform.position.set(x, y, z);
    sceneryTransform.scale.set(sx, sy, sz);
    sceneryTransform.updateMatrix();
    transforms.push(sceneryTransform.matrix.clone());
  }
  function sceneryBox(
    finish: THREE.Material,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ) {
    scenery(unitBox, finish, x, y, z, width, height, depth);
  }

  function batchRigid(node: THREE.Group) {
    node.updateWorldMatrix(true, true);
    const inverse = node.matrixWorld.clone().invert();
    const batches = new Map<
      THREE.BufferGeometry,
      Map<THREE.Material, THREE.Matrix4[]>
    >();
    const originals: THREE.Mesh[] = [];
    node.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || Array.isArray(child.material))
        return;
      let finishes = batches.get(child.geometry);
      if (!finishes) {
        finishes = new Map();
        batches.set(child.geometry, finishes);
      }
      let transforms = finishes.get(child.material);
      if (!transforms) {
        transforms = [];
        finishes.set(child.material, transforms);
      }
      transforms.push(
        new THREE.Matrix4().multiplyMatrices(inverse, child.matrixWorld),
      );
      originals.push(child);
    });
    originals.forEach((child) => child.removeFromParent());
    for (const [shape, finishes] of batches) {
      for (const [finish, transforms] of finishes) {
        const batch = new THREE.InstancedMesh(shape, finish, transforms.length);
        batch.name = `${node.name}-details`;
        transforms.forEach((transform, index) =>
          batch.setMatrixAt(index, transform),
        );
        batch.instanceMatrix.needsUpdate = true;
        batch.castShadow = true;
        batch.receiveShadow = true;
        batch.computeBoundingSphere();
        instances.add(batch);
        node.add(batch);
      }
    }
  }

  // Continuous ground has no nearby raised-base edge; foot level stays at y=0.3.
  box(root, paving, 0, -0.34, 0, 340, 1, 340);
  const roadAlongX = (start: number, end: number, z: number, width: number) => {
    if (end <= start) return;
    box(root, road, (start + end) / 2, 0.19, z, end - start, 0.06, width);
    for (let x = start + 1.7; x < end - 0.8; x += 4)
      sceneryBox(chalk, x, 0.228, z, 1.7, 0.015, 0.12);
  };
  const roadAlongZ = (x: number, start: number, end: number, width: number) => {
    if (end <= start) return;
    box(root, road, x, 0.19, (start + end) / 2, width, 0.06, end - start);
    for (let z = start + 1.7; z < end - 0.8; z += 4)
      sceneryBox(chalk, x, 0.228, z, 0.12, 0.015, 1.7);
  };
  const sidewalkAlongX = (
    start: number,
    end: number,
    z: number,
    width: number,
  ) => {
    if (end <= start) return;
    box(root, chalk, (start + end) / 2, 0.23, z, end - start, 0.14, width);
  };

  // Give the station pads and street junctions their own footprints instead of stacking slabs.
  sidewalkAlongX(-165, -39, 5, 4);
  sidewalkAlongX(-35, 35, 5, 4);

  roadAlongX(-165, -39, 10.5, 5);
  roadAlongX(-39, -35, 10.5, 5);
  roadAlongX(-35, 26.5, 10.5, 5);

  sidewalkAlongX(-165, -39, 14.5, 3);
  sidewalkAlongX(-35, -12.2, 14.5, 3);
  sidewalkAlongX(-7.8, 13.8, 14.5, 3);
  sidewalkAlongX(22.2, 26.5, 14.5, 3);

  box(root, chalk, 24, 0.23, -0.5, 6, 0.14, 7);
  box(root, paving, -10, 0.23, 14.8, 4.4, 0.14, 3);

  // No east-west slab continues through the reserved railway at x=41..50.
  roadAlongX(-77, 39, -17, 4);
  for (const z of [22, 52]) roadAlongX(-77, 39, z, 4);
  for (const x of [-37, 37]) {
    const verticalSegments: readonly (readonly [number, number])[] =
      x === 37
        ? [
            [AMBIENT_LAYOUT.road.minZ, -19],
            [-15, 20],
            [24, 50],
            [54, AMBIENT_LAYOUT.road.maxZ],
          ]
        : [
            [-51, -19],
            [-15, 8],
            [13, 20],
            [24, 50],
            [54, 57],
          ];
    for (const [start, end] of verticalSegments) roadAlongZ(x, start, end, 4);
  }
  box(root, paving, -102, 0.23, 7.5, 126, 0.14, 1);
  box(root, paving, -28.65, 0.23, 7.5, 12.7, 0.14, 1);
  box(root, paving, -9.15, 0.23, 7.5, 25.1, 0.14, 1);
  box(root, paving, 10, 0.23, 7.5, 11.4, 0.14, 1);
  box(root, paving, 25.65, 0.23, 7.5, 18.7, 0.14, 1);

  for (let x = -32; x <= 32; x += 2) {
    box(root, paving, x, 0.303, 5, 0.025, 0.006, 3.7);
  }
  for (let z = 8.3; z < 12.9; z += 0.72) {
    box(root, chalk, 24, 0.231, z, 3.2, 0.02, 0.36);
  }
  for (let x = -22; x <= 22; x += 4) {
    box(root, yellow, x, 0.312, 5, 0.3, 0.012, 0.12);
  }
  for (let z = -3; z <= 2; z += 2) {
    box(root, yellow, 24, 0.312, z, 0.12, 0.012, 0.3);
  }

  function planter(parent: THREE.Group, x: number, z: number, width = 1.8) {
    box(parent, chalk, x, 0.55, z, width, 0.5, 0.85);
    box(parent, earth, x, 0.808, z, width - 0.16, 0.025, 0.67);
    for (let i = 0; i < 3; i++) {
      mesh(
        parent,
        unitBall,
        i % 2 ? darkLeaf : leaf,
        x + ((i - 1) * width) / 3.5,
        1,
        z,
        width / 3.4,
        0.38,
        0.38,
      );
    }
  }

  function tree(x: number, z: number, height = 3.8) {
    const value = group(root, "faceted-tree", x, 0.3, z);
    box(value, teal, 0, 0.18, 0, 1.3, 0.36, 1.3);
    box(value, earth, 0, 0.37, 0, 1.12, 0.02, 1.12);
    cylinder(value, earth, 0, height * 0.36, 0, 0.13, height * 0.65);
    mesh(value, unitBall, darkLeaf, -0.25, height * 0.7, 0, 0.95, 1.1, 0.95);
    mesh(
      value,
      unitBall,
      leaf,
      0.26,
      height * 0.85,
      0.04,
      0.92,
      height * 0.32,
      0.92,
    );
  }

  function bench(x: number, z: number) {
    const value = group(root, "promenade-bench", x, 0.3, z);
    for (const dx of [-0.8, 0.8]) box(value, ink, dx, 0.25, 0, 0.12, 0.5, 0.62);
    for (const dz of [-0.2, 0, 0.2])
      box(value, yellow, 0, 0.53, dz, 2.1, 0.12, 0.16);
    box(value, ink, -0.8, 0.87, -0.28, 0.1, 0.72, 0.1);
    box(value, ink, 0.8, 0.87, -0.28, 0.1, 0.72, 0.1);
    box(value, yellow, 0, 1, -0.28, 2.1, 0.28, 0.12);
  }

  for (const station of STATIONS) {
    const platform = group(
      root,
      `station-${station.id}`,
      station.x,
      0.3,
      station.z,
    );
    const accent = station.id === "parel" ? yellow : pink;
    box(platform, chalk, 0, -0.07, 0, 7.4, 0.14, 4.8);
    softBox(platform, ink, 0, 3.55, -0.1, 7.6, 0.24, 5);
    softBox(platform, accent, 0, 3.82, -0.1, 7.3, 0.3, 4.8);
    for (const x of [-3.2, -1.05, 1.05, 3.2]) {
      box(platform, chalk, x, 1.715, 1.75, 0.2, 3.43, 0.2);
    }
    box(platform, ink, 0, 3.05, 2.22, 5.4, 0.9, 0.16);
    sign(platform, station.name.toUpperCase(), 0, 3.05, 2.311, 5.2, 0.66);
    box(platform, yellow, -2.9, 0.02, 0.2, 0.18, 0.025, 4.2);
    bench(station.x + 2.1, station.z - 0.9);
  }

  function shop(
    x: number,
    name: string,
    accent: THREE.Material,
    height: number,
    style: number,
  ) {
    const value = group(
      root,
      name.toLowerCase().replaceAll(" ", "-"),
      x,
      0.3,
      0,
    );
    softBox(value, chalk, 0, height / 2, 0, 5.8, height, 4);
    box(value, accent, 0, height / 2, 2.03, 5.8, height, 0.15);
    box(value, ink, 0, 1.25, 2.13, 4.95, 2.5, 0.06);
    box(value, glass, -1.38, 1.4, 2.175, 1.95, 1.7, 0.04);
    box(value, glass, 1.38, 1.4, 2.175, 1.95, 1.7, 0.04);
    box(value, chalk, 0, 1.4, 2.21, 0.08, 2.2, 0.1);
    box(value, chalk, 0.34, 1.1, 2.25, 0.05, 0.32, 0.07);
    sign(value, name, 0, 2.96, 2.17, 5.25, 0.67);
    if (style === 0) {
      const awning = box(value, yellow, 0, 2.56, 2.63, 6.05, 0.13, 1.2);
      awning.rotation.x = 0.12;
      for (let i = -2; i <= 2; i++) {
        const stripe = box(value, chalk, i * 1.1, 2.63, 2.63, 0.45, 0.025, 1.2);
        stripe.rotation.x = 0.12;
      }
      box(value, yellow, 0, 2.4, 3.18, 6.05, 0.25, 0.12);
      box(value, ink, 0, height + 0.08, 0, 6.1, 0.16, 4.2);
    } else if (style === 1) {
      const profile = new THREE.Shape();
      profile.moveTo(-3.1, 0);
      profile.lineTo(3.1, 0);
      profile.lineTo(0, 1.4);
      profile.closePath();
      const roofShape = geometry(
        new THREE.ExtrudeGeometry(profile, {
          depth: 4.3,
          bevelEnabled: false,
          steps: 1,
        }),
      );
      roofShape.translate(0, 0, -2.15);
      mesh(value, roofShape, accent, 0, height, 0);
      // A smaller roof monitor gives the cinema its own silhouette.
      box(value, ink, 0, height + 1.45, -0.4, 2.2, 0.45, 1.8);
    } else {
      box(value, ink, 0, height + 0.1, 0, 6.2, 0.2, 4.3);
      box(value, accent, -1.2, height + 0.48, -0.5, 2.6, 0.65, 2.2);
      for (const dx of [-1.85, -0.7]) {
        box(value, glass, dx, height + 0.48, 0.615, 0.8, 0.32, 0.025);
      }
      box(value, chalk, 2, height + 0.35, -0.7, 0.65, 0.5, 0.8);
    }
    box(value, chalk, 0, 0.07, 2.45, 5.9, 0.14, 0.6);
  }

  shop(-12, "MUSIC", teal, 3.8, 0);
  shop(-4.5, "FILMS", pink, 4.2, 1);
  shop(3, "BRAND STUDIO", yellow, 4.8, 2);
  shop(10.5, "WAAH ART", teal, 3.8, 0);
  bench(-16.7, 2.2);
  bench(16.4, 2.2);
  planter(root, -8.3, 2.3, 1.2);
  planter(root, 6.8, 2.3, 1.2);
  tree(-18, -1.2, 4.1);
  tree(17.8, -0.6, 3.7);
  tree(-32, 1.5, 4);
  tree(32, 1, 4.2);

  tree(15.7, -12, 4.5);
  tree(31.8, -13.4, 4.8);

  function neighbourhoodBlock(x: number, z: number, index: number) {
    const accent = [teal, pink, yellow][index % 3];
    const south = z >= 25;
    const facing = south ? -1 : 1;
    // Low south-facing foreground roofs preserve the view back to the journey.
    const height = south && z < 35 ? 2.6 : 4.8 + (index % 4) * 1.1;
    const width = 7.8 + (index % 3) * 0.6;
    const front = z + facing * 3.56;
    const roof = 0.16 + height;
    sceneryBox(chalk, x, 0.16 + height / 2, z, width, height, 7);
    sceneryBox(accent, x, 0.16 + height / 2, front, width, height, 0.13);
    sceneryBox(ink, x, roof + 0.1, z, width + 0.4, 0.2, 7.4);
    sceneryBox(chalk, x, 0.23, front + facing * 0.5, width + 0.3, 0.14, 1.1);

    // Ground-floor shop windows, recessed door and an unlettered physical fascia.
    sceneryBox(ink, x, 1.25, front + facing * 0.09, width - 0.7, 2.05, 0.08);
    for (const dx of [-width * 0.28, width * 0.28]) {
      sceneryBox(
        glass,
        x + dx,
        1.3,
        front + facing * 0.15,
        width * 0.29,
        1.65,
        0.045,
      );
      sceneryBox(chalk, x + dx, 1.3, front + facing * 0.2, 0.065, 1.7, 0.06);
    }
    sceneryBox(earth, x, 1.15, front + facing * 0.14, 0.95, 1.9, 0.06);
    sceneryBox(yellow, x + 0.3, 1.15, front + facing * 0.19, 0.065, 0.25, 0.07);
    sceneryBox(ink, x, 2.42, front + facing * 0.15, width - 0.5, 0.34, 0.12);
    sceneryBox(accent, x, 2.32, front + facing * 0.7, width + 0.2, 0.12, 1.3);
    for (let floor = 3.55; floor < height - 0.45; floor += 2) {
      for (const dx of [-width * 0.28, 0, width * 0.28]) {
        sceneryBox(ink, x + dx, floor, front + facing * 0.1, 1.55, 1.4, 0.08);
        sceneryBox(
          glass,
          x + dx,
          floor,
          front + facing * 0.16,
          1.32,
          1.17,
          0.04,
        );
        sceneryBox(chalk, x + dx, floor, front + facing * 0.2, 0.07, 1.2, 0.05);
      }
      const balcony = front + facing * 0.8;
      sceneryBox(chalk, x, floor - 0.8, balcony, width - 0.6, 0.16, 1.6);
      sceneryBox(
        ink,
        x,
        floor - 0.22,
        balcony + facing * 0.72,
        width - 0.6,
        0.07,
        0.07,
      );
      for (let dx = -width / 2 + 0.4; dx < width / 2; dx += 0.65)
        sceneryBox(
          ink,
          x + dx,
          floor - 0.5,
          balcony + facing * 0.72,
          0.055,
          0.6,
          0.055,
        );
    }
    sceneryBox(accent, x - 1.7, roof + 0.45, z - 0.8, 2.1, 0.7, 2.2);
    sceneryBox(chalk, x + 2, roof + 0.32, z - 0.6, 1.7, 0.44, 1.7);
    scenery(unitCylinder, ink, x + 2, roof + 1, z - 0.6, 0.7, 0.95, 0.7);
    scenery(unitCylinder, chalk, x + 2, roof + 1.5, z - 0.6, 0.73, 0.09, 0.73);
    for (const dx of [-width / 2, width / 2])
      sceneryBox(chalk, x + dx, roof + 0.28, z, 0.12, 0.4, 7.2);
  }

  const nearWalkCorridor = (x: number, z: number) =>
    STATIONS.some((station) =>
      station.route.slice(1).some((point, index) => {
        const start = station.route[index]!;
        const dx = point.x - start.x;
        const dz = point.z - start.z;
        const lengthSq = dx * dx + dz * dz;
        const amount =
          lengthSq === 0
            ? 0
            : THREE.MathUtils.clamp(
                ((x - start.x) * dx + (z - start.z) * dz) / lengthSq,
                0,
                1,
              );
        return (
          Math.hypot(x - (start.x + amount * dx), z - (start.z + amount * dz)) <
          9
        );
      }),
    );

  let blockIndex = 0;
  for (const z of [-26, -40, 31, 44]) {
    for (let x = -64; x <= 68; x += 12) {
      // Leave the cross streets legible between the blocks.
      if (Math.abs(Math.abs(x) - 37) < 6 || (x > 39 && x < 58)) continue;
      if (nearWalkCorridor(x, z)) continue;
      neighbourhoodBlock(x, z, blockIndex++);
    }
  }
  for (const x of [-64, -50, 60, 74]) {
    for (const z of [-7]) {
      if (nearWalkCorridor(x, z)) continue;
      neighbourhoodBlock(x, z, blockIndex++);
    }
  }

  const cart = group(root, "chai-cart", -19, 0.3, 1.8);
  box(cart, teal, 0, 0.7, 0, 1.8, 1, 1.1);
  box(cart, chalk, 0, 1.27, 0, 2, 0.14, 1.25);
  for (const x of [-0.8, 0.8]) box(cart, ink, x, 1.77, -0.4, 0.07, 1.1, 0.07);
  box(cart, yellow, 0, 2.37, 0, 2.35, 0.16, 1.6);
  sign(cart, "CHAI", 0, 0.81, 0.561, 1.55, 0.44, PALETTE.teal, PALETTE.ink);
  for (const x of [-0.65, 0.65]) {
    const wheel = cylinder(cart, ink, x, 0.28, 0, 0.28, 0.15);
    wheel.rotation.x = Math.PI / 2;
  }
  cylinder(cart, ink, -0.35, 1.54, -0.15, 0.2, 0.4);
  cylinder(cart, chalk, -0.35, 1.77, -0.15, 0.22, 0.06);
  for (const x of [0.15, 0.4, 0.65])
    cylinder(cart, chalk, x, 1.42, 0.15, 0.08, 0.16);

  const rickshaw = group(root, "parked-rickshaw", -10, 0.3, 14.8);
  softBox(rickshaw, teal, 0, 0.68, 0, 2.5, 0.55, 1.55);
  box(rickshaw, yellow, 0.9, 1, 0, 0.75, 0.45, 1.35);
  box(rickshaw, ink, -0.3, 1.15, 0, 1.25, 0.3, 1.2);
  softBox(rickshaw, yellow, -0.4, 2, 0, 2.05, 0.18, 1.75);
  for (const z of [-0.68, 0.68]) {
    box(rickshaw, ink, -1.25, 1.55, z, 0.08, 0.9, 0.08);
    box(rickshaw, ink, 0.5, 1.55, z, 0.08, 0.9, 0.08);
  }
  box(rickshaw, glass, 0.55, 1.6, 0, 0.06, 0.64, 1.2);
  for (const [x, z] of [
    [-0.8, -0.75],
    [-0.8, 0.75],
    [1.05, 0],
  ]) {
    const wheel = cylinder(rickshaw, ink, x, 0.35, z, 0.35, 0.2);
    wheel.rotation.x = Math.PI / 2;
    const hub = cylinder(rickshaw, chalk, x, 0.35, z + 0.11, 0.12, 0.025);
    hub.rotation.x = Math.PI / 2;
  }

  // Open-front office shell: the doorway is a real gap, not a door over a solid wall.
  const office = group(root, "arrey-waah-office", 24, 0.3, -8);
  box(office, chalk, 0, -0.07, 0, 11, 0.14, 8);
  box(office, chalk, 0, 3.2, -3.85, 11, 6.4, 0.3);
  for (const x of [-5.35, 5.35]) box(office, chalk, x, 3.2, 0, 0.3, 6.4, 8);
  box(office, ink, 0, 6.48, 0, 11.5, 0.2, 8.4);
  box(office, yellow, -1.4, 6.88, -0.9, 8.2, 0.65, 5.8);
  box(office, teal, 3.7, 3.2, 3.86, 3.3, 6.4, 0.28);
  box(office, chalk, -3.6, 3.2, 3.86, 3.8, 6.4, 0.28);
  box(office, chalk, 0, 4.7, 3.86, 3.8, 3.4, 0.28);
  box(office, ink, 0, 0.025, 0, 10.4, 0.05, 7.4);
  box(office, pink, -2.8, 0.5, 1, 2.2, 1, 0.75);
  box(office, yellow, 0.6, 1, -1.6, 3.4, 0.16, 1);
  for (const x of [-3.65, 3.65]) {
    box(office, ink, x, 2, 4.015, 2.1, 2.2, 0.035);
    box(office, glass, x, 2, 4.04, 1.85, 1.95, 0.025);
    box(office, chalk, x, 2, 4.07, 0.07, 2.1, 0.06);
  }
  for (const x of [-3.6, 0, 3.6]) {
    box(office, ink, x, 5.25, 4.02, 2.35, 1.3, 0.035);
    box(office, glass, x, 5.25, 4.045, 2.12, 1.07, 0.025);
  }
  box(office, pink, 0, 3.52, 4.2, 6.4, 0.9, 0.3);
  sign(office, "ARREY WAAH", 0, 3.52, 4.361, 6.15, 0.72, PALETTE.pink);
  box(office, yellow, 0, 3.03, 4.5, 3.6, 0.15, 1.1);
  for (const x of [-1.42, 1.42]) box(office, ink, x, 1.45, 4, 0.14, 2.9, 0.18);
  box(office, ink, 0, 2.86, 4, 2.95, 0.12, 0.18);

  const doors = [-0.65, 0.65].map((x, index) => {
    const door = group(
      office,
      index === 0 ? "left-office-door" : "right-office-door",
      x,
      0,
      4.27,
    );
    door.userData.closedX = x;
    box(door, glass, 0, 1.38, 0, 1.26, 2.7, 0.075);
    for (const dx of [-0.61, 0.61])
      box(door, ink, dx, 1.38, 0.05, 0.045, 2.7, 0.08);
    for (const y of [0.045, 2.715])
      box(door, ink, 0, y, 0.05, 1.26, 0.045, 0.08);
    box(door, yellow, index === 0 ? 0.4 : -0.4, 1.3, 0.11, 0.05, 0.4, 0.06);
    return door;
  });
  planter(root, 20, -2.7, 2.4);
  planter(root, 28, -2.7, 2.4);

  // Keep south-side details low and away from the camera-to-traveller sightline.
  for (const x of [-22, 4, 16]) {
    const lamp = group(root, "street-lamp", x, 0.3, 7.35);
    cylinder(lamp, ink, 0, 1.35, 0, 0.055, 2.7);
    box(lamp, ink, 0, 2.73, -0.25, 0.08, 0.08, 0.55);
    box(lamp, yellow, 0, 2.66, -0.48, 0.32, 0.12, 0.22);
  }
  for (const x of [-26, -20, -2, 8, 28]) {
    sceneryBox(chalk, x, 0.29, 17.6, 0.3, 0.26, 0.3);
    sceneryBox(pink, x, 0.43, 17.6, 0.31, 0.04, 0.31);
  }

  // Each NPC owns a short, furniture-free promenade outside the traveller domain.
  for (const path of AMBIENT_LAYOUT.pedestrians) {
    const width = path.maxX - path.minX + 1.4;
    box(
      root,
      chalk,
      (path.minX + path.maxX) / 2,
      0.23,
      path.z,
      width,
      0.14,
      1.4,
    );
    for (const x of [path.minX - 0.63, path.maxX + 0.63])
      sceneryBox(teal, x, 0.32, path.z, 0.1, 0.04, 1.3);
  }
  const ambient = createAmbient({
    root,
    group,
    box,
    softBox,
    cylinder,
    material,
    sign,
    sceneryBox,
    batchRigid,
  });

  for (const [shape, finishes] of sceneryBatches) {
    for (const [finish, transforms] of finishes) {
      const batch = new THREE.InstancedMesh(shape, finish, transforms.length);
      batch.name = "neighbourhood-scenery";
      transforms.forEach((transform, index) =>
        batch.setMatrixAt(index, transform),
      );
      batch.instanceMatrix.needsUpdate = true;
      batch.castShadow = true;
      batch.receiveShadow = true;
      batch.computeBoundingSphere();
      instances.add(batch);
      root.add(batch);
    }
  }
  sceneryBatches.clear();

  const cupHandle = geometry(new THREE.TorusGeometry(0.17, 0.055, 5, 12));
  const cupRim = geometry(new THREE.TorusGeometry(0.23, 0.035, 5, 12));
  const recordGroove = geometry(new THREE.TorusGeometry(0.31, 0.012, 4, 20));
  const discoveries = DISCOVERIES.map(({ id, x, z }) => {
    const node = group(root, `discovery-${id}`, x, 1.4, z);
    if (id === "chai") {
      cylinder(node, chalk, 0, 0, 0, 0.23, 0.42);
      cylinder(node, earth, 0, 0.216, 0, 0.2, 0.015);
      const rim = mesh(node, cupRim, yellow, 0, 0.22, 0);
      rim.rotation.x = Math.PI / 2;
      mesh(node, cupHandle, chalk, 0.29, 0.02, 0);
      cylinder(node, teal, 0, -0.24, 0, 0.34, 0.045);
    } else if (id === "music") {
      const record = cylinder(node, ink, 0, 0, 0, 0.42, 0.075);
      record.rotation.x = Math.PI / 2;
      for (const side of [-1, 1]) {
        mesh(node, recordGroove, earth, 0, 0, side * 0.04);
        const label = cylinder(node, pink, 0, 0, side * 0.045, 0.14, 0.015);
        label.rotation.x = Math.PI / 2;
        const spindle = cylinder(node, chalk, 0, 0, side * 0.056, 0.035, 0.012);
        spindle.rotation.x = Math.PI / 2;
      }
    } else if (id === "film") {
      box(node, ink, 0, -0.08, 0, 0.85, 0.5, 0.13);
      const clapper = group(node, "open-clapper", -0.42, 0.22);
      clapper.rotation.z = 0.18;
      box(clapper, chalk, 0.42, 0, 0, 0.9, 0.17, 0.15);
      for (const dx of [0.1, 0.35, 0.6, 0.85]) {
        const stripe = box(clapper, ink, dx, 0, 0.081, 0.1, 0.17, 0.015);
        stripe.rotation.z = -0.35;
      }
      for (const y of [-0.02, -0.16])
        box(node, chalk, 0, y, 0.075, 0.58, 0.025, 0.025);
      box(node, pink, 0.22, -0.26, 0.075, 0.12, 0.06, 0.025);
    } else if (id === "brand") {
      mesh(node, unitBall, yellow, 0, 0.12, 0, 0.3, 0.36, 0.3);
      cylinder(node, chalk, 0, -0.2, 0, 0.15, 0.16);
      cylinder(node, ink, 0, -0.33, 0, 0.14, 0.14);
      for (const y of [-0.29, -0.35])
        cylinder(node, teal, 0, y, 0, 0.155, 0.035);
      box(node, chalk, 0, 0.1, 0.28, 0.045, 0.22, 0.025);
    } else {
      const outline = new THREE.Shape();
      outline.moveTo(-0.4, -0.18);
      outline.quadraticCurveTo(-0.58, 0.3, -0.16, 0.4);
      outline.quadraticCurveTo(0.3, 0.53, 0.45, 0.12);
      outline.quadraticCurveTo(0.56, -0.25, 0.18, -0.35);
      outline.quadraticCurveTo(-0.2, -0.46, -0.4, -0.18);
      const thumbHole = new THREE.Path();
      thumbHole.absellipse(-0.22, -0.12, 0.075, 0.09, 0, Math.PI * 2, true, 0);
      outline.holes.push(thumbHole);
      const paletteShape = geometry(
        new THREE.ExtrudeGeometry(outline, {
          depth: 0.09,
          bevelEnabled: false,
          steps: 1,
          curveSegments: 5,
        }),
      );
      paletteShape.translate(0, 0, -0.045);
      mesh(node, paletteShape, chalk, 0, 0, 0);
      for (const [dx, dy, finish] of [
        [-0.27, 0.2, pink],
        [0, 0.29, teal],
        [0.26, 0.15, yellow],
        [0.27, -0.12, ink],
      ] as const) {
        for (const side of [-1, 1])
          mesh(
            node,
            unitBall,
            finish,
            dx,
            dy,
            side * 0.055,
            0.075,
            0.075,
            0.028,
          );
      }
    }
    return { id, node };
  });

  const destinationMarker = group(root, "office-destination", 24, 0.3, -3.4);
  const arrow = new THREE.Shape();
  arrow.moveTo(-0.11, 0.65);
  arrow.lineTo(0.11, 0.65);
  arrow.lineTo(0.11, 0.28);
  arrow.lineTo(0.3, 0.28);
  arrow.lineTo(0, 0);
  arrow.lineTo(-0.3, 0.28);
  arrow.lineTo(-0.11, 0.28);
  arrow.closePath();
  const arrowShape = geometry(
    new THREE.ExtrudeGeometry(arrow, {
      depth: 0.12,
      bevelEnabled: false,
      steps: 1,
    }),
  );
  arrowShape.translate(0, 0, -0.06);
  mesh(destinationMarker, arrowShape, yellow, 0, 1.65, 0);
  const beacon = mesh(
    destinationMarker,
    cupRim,
    teal,
    0,
    0.025,
    0,
    2.1,
    2.1,
    2.1,
  );
  beacon.rotation.x = Math.PI / 2;

  const destinationRing = mesh(
    root,
    geometry(new THREE.RingGeometry(0.42, 0.56, 32)),
    yellow,
    0,
    0.318,
    0,
  );
  destinationRing.name = "walk-destination-ring";
  destinationRing.rotation.x = -Math.PI / 2;
  destinationRing.castShadow = false;
  destinationRing.visible = false;

  const traveller = group(root, "traveller", -24, 0.3, 5);
  // +z is forward; feet touch local y=0. Pivots swing around local x.
  const leftLeg = group(traveller, "left-leg", -0.15, 0.72, 0);
  const rightLeg = group(traveller, "right-leg", 0.15, 0.72, 0);
  for (const leg of [leftLeg, rightLeg]) {
    box(leg, ink, 0, -0.31, 0, 0.21, 0.62, 0.23);
    box(leg, chalk, 0, -0.66, 0.06, 0.25, 0.12, 0.38);
  }
  softBox(traveller, pink, 0, 1.03, 0, 0.57, 0.66, 0.34);
  box(traveller, yellow, 0, 1.07, 0.179, 0.045, 0.51, 0.02);
  softBox(traveller, teal, 0, 1.07, -0.27, 0.47, 0.55, 0.24);
  box(traveller, darkLeaf, 0, 0.98, -0.4, 0.31, 0.22, 0.07);
  for (const x of [-0.2, 0.2])
    box(traveller, teal, x, 1.13, 0.183, 0.055, 0.45, 0.035);
  const leftArm = group(traveller, "left-arm", -0.37, 1.28, 0);
  const rightArm = group(traveller, "right-arm", 0.37, 1.28, 0);
  for (const arm of [leftArm, rightArm]) {
    box(arm, pink, 0, -0.23, 0, 0.18, 0.46, 0.23);
    mesh(arm, unitBall, skin, 0, -0.51, 0.01, 0.115, 0.12, 0.12);
  }
  cylinder(traveller, skin, 0, 1.4, 0, 0.105, 0.16);
  mesh(traveller, unitBall, skin, 0, 1.57, 0, 0.25, 0.26, 0.24);
  mesh(traveller, unitBall, ink, 0, 1.62, -0.07, 0.255, 0.2, 0.19);
  for (const x of [-0.082, 0.082])
    box(traveller, ink, x, 1.59, 0.216, 0.035, 0.045, 0.025);
  mesh(traveller, unitBall, skin, 0, 1.53, 0.235, 0.055, 0.06, 0.06);
  cylinder(traveller, yellow, 0, 1.77, 0, 0.265, 0.11);
  box(traveller, yellow, 0, 1.736, 0.22, 0.4, 0.045, 0.31);

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    root.removeFromParent();
    root.clear();
    for (const value of instances) value.dispose();
    instances.clear();
    for (const value of geometries) value.dispose();
    for (const value of materials) value.dispose();
    for (const value of textures) value.dispose();
    geometries.clear();
    materials.clear();
    textures.clear();
    materialCache.clear();
    bevelCache.clear();
  }

  return {
    root,
    traveller,
    limbs: [leftLeg, rightLeg, leftArm, rightArm],
    doors,
    discoveries,
    destinationMarker,
    destinationRing,
    updateAmbient: ambient.updateAmbient,
    dispose,
  };
}
