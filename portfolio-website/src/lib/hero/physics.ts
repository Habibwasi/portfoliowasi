import type MatterJS from "matter-js";
import { SQUASH_MS, TILE_HEIGHT, TILE_SCRAMBLE_MS, TILE_WIDTH, impactEffect, liftOf, scrambleSequence } from "./hero";

type Matter = typeof MatterJS;

export type PhysicsControl = {
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const STEP_MS = 1000 / 60;
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

/**
 * Drops the letter tiles into the art column and lets the mouse push them (5.2). The tiles are
 * DOM elements placed from the bodies on every frame. The loop stops while paused and when
 * every body is asleep, and wakes on the next press. The mouse never captures the wheel or touch,
 * so the page always scrolls (P2).
 */
export function startPhysics(Matter: Matter, art: HTMLElement, tileEls: HTMLElement[]): PhysicsControl {
  const { Bodies, Body, Composite, Engine, Events, Mouse, MouseConstraint, Sleeping } = Matter;
  const width = art.clientWidth;
  const height = art.clientHeight;
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.1;

  const wall = 400;
  Composite.add(engine.world, [
    Bodies.rectangle(width / 2, height + wall / 2, width + wall * 2, wall, { isStatic: true }),
    Bodies.rectangle(-wall / 2, height / 2 - 1000, wall, height + 2000, { isStatic: true }),
    Bodies.rectangle(width + wall / 2, height / 2 - 1000, wall, height + 2000, { isStatic: true }),
  ]);

  // Each tile starts above the pile and falls in, a little after the one before.
  const faces = tileEls.map((el) => el.querySelector<HTMLElement>(".hw-letter__face")!);
  // Spread across the column so no two tiles start overlapping (overlaps push them apart hard).
  const gap = Math.max(TILE_WIDTH + 4, (width - TILE_WIDTH - 16) / Math.max(1, tileEls.length - 1));
  const bodies = tileEls.map((_, i) =>
    Bodies.rectangle(Math.min(width - TILE_WIDTH / 2 - 8, TILE_WIDTH / 2 + 8 + i * gap), TILE_HEIGHT / 2 + 8 - (i % 2) * 40, TILE_WIDTH, TILE_HEIGHT, {
      chamfer: { radius: 10 },
      restitution: 0.2,
      friction: 0.6,
      frictionAir: 0.012,
      angle: (i % 2 ? 1 : -1) * 0.08,
    }),
  );
  // Heavier to turn than a real tile: they tilt and tumble a little but mostly land upright.
  bodies.forEach((body) => Body.setInertia(body, body.inertia * 6));
  bodies.forEach((body, i) => setTimeout(() => Composite.add(engine.world, body), i * 140));

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

  // Tiles keep their resting layout position; the body moves them by transform only, so the
  // physics never causes a layout shift (CLS).
  const rest = tileEls.map((el) => ({ left: el.offsetLeft, top: el.offsetTop }));

  const draw = () => {
    bodies.forEach((body, i) => {
      const x = body.position.x - TILE_WIDTH / 2 - rest[i].left;
      const y = body.position.y - TILE_HEIGHT / 2 - rest[i].top;
      const el = tileEls[i];
      el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
      el.style.setProperty("--lift", liftOf(height - (body.position.y + TILE_HEIGHT / 2)).toFixed(2));
    });
  };

  const tick = () => {
    Engine.update(engine, STEP_MS);
    draw();
    const resting = bodies.every((b) => b.isSleeping || !engine.world.bodies.includes(b)) && !drag.body;
    const allIn = bodies.every((b) => engine.world.bodies.includes(b));
    frame = resting && allIn ? 0 : requestAnimationFrame(tick);
  };

  const wake = () => {
    if (paused || frame) return;
    bodies.forEach((b) => Sleeping.set(b, false));
    frame = requestAnimationFrame(tick);
  };
  art.addEventListener("mousedown", wake);

  art.dataset.physics = "running";
  frame = requestAnimationFrame(tick);

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
      cancelAnimationFrame(frame);
      frame = 0;
      paused = true;
      art.removeEventListener("mousedown", wake);
      window.removeEventListener("mouseup", releaseOutside);
      art.removeEventListener("mousemove", handlers.mousemove);
      art.removeEventListener("mousedown", handlers.mousedown);
      art.removeEventListener("mouseup", handlers.mouseup);
      Engine.clear(engine);
      for (const el of tileEls) {
        el.style.removeProperty("transform");
        el.style.removeProperty("--lift");
      }
      art.dataset.physics = "off";
    },
  };
}
