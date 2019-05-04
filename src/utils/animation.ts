import { animationFrameScheduler, concat, defer, interval, of, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeWhile } from 'rxjs/operators';

export type Interpolator<T> = (start: T, end: T) => (duration: number) => T;

const msElapsed = (scheduler = animationFrameScheduler) => defer(() => {
  const start = scheduler.now();

  return interval(0, scheduler)
    .pipe(map(() => scheduler.now() - start));
});

export const spring = (
  from: number,
  to: number,
  initialVelocity = 0,
  stiffness: number,
  damping: number,
  precision = 0.01,
) =>  {
  const lastFrameTimestamp = 0;
  const state = {
    position: from,
    velocity: initialVelocity,
  };

  const withoutLastFrame = msElapsed().pipe(
    map(timestamp => {
      // If for some reason we lost a lot of frames (e.g. process large payload or
      // stopped in the debugger), we only advance by 4 frames worth of
      // computation and will continue on the next frame. It's better to have it
      // running at faster speed than jumping to the end.
      const maxSteps = 64;
      if (timestamp > lastFrameTimestamp + maxSteps) {
        timestamp = lastFrameTimestamp + maxSteps;
      }

      // We are using a fixed time step and a maximum number of iterations.
      // The following post provides a lot of thoughts into how to build this
      // loop: http://gafferongames.com/game-physics/fix-your-timestep/
      const timestepInMs = 1;
      const timestepInSec = 1 / 1000;
      const numberOfSteps = Math.floor((timestamp - lastFrameTimestamp) / timestepInMs);

      for (let i = 0; i < numberOfSteps; ++i) {
        const forceSpring = -stiffness * (state.position - to);
        const forceDamper = -damping * state.velocity;

        const acceleration = forceSpring + forceDamper;

        state.velocity = state.velocity + acceleration * timestepInSec;
        state.position = state.position + state.velocity * timestepInSec;
      }

      return state;
    }),
    takeWhile(() => (
      Math.abs(state.velocity) > precision ||
      Math.abs(state.position - to) > precision
    )),
  );

  return concat(withoutLastFrame, of({ position: to, velocity: 0 }));
};

export const transition = (stiffness: number, damping: number) => (source: Observable<number>) => {
  let lastPosition: number | undefined;
  let lastVelocity = 0;

  return source.pipe(
    distinctUntilChanged(),
    switchMap(nextPosition => {
      if (lastPosition === undefined) {
        lastPosition = nextPosition;
        return of(nextPosition);
      }

      return spring(
        lastPosition,
        nextPosition,
        lastVelocity,
        stiffness,
        damping,
      ).pipe(map(({ position, velocity }) => {
        lastPosition = position;
        lastVelocity = velocity;

        return lastPosition;
      }));
    }),
  );
};
