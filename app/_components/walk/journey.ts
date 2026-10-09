import * as THREE from "three";
import { createWorld } from "./world";
import {
  outsideAmbientDomains,
  PEDESTRIAN_RESERVATIONS,
} from "./ambient-layout";
import {
  DISCOVERIES,
  type DiscoveryId,
  type GameSnapshot,
  type JourneyController,
  type JourneyOptions,
  type NearbyId,
} from "./gameplay";
import { OFFICE_POINT, STATIONS, getStation, type StationId } from "./stations";

const clamp = THREE.MathUtils.clamp;
const OFFICE = new THREE.Vector3(OFFICE_POINT.x, 0.3, OFFICE_POINT.z);
const WALK_SPEED = 4.5;
const GRID_STEP = 0.5;
const GRID_MIN_X = -35;
const GRID_MIN_Z = -50;
const GRID_WIDTH = 203;
const GRID_HEIGHT = 141;
const cameraZone = (point: THREE.Vector3) =>
  Math.floor((point.x - GRID_MIN_X) / 4) +
  32 * Math.floor((point.z - GRID_MIN_Z) / 4);

// Player-radius-expanded furniture; the promenade and office doorway remain open.
const OBSTACLES = [
  ...PEDESTRIAN_RESERVATIONS,
  // Expanded silhouettes include awnings and the traveller's backpack/jump envelope.
  ...[-12, -4.5, 3, 10.5].map((x) => ({ x, z: 0, width: 7.4, depth: 7.8 })),
  { x: -19, z: 1.8, width: 3.55, depth: 2.8 },
  ...[-16.7, 16.4].map((x) => ({ x, z: 2.2, width: 3.3, depth: 1.85 })),
  ...[-8.3, 6.8].map((x) => ({ x, z: 2.3, width: 2.7, depth: 2.1 })),
  ...[
    { x: -18, z: -1.2 },
    { x: 17.8, z: -0.6 },
    { x: -32, z: 1.5 },
    { x: 32, z: 1 },
  ].map((point) => ({ ...point, width: 3.6, depth: 3.6 })),
  ...[20, 28].map((x) => ({ x, z: -2.7, width: 4.1, depth: 2.1 })),
  { x: 20.4, z: -4.14, width: 5, depth: 1.5 },
  { x: 27.7, z: -4.14, width: 4.5, depth: 1.5 },
  ...[22.58, 25.42].map((x) => ({ x, z: -4, width: 1.35, depth: 1.6 })),
  { x: -10, z: 14.8, width: 4.4, depth: 3 },
  ...[-22, 4, 16].map((x) => ({ x, z: 7.15, width: 1.6, depth: 2 })),
  ...[-26, -20, -2, 8, 28].map((x) => ({
    x,
    z: 17.6,
    width: 1.5,
    depth: 1.5,
  })),
  ...STATIONS.flatMap((station) =>
    [-3.2, -1.05, 1.05, 3.2].map((offset) => ({
      x: station.x + offset,
      z: station.z + 1.75,
      width: 1.4,
      depth: 1.4,
    })),
  ),
  ...STATIONS.map((station) => ({
    x: station.x + 2.1,
    z: station.z - 0.9,
    width: 3.3,
    depth: 1.9,
  })),
];

function nearSegment(
  x: number,
  z: number,
  start: { x: number; z: number },
  end: { x: number; z: number },
  radius: number,
) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSq = dx * dx + dz * dz;
  const amount =
    lengthSq === 0
      ? 0
      : clamp(((x - start.x) * dx + (z - start.z) * dz) / lengthSq, 0, 1);
  return (
    Math.hypot(x - (start.x + amount * dx), z - (start.z + amount * dz)) <=
    radius
  );
}

function walkable(x: number, z: number) {
  if (!outsideAmbientDomains({ x, z })) return false;
  const street = x >= -31 && x <= 32 && z >= 3.5 && z <= 15.8;
  const entrance = x >= 22.85 && x <= 25.15 && z >= -3.8 && z <= 15.8;
  const stationPlaza = STATIONS.some(
    (station) => Math.hypot(x - station.x, z - station.z) <= 4.6,
  );
  const stationRoute = STATIONS.some((station) =>
    station.route
      .slice(1)
      .some((point, index) =>
        nearSegment(x, z, station.route[index]!, point, 3.2),
      ),
  );
  return (
    (street || entrance || stationPlaza || stationRoute) &&
    !OBSTACLES.some(
      (box) =>
        Math.abs(x - box.x) < box.width / 2 &&
        Math.abs(z - box.z) < box.depth / 2,
    )
  );
}

