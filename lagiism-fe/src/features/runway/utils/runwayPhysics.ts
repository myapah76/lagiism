export const CLASSIC_PHONE = {
  ax: 0.3,
  ay: 22,
  sx: 0.32,
  sy: 22,
  sr: 0.76,
  ex: 0.55,
  d: 4,
} as const;

export const SPRING_K = 95;
export const SPRING_C = 19.49;
export const SETTLE_EPSILON = 0.0006;
export const TRIP_EPSILON = 0.02;
export const SUBSTEPS = 3;

export interface BodySpringState {
  index: number;
  goal: number;
  x: number;
  v: number;
  g: number;
  from: number;
  trip: boolean;
}

export interface BodyPose {
  xPx: number;
  bottomPx: number;
  scale: number;
  opacity: number;
  blurPx: number;
  zIndex: number;
  culled: boolean;
}

/** Wraps circular index delta into [0, count) */
export function wrapN(value: number, count: number): number {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
}

/** Wraps circular index delta into signed [-count/2, count/2) for 3D Ring mode */
export function wrapSigned(value: number, count: number): number {
  if (count <= 0) return 0;
  let w = wrapN(value, count);
  if (w >= count / 2) w -= count;
  return w;
}

export function getClassicUnit(stageWidth: number): number {
  return Math.max(90, stageWidth * 0.32 * 1.6);
}

export function getRingUnit(stageWidth: number): number {
  return Math.max(140, stageWidth * 0.28);
}

export function createInitialBodies(count: number, activeTarget: number, isMobile: boolean): BodySpringState[] {
  return Array.from({ length: count }, (_, index) => {
    const goal = isMobile ? wrapN(index - activeTarget, count) : wrapSigned(index - activeTarget, count);
    return {
      index,
      goal,
      x: goal,
      v: 0,
      g: goal,
      from: goal,
      trip: false,
    };
  });
}

/**
 * Integrates one body spring step with 3 substeps (K = 95, C = 19.49).
 * Returns true if the body is still moving (not yet settled).
 */
export function stepBodySpring(
  body: BodySpringState,
  target: number,
  count: number,
  dt: number,
  dragging: boolean,
  isMobile: boolean,
  snapImmediate: boolean
): boolean {
  const nextGoal = isMobile
    ? wrapN(body.index - target, count)
    : wrapSigned(body.index - target, count);

  if (snapImmediate) {
    body.goal = nextGoal;
    body.x = nextGoal;
    body.g = nextGoal;
    body.v = 0;
    body.from = nextGoal;
    body.trip = false;
    return false;
  }

  // Detect circular wrap trip when goal jumps more than half the ring
  if (Math.abs(nextGoal - body.goal) > count / 2) {
    body.from = body.x;
    body.trip = true;
  }
  body.goal = nextGoal;

  const tau = dragging
    ? 0.016
    : body.trip
      ? 0.1
      : 0.03 + 0.04 * Math.min(Math.abs(body.goal), 4);

  const clampedDt = Math.min(dt, 0.05);
  const subDt = clampedDt / SUBSTEPS;

  for (let s = 0; s < SUBSTEPS; s++) {
    body.g += (body.goal - body.g) * (1 - Math.exp(-subDt / tau));
    const accel = SPRING_K * (body.g - body.x) - SPRING_C * body.v;
    body.v += accel * subDt;
    body.x += body.v * subDt;
  }

  if (body.trip && Math.abs(body.x - body.goal) < TRIP_EPSILON && Math.abs(body.v) < 0.15) {
    body.trip = false;
  }

  const settled =
    !body.trip &&
    Math.abs(body.x - body.goal) < SETTLE_EPSILON &&
    Math.abs(body.g - body.goal) < SETTLE_EPSILON &&
    Math.abs(body.v) < SETTLE_EPSILON;

  if (settled) {
    body.x = body.goal;
    body.g = body.goal;
    body.v = 0;
    return false;
  }

  return true;
}

/**
 * Computes mobile classic-mode visual pose using exact spec geometry.
 */
export function computeClassicPhonePose(
  body: BodySpringState,
  stageWidth: number,
  isRestingFrontHero: boolean
): BodyPose {
  const { ax, ay, sx, sy, sr, ex, d } = CLASSIC_PHONE;
  let k = body.x;
  let e = -1;

  if (body.trip && Math.abs(body.goal - body.from) > 0.0001) {
    const u = Math.min(1, Math.abs(body.x - body.from) / Math.abs(body.goal - body.from));
    if (body.goal > body.from) {
      // Forward trip
      if (u < 0.5) {
        e = 2 * u * 1.4;
      } else {
        k = body.goal + 2 * (1 - u);
      }
    } else {
      // Backward trip
      if (u < 0.5) {
        k = body.from + 2 * u;
      } else {
        e = 2 * (1 - u) * 1.4;
      }
    }
  } else if (k < 0) {
    e = Math.min(-k, 1.4);
  }

  if (e >= 0) {
    return {
      xPx: stageWidth * (ax - ex * e),
      bottomPx: ay - 22 * e,
      scale: 1 + 0.14 * e,
      opacity: Math.max(0, 1 - 1.05 * e),
      blurPx: 4 * Math.min(e, 1),
      zIndex: 1100,
      culled: e > 1.15,
    };
  }

  if (k >= 3.05) {
    return {
      xPx: stageWidth * (ax + sx * k),
      bottomPx: ay + sy * k,
      scale: Math.pow(sr, k),
      opacity: 0,
      blurPx: 3.2,
      zIndex: 960,
      culled: true,
    };
  }

  const baseOpacity =
    k <= d - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (4 - k));

  return {
    xPx: stageWidth * (ax + sx * k),
    bottomPx: ay + sy * k,
    scale: Math.pow(sr, k),
    opacity: isRestingFrontHero ? 0 : baseOpacity,
    blurPx: Math.min(0.9 * Math.max(0, k), 3.2),
    zIndex: 1000 - Math.round(10 * k),
    culled: false,
  };
}

/**
 * Computes desktop 3D Ring mode circular orbit pose around the front active hero.
 */
export function computeDesktopRingPose(
  body: BodySpringState,
  count: number,
  stageWidth: number,
  isRestingFrontHero: boolean
): BodyPose {
  const angle = (body.x / Math.max(1, count)) * Math.PI * 2;
  const sinA = Math.sin(angle);
  const cosA = Math.cos(angle); // +1 at front (x=0), -1 at back

  const depth = (1 - cosA) * 0.5; // 0 at front, 1 at far back
  const radiusX = Math.min(stageWidth * 0.42, 460);

  const xPx = stageWidth * 0.5 + sinA * radiusX;
  const bottomPx = 18 + depth * 64;
  const scale = 1 - depth * 0.44;
  const baseOpacity = Math.max(0.14, 1 - depth * 0.78);
  const blurPx = depth < 0.08 ? 0 : Math.min(depth * 2.8, 2.6);
  const zIndex = Math.round(1000 - depth * 200);

  return {
    xPx,
    bottomPx,
    scale,
    opacity: isRestingFrontHero ? 0 : baseOpacity,
    blurPx,
    zIndex,
    culled: depth > 0.96,
  };
}
