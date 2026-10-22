import type MatterJS from "matter-js";
import { SQUASH_MS, TILE_HEIGHT, TILE_SCRAMBLE_MS, TILE_WIDTH, impactEffect, liftOf, scrambleSequence } from "./hero";

type Matter = typeof MatterJS;

export type PhysicsControl = {
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

/** Fixed physics step, run as often as real time needs, whatever the screen's refresh rate. */
const STEP_MS = 1000 / 120;
/** After a long gap (a hidden tab, a slow frame), catch up at most this much. */
const MAX_CATCH_UP_MS = 100;
/** The tiles drop one after another, H first, each straight into its own slot. */
const DROP_STAGGER_MS = 140;
/** Where a tile starts: near the top of the art column. */
const DROP_FROM_Y = TILE_HEIGHT / 2 + 8;
/** A press that moves less than this, this quickly, is a poke rather than a drag. */
const POKE_PX = 4;
const POKE_MS = 250;

/** Replays a CSS class on the tile's face (squash, poke) without fighting the body transform. */
function flash(face: HTMLElement, className: string, ms: number) {
  face.classList.remove(className);
  void face.offsetWidth;
  face.classList.add(className);
  setTimeout(() => face.classList.remove(className), ms);
}

function scrambleTile(face: HTMLElement) {
  if (face.dataset.glyph) return;
  const sequence = scrambleSequence(face.dataset.letter ?? "").slice(-5);
  const step = TILE_SCRAMBLE_MS / sequence.length;
  sequence.forEach((glyph, i) =>
    setTimeout(() => {
      if (i === sequence.length - 1) delete face.dataset.glyph;
      else face.dataset.glyph = glyph;
    }, i * step),
  );
}

/** A tile's resting place in the still pile: layout offset and the tilt its CSS gives it. */
function restOf(el: HTMLElement) {
  const transform = getComputedStyle(el).transform;
  const { a, b } = new DOMMatrix(transform === "none" ? undefined : transform);
  return { left: el.offsetLeft, top: el.offsetTop, angle: Math.atan2(b, a) };
}

/**
 * Drops the letter tiles in from the top of the art column, one after another, each into its own
 * slot so the name lands in order, and lets the mouse push them (5.2). They are placed from the
 * bodies on every frame by transform only, so nothing repaints or shifts. The loop
 * stops while paused and when every body is asleep, and wakes on the next press. The mouse never
 * captures the wheel or touch, so the page always scrolls (P2).
 */
export function startPhysics(Matter: Matter, art: HTMLElement, tileEls: HTMLElement[]): PhysicsControl {
  const { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint, Sleeping } = Matter;
  const width = art.clientWidth;
  const height = art.clientHeight;
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.1;

  // The side walls stand a little outside the column, so the end tiles don't catch on them as they land.
  const wall = 400;
  const clearance = 6;
  Composite.add(engine.world, [
    Bodies.rectangle(width / 2, height + wall / 2, width + wall * 2, wall, { isStatic: true }),
    Bodies.rectangle(-clearance - wall / 2, height / 2 - 1000, wall, height + 2000, { isStatic: true }),
    Bodies.rectangle(width + clearance + wall / 2, height / 2 - 1000, wall, height + 2000, { isStatic: true }),
  ]);

  const faces = tileEls.map((el) => el.querySelector<HTMLElement>(".hw-letter__face")!);
  const lifts = tileEls.map((el) => el.querySelector<HTMLElement>(".hw-letter__lift"));
  // Each tile falls from the top of the column straight down into its slot in the still pile, so
  // they land in order and the name reads H W A S I. Tiles keep their pile layout position and
  // are moved by transform only, so there is no layout shift.
  const rest = tileEls.map(restOf);
  const bodies = rest.map((r) =>
    Bodies.rectangle(r.left + TILE_WIDTH / 2, DROP_FROM_Y, TILE_WIDTH, TILE_HEIGHT, {
      chamfer: { radius: 10 },
      restitution: 0.1,
      friction: 0.6,
      frictionAir: 0.012,
      angle: (Math.random() - 0.5) * 0.04,
    }),
  );
  // Much heavier to turn than a real tile: they wobble a little on landing but stay upright.
  bodies.forEach((body) => Body.setInertia(body, body.inertia * 12));

  const mouse = Mouse.create(art);
  // Matter listens for the wheel (and cancels it) and for touch; the page must keep scrolling.
  const handlers = mouse as unknown as Record<"mousemove" | "mousedown" | "mouseup" | "mousewheel", EventListener>;
  art.removeEventListener("wheel", handlers.mousewheel);
  art.removeEventListener("touchmove", handlers.mousemove);
  art.removeEventListener("touchstart", handlers.mousedown);
  art.removeEventListener("touchend", handlers.mouseup);
  const releaseOutside = (event: MouseEvent) => handlers.mouseup(event);
  window.addEventListener("mouseup", releaseOutside);
  const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
  Composite.add(engine.world, drag);

  let press: { x: number; y: number; at: number } | null = null;
  Events.on(drag, "startdrag", () => {
    press = { x: mouse.position.x, y: mouse.position.y, at: performance.now() };
  });
  Events.on(drag, "enddrag", (event) => {
    const moved = press ? Math.hypot(mouse.position.x - press.x, mouse.position.y - press.y) : Infinity;
    const quick = press ? performance.now() - press.at < POKE_MS : false;
    // Matter's typings leave out the dragged body on this event.
    const i = bodies.indexOf((event as unknown as { body: MatterJS.Body }).body);
    if (i >= 0 && moved < POKE_PX && quick) flash(faces[i], "is-poked", 650);
    press = null;
  });

  Events.on(engine, "collisionStart", (event) => {
    for (const { bodyA, bodyB } of event.pairs) {
      const speed = Math.hypot(bodyA.velocity.x - bodyB.velocity.x, bodyA.velocity.y - bodyB.velocity.y);
      const effect = impactEffect(speed);
      for (const body of [bodyA, bodyB]) {
        const i = bodies.indexOf(body);
        if (i < 0) continue;
        if (effect.squash) flash(faces[i], "is-squashed", SQUASH_MS);
        if (effect.scramble) scrambleTile(faces[i]);
      }
    }
  });

  let frame = 0;
  let paused = false;
  let last = 0;
  let behind = 0;
  const previous = bodies.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle }));
  const shown = bodies.map(() => -1);

  // Draws each tile between the last two physics steps, so motion is even at any refresh rate.
  // Only transform and opacity change, and both stay on the compositor.
  const draw = (alpha: number) => {
    bodies.forEach((body, i) => {
      const p = previous[i];
      const x = p.x + (body.position.x - p.x) * alpha;
      const y = p.y + (body.position.y - p.y) * alpha;
      const angle = p.angle + (body.angle - p.angle) * alpha;
      const dx = (x - TILE_WIDTH / 2 - rest[i].left).toFixed(2);
      const dy = (y - TILE_HEIGHT / 2 - rest[i].top).toFixed(2);
      tileEls[i].style.transform = `translate(${dx}px, ${dy}px) rotate(${angle.toFixed(4)}rad)`;
      const lift = Math.round(liftOf(height - (y + TILE_HEIGHT / 2)) * 20) / 20;
      const shadow = lifts[i];
      if (shadow && lift !== shown[i]) {
        shadow.style.opacity = String(lift);
        shown[i] = lift;
      }
    });
  };

  const tick = (now: number) => {
    behind += last ? Math.min(now - last, MAX_CATCH_UP_MS) : STEP_MS;
    last = now;
    while (behind >= STEP_MS) {
      bodies.forEach((b, i) => Object.assign(previous[i], { x: b.position.x, y: b.position.y, angle: b.angle }));
      Engine.update(engine, STEP_MS);
      behind -= STEP_MS;
    }
    draw(behind / STEP_MS);
    // A tile still waiting at the top isn't in the world yet, so it never counts as asleep.
    const resting = bodies.every((b) => b.isSleeping) && !drag.body;
    frame = resting ? 0 : requestAnimationFrame(tick);
  };

  function wake() {
    if (paused || frame) return;
    bodies.forEach((b) => Sleeping.set(b, false));
    last = 0;
    behind = 0;
    frame = requestAnimationFrame(tick);
  }
  art.addEventListener("mousedown", wake);

  // Release the tiles one after another, H first; until then each waits at the top.
  const drops = bodies.map((body, i) =>
    setTimeout(() => {
      Composite.add(engine.world, body);
      wake();
    }, i * DROP_STAGGER_MS),
  );

  art.dataset.physics = "running";
  wake();

  return {
    pause() {
      paused = true;
      cancelAnimationFrame(frame);
      frame = 0;
      art.dataset.physics = "paused";
    },
    resume() {
      paused = false;
      art.dataset.physics = "running";
      wake();
    },
    stop() {
      drops.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      frame = 0;
      paused = true;
      art.removeEventListener("mousedown", wake);
      window.removeEventListener("mouseup", releaseOutside);
      art.removeEventListener("mousemove", handlers.mousemove);
      art.removeEventListener("mousedown", handlers.mousedown);
      art.removeEventListener("mouseup", handlers.mouseup);
      Engine.clear(engine);
      for (const el of tileEls) el.style.removeProperty("transform");
      for (const shadow of lifts) shadow?.style.removeProperty("opacity");
      art.dataset.physics = "off";
    },
  };
}