/** Camera, gameplay and rendering have one owner. React receives only queued game events. */
export function createJourney(
  host: HTMLDivElement,
  options: JourneyOptions,
): JourneyController {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-16, 16, 9, -9, 0.1, 280);
  const hemi = new THREE.HemisphereLight("#fff4d6", "#65538a", 2.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2aa", 3.2);
  sun.position.set(-18, 42, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -58,
    right: 58,
    top: 44,
    bottom: -44,
    near: 1,
    far: 125,
  });
  sun.shadow.normalBias = 0.06;
  sun.shadow.bias = -0.00015;
  scene.add(sun);

  let world: ReturnType<typeof createWorld>;
  try {
    world = createWorld();
  } catch (error) {
    renderer.dispose();
    renderer.domElement.remove();
    throw error;
  }
  scene.add(world.root);

  const initialStation = STATIONS[0]!;
  const position = new THREE.Vector3(initialStation.x, 0.3, initialStation.z);
  const velocity = new THREE.Vector3();
  const input = new THREE.Vector2();
  const intended = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3(12, 29, 18);
  const cameraRight = new THREE.Vector3(
    cameraOffset.z,
    0,
    -cameraOffset.x,
  ).normalize();
  const cameraDown = new THREE.Vector3(
    cameraOffset.x,
    0,
    cameraOffset.z,
  ).normalize();
  const target = new THREE.Vector3(initialStation.x, 0, initialStation.z - 1.5);
  const desiredTarget = target.clone();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
  const clickedPoint = new THREE.Vector3();
  const discovered = new Set<DiscoveryId>();
  const validCells = new Uint8Array(GRID_WIDTH * GRID_HEIGHT);
  for (let i = 0; i < validCells.length; i++) {
    validCells[i] = Number(
      walkable(
        GRID_MIN_X + (i % GRID_WIDTH) * GRID_STEP,
        GRID_MIN_Z + Math.floor(i / GRID_WIDTH) * GRID_STEP,
      ),
    );
  }

  let running = false;
  let automatic = false;
  let nearby: NearbyId = null;
  let message = "Find five creative keepsakes, or head straight to the office.";
  let route: THREE.Vector3[] = [];
  let targetInteraction: NearbyId = null;
  let walkPhase = 0;
  let jumpHeight = 0;
  let jumpVelocity = 0;
  let elapsed = 0;
  let zoom = 1;
  let aspect = 1;
  let frustumHeight = 18;
  let enteringAt: number | null = null;
  let arrived = false;
  let paused = false;
  let currentStation: StationId = initialStation.id;
  let disposed = false;
  let frame = 0;
  let lastTime = performance.now();
  let snapshotTimer: number | null = null;
  let ringTime = 0;
  let burstAge = 10;
  let currentZone = cameraZone(position);

  // A small pooled pickup burst, not an idle decorative particle system.
  const chipGeometry = new THREE.BoxGeometry(0.08, 0.13, 0.035);
  const chipMaterial = new THREE.MeshBasicMaterial({ color: "#ffb81c" });
  const chips = Array.from({ length: 12 }, () => {
    const mesh = new THREE.Mesh(chipGeometry, chipMaterial);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  });
  const burstOrigin = new THREE.Vector3();

  const snapshot = (): GameSnapshot => ({
    discovered: DISCOVERIES.filter((spot) => discovered.has(spot.id)).map(
      (spot) => spot.id,
    ),
    nearby,
    prompt:
      nearby === "office"
        ? "Enter the office"
        : (DISCOVERIES.find((spot) => spot.id === nearby)?.prompt ??
          "Explore the neighbourhood"),
    message,
    automatic,
  });
  const publish = () => {
    if (disposed || snapshotTimer !== null) return;
    snapshotTimer = window.setTimeout(() => {
      snapshotTimer = null;
      if (!disposed) options.onSnapshot(snapshot());
    }, 0);
  };

  const findNearby = () => {
    let next: NearbyId = null;
    let nearest = 2.2;
    if (position.distanceTo(OFFICE) < 2.1) next = "office";
    else
      for (const spot of DISCOVERIES) {
        if (discovered.has(spot.id)) continue;
        const distance = Math.hypot(position.x - spot.x, position.z - spot.z);
        if (distance < nearest) {
          nearest = distance;
          next = spot.id;
        }
      }
    if (next !== nearby) {
      nearby = next;
      publish();
    }
  };

  // Solve a short grid route only on a click/guide command, never on every render.
  const nearestCell = (point: THREE.Vector3) => {
    let best = -1;
    let distance = Infinity;
    for (let i = 0; i < validCells.length; i++) {
      if (!validCells[i]) continue;
      const x = GRID_MIN_X + (i % GRID_WIDTH) * GRID_STEP;
      const z = GRID_MIN_Z + Math.floor(i / GRID_WIDTH) * GRID_STEP;
      const squared = (point.x - x) ** 2 + (point.z - z) ** 2;
      if (squared < distance) {
        distance = squared;
        best = i;
      }
    }
    return best;
  };
  const cellPoint = (cell: number) =>
    new THREE.Vector3(
      GRID_MIN_X + (cell % GRID_WIDTH) * GRID_STEP,
      0.3,
      GRID_MIN_Z + Math.floor(cell / GRID_WIDTH) * GRID_STEP,
    );
  const planRoute = (goal: THREE.Vector3) => {
    const start = nearestCell(position);
    const end = nearestCell(goal);
    if (start < 0 || end < 0) return;
    const previous = new Int32Array(validCells.length).fill(-1);
    const queue = new Int32Array(validCells.length);
    let read = 0;
    let write = 1;
    queue[0] = start;
    previous[start] = start;
    while (read < write && previous[end] === -1) {
      const cell = queue[read++];
      for (const next of [
        cell - 1,
        cell + 1,
        cell - GRID_WIDTH,
        cell + GRID_WIDTH,
      ]) {
        if (
          next < 0 ||
          next >= validCells.length ||
          !validCells[next] ||
          previous[next] !== -1
        )
          continue;
        if (
          Math.abs(next - cell) === 1 &&
          Math.floor(next / GRID_WIDTH) !== Math.floor(cell / GRID_WIDTH)
        )
          continue;
        previous[next] = cell;
        queue[write++] = next;
      }
    }
    if (previous[end] === -1) return;
    const cells = [end];
    while (cells[cells.length - 1] !== start)
      cells.push(previous[cells[cells.length - 1]]);
    cells.reverse();
    route = [];
    // Retain turn vertices instead of taking every half-unit grid step.
    for (let i = 0; i < cells.length; i++) {
      if (
        i === 0 ||
        i === cells.length - 1 ||
        cells[i] - cells[i - 1] !== cells[i + 1] - cells[i]
      )
        route.push(cellPoint(cells[i]));
    }
    const destination = cellPoint(end);
    world.destinationRing.position.copy(destination);
    world.destinationRing.position.y = 0.32;
    world.destinationRing.visible = true;
    ringTime = 0;
  };
  const planStationRoute = (stationId: StationId) => {
    const station = getStation(stationId);
    if (Math.hypot(position.x - station.x, position.z - station.z) > 4.5) {
      planRoute(OFFICE);
      return;
    }
    route = station.route
      .slice(1)
      .map((point) => new THREE.Vector3(point.x, 0.3, point.z));
    world.destinationRing.position.set(OFFICE.x, 0.32, OFFICE.z);
    world.destinationRing.visible = true;
    ringTime = 0;
  };

  const stopAuto = () => {
    if (automatic) {
      automatic = false;
      publish();
    }
  };
  const interact = () => {
    if (disposed || enteringAt !== null || paused) return;
    findNearby();
    if (!nearby) return;
    stopAuto();
    route = [];
    input.set(0, 0);
    velocity.set(0, 0, 0);
    world.destinationRing.visible = false;
    if (nearby === "office") {
      // Approach through the same collision-aware path, then continue through the open doorway.
      planRoute(OFFICE);
      if (!route.length) {
        message = "Move toward the office doorway, then press E to enter.";
        publish();
        return;
      }
      route.push(new THREE.Vector3(OFFICE.x, 0.3, -5.8));
      world.destinationRing.visible = false;
      enteringAt = performance.now();
      running = false;
      jumpHeight = jumpVelocity = 0;
      targetInteraction = null;
      message = "Walking into the office.";
      publish();
      return;
    }
    const spot = DISCOVERIES.find((item) => item.id === nearby);
    if (!spot) return;
    discovered.add(spot.id);
    const pickup = world.discoveries.find((item) => item.id === spot.id);
    if (pickup) {
      burstOrigin.copy(pickup.node.position);
      pickup.node.visible = false;
    }
    burstAge = 0;
    message =
      discovered.size === DISCOVERIES.length
        ? "All five found. Head to the office whenever you’re ready."
        : spot.message;
    nearby = null;
    paused = true;
    input.set(0, 0);
    velocity.set(0, 0, 0);
    route = [];
    publish();
    options.onDiscovery(spot.id);
  };

  const updateTheme = () => {
    scene.background = new THREE.Color(
      darkMode.matches ? "#17123f" : "#e6e9e7",
    );
    hemi.intensity = darkMode.matches ? 1.8 : 2.4;
    renderer.toneMappingExposure = darkMode.matches ? 1.05 : 1.2;
  };
  updateTheme();
  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    aspect = width / height;
    renderer.setSize(width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  const tick = (now: number) => {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    if (document.hidden) {
      lastTime = now;
      return;
    }
    const dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;
    if (!paused) elapsed += dt;
    intended.set(0, 0, 0);
    if (!paused) {
      if (enteringAt === null && input.lengthSq() > 0.001) {
        intended
          .addScaledVector(cameraRight, input.x)
          .addScaledVector(cameraDown, input.y);
      } else if (route.length) {
        const waypoint = route[0];
        const remaining = Math.hypot(
          waypoint.x - position.x,
          waypoint.z - position.z,
        );
        if (remaining < 0.14) {
          route.shift();
          if (!route.length) {
            velocity.set(0, 0, 0);
            stopAuto();
            if (enteringAt !== null && !arrived) {
              arrived = true;
              message = "Welcome to Arrey Waah.";
              publish();
              options.onArrive();
            }
            if (targetInteraction) {
              interact();
              targetInteraction = null;
            }
          }
        } else {
          intended.subVectors(waypoint, position).setY(0).normalize();
          // Slow enough to hit a turn vertex rather than overshooting a narrow doorway.
          intended.multiplyScalar(Math.min(1, remaining / 0.55));
        }
      }
      if (intended.lengthSq() > 1) intended.normalize();
      const speed =
        enteringAt !== null
          ? 2.4
          : WALK_SPEED * (running && input.lengthSq() > 0 ? 1.65 : 1);
      velocity.x = THREE.MathUtils.damp(velocity.x, intended.x * speed, 18, dt);
      velocity.z = THREE.MathUtils.damp(velocity.z, intended.z * speed, 18, dt);
      const nextX = position.x + velocity.x * dt;
      const nextZ = position.z + velocity.z * dt;
      const canStep = (x: number, z: number) =>
        walkable(x, z) ||
        (enteringAt !== null &&
          x >= OFFICE.x - 0.7 &&
          x <= OFFICE.x + 0.7 &&
          z >= -6 &&
          z <= OFFICE.z + 0.4);
      if (canStep(nextX, position.z)) position.x = nextX;
      else velocity.x = 0;
      if (canStep(position.x, nextZ)) position.z = nextZ;
      else velocity.z = 0;
    }
    const moving = velocity.lengthSq() > 0.06;
    if (moving) {
      const angle = Math.atan2(velocity.x, velocity.z);
      const delta = Math.atan2(
        Math.sin(angle - world.traveller.rotation.y),
        Math.cos(angle - world.traveller.rotation.y),
      );
      world.traveller.rotation.y += reducedMotion.matches
        ? delta
        : delta * Math.min(1, dt * 16);
      walkPhase += dt * velocity.length() * 2.8;
    }
    if (jumpHeight > 0 || jumpVelocity > 0) {
      jumpVelocity -= dt * 18;
      jumpHeight = Math.max(0, jumpHeight + jumpVelocity * dt);
      if (jumpHeight === 0) jumpVelocity = 0;
    }
    if (!paused) world.updateAmbient(elapsed, position, reducedMotion.matches);
    world.traveller.position.copy(position);
    if (!reducedMotion.matches) {
      const swing = moving ? Math.sin(walkPhase) * 0.5 : 0;
      world.limbs.forEach((limb, i) => {
        limb.rotation.x = swing * (i === 0 || i === 3 ? 1 : -1);
      });
      world.traveller.position.y +=
        jumpHeight + (moving ? Math.abs(Math.sin(walkPhase)) * 0.05 : 0);

      world.discoveries.forEach((item, i) => {
        if (!item.node.visible) return;
        item.node.position.y = 1.4 + Math.sin(elapsed * 2.1 + i) * 0.12;
        item.node.rotation.y = elapsed * 0.45;
      });
      world.destinationMarker.scale.setScalar(
        1 + Math.sin(elapsed * 2) * 0.025,
      );
    } else {
      world.limbs.forEach((limb) => {
        limb.rotation.x = 0;
      });
      world.destinationMarker.scale.setScalar(1);
    }
    if (!paused) burstAge += dt;
    chips.forEach((chip, i) => {
      chip.visible = !reducedMotion.matches && burstAge < 0.7;
      if (!chip.visible) return;
      const angle = (i / chips.length) * Math.PI * 2;
      chip.position.set(
        burstOrigin.x + Math.cos(angle) * burstAge * 2,
        burstOrigin.y + burstAge * 3 - burstAge ** 2 * 6,
        burstOrigin.z + Math.sin(angle) * burstAge * 2,
      );
      chip.rotation.set(burstAge * 8, angle, burstAge * 5);
      chip.scale.setScalar(1 - burstAge / 0.7);
    });
    if (world.destinationRing.visible && !paused) {
      ringTime += dt;
      world.destinationRing.scale.setScalar(
        reducedMotion.matches ? 1 : 1 + Math.sin(ringTime * 5) * 0.08,
      );
      if (!route.length && ringTime > 0.8)
        world.destinationRing.visible = false;
    }

    findNearby();
    options.onPosition(position.x, position.z);
    const doorOpen =
      enteringAt !== null
        ? 1
        : clamp((5 - position.distanceTo(OFFICE)) / 3, 0, 1);
    world.doors.forEach((door, i) => {
      door.position.x =
        Number(door.userData.closedX) + (i === 0 ? -1 : 1) * doorOpen * 0.85;
    });

    // A close, cover-style camera: world ground continues far beyond every viewport edge.
    desiredTarget.set(position.x, 0, position.z - 1.5);
    const zone = cameraZone(position);
    if (reducedMotion.matches) {
      // Static framing within each street zone; instant cuts replace continuous follow motion.
      if (zone !== currentZone) {
        currentZone = zone;
        target.set(position.x, 0, position.z - 1.5);
      }
    } else target.lerp(desiredTarget, 1 - Math.exp(-dt * 7));
    const desiredHeight = (aspect < 0.85 ? 21 : 18) * zoom;
    frustumHeight = reducedMotion.matches
      ? desiredHeight
      : THREE.MathUtils.damp(frustumHeight, desiredHeight, 8, dt);
    camera.left = (-frustumHeight * aspect) / 2;
    camera.right = (frustumHeight * aspect) / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    camera.position.copy(target).add(cameraOffset);
    camera.lookAt(target);
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);
  publish();

  const onContextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    options.onError();
  };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  darkMode.addEventListener("change", updateTheme);

  return {
    move(x, y, run = false) {
      if (disposed || enteringAt !== null || paused) return;
      input.set(x, y);
      if (input.lengthSq() > 1) input.normalize();
      running = run;
      if (input.lengthSq() > 0.001) {
        stopAuto();
        route = [];
        targetInteraction = null;
        world.destinationRing.visible = false;
      }
    },
    walkTo(clientX, clientY) {
      if (disposed || enteringAt !== null || paused) return;
      stopAuto();
      input.set(0, 0);
      const bounds = host.getBoundingClientRect();
      pointer.set(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        -((clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      camera.updateMatrixWorld();
      world.root.updateMatrixWorld(true);
      raycaster.setFromCamera(pointer, camera);
      targetInteraction = null;
      const pickups = world.discoveries.filter(
        (item) => !discovered.has(item.id),
      );
      const hit = raycaster.intersectObjects(
        [...pickups.map((item) => item.node), world.destinationMarker],
        true,
      )[0];
      if (hit) {
        let root: THREE.Object3D | null = hit.object;
        while (root && root.parent !== world.root) root = root.parent;
        const pickup = pickups.find((item) => item.node === root);
        if (pickup) {
          const spot = DISCOVERIES.find((item) => item.id === pickup.id)!;
          planRoute(new THREE.Vector3(spot.x, 0.3, spot.z));
          targetInteraction = spot.id;
          return;
        }
        if (root === world.destinationMarker) {
          planRoute(OFFICE);
          targetInteraction = "office";
          return;
        }
      }
      if (raycaster.ray.intersectPlane(ground, clickedPoint))
        planRoute(clickedPoint);
    },
    autoWalk(enabled) {
      if (disposed || enteringAt !== null || paused) return;
      if (enabled) {
        input.set(0, 0);
        planStationRoute(currentStation);
        automatic = route.length > 0;
        targetInteraction = null;
      } else {
        if (automatic) {
          route = [];
          velocity.set(0, 0, 0);
        }
        automatic = false;
      }
      publish();
    },
    interact,
    jump() {
      if (
        disposed ||
        enteringAt !== null ||
        paused ||
        jumpHeight > 0 ||
        reducedMotion.matches
      )
        return;
      jumpVelocity = 5.8;
    },
    zoom(delta) {
      zoom = clamp(zoom + delta, 0.75, 1.5);
    },
    startAt(stationId) {
      if (disposed || enteringAt !== null) return;
      currentStation = stationId;
      const station = getStation(stationId);
      position.set(station.x, 0.3, station.z);
      target.set(station.x, 0, station.z - 1.5);
      desiredTarget.copy(target);
      currentZone = cameraZone(position);
      velocity.set(0, 0, 0);
      input.set(0, 0);
      route = [];
      automatic = false;
      paused = false;
      targetInteraction = null;
      world.destinationRing.visible = false;
      message = `Starting near ${station.name}. Follow the corridor toward the office.`;
      publish();
    },
    pause() {
      if (disposed) return;
      paused = true;
      input.set(0, 0);
      velocity.set(0, 0, 0);
      route = [];
      stopAuto();
    },
    resume() {
      if (disposed || enteringAt !== null) return;
      paused = false;
    },
    reset() {
      if (disposed || enteringAt !== null) return;
      const station = getStation(currentStation);
      position.set(station.x, 0.3, station.z);
      velocity.set(0, 0, 0);
      input.set(0, 0);
      route = [];
      automatic = false;
      targetInteraction = null;
      discovered.clear();
      nearby = null;
      jumpHeight = jumpVelocity = 0;
      zoom = 1;
      elapsed = 0;
      walkPhase = 0;
      world.updateAmbient(0, position, reducedMotion.matches);
      world.traveller.rotation.y = 0;
      burstAge = 10;
      target.set(station.x, 0, station.z - 1.5);
      currentZone = cameraZone(position);
      paused = false;
      world.discoveries.forEach((item) => {
        item.node.visible = true;
        item.node.position.y = 1.4;
        item.node.rotation.y = 0;
      });
      world.destinationRing.visible = false;
      message = `A fresh walk from ${station.name}. The five keepsakes are back on the street.`;
      publish();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      if (snapshotTimer !== null) window.clearTimeout(snapshotTimer);
      observer.disconnect();
      darkMode.removeEventListener("change", updateTheme);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      world.dispose();
      chips.forEach((chip) => chip.removeFromParent());
      chipGeometry.dispose();
      chipMaterial.dispose();
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
