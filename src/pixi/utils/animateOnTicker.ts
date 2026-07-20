import * as PIXI from 'pixi.js';

export type TickerAnimStep = (deltaMS: number) => boolean | void;

/**
 * Run a frame callback on PIXI.Ticker.shared until it returns true (done).
 * Returns a cancel function.
 */
export const animateOnTicker = (step: TickerAnimStep): (() => void) => {
    const ticker = PIXI.Ticker.shared;
    const handler = () => {
        if (step(ticker.deltaMS)) {
            ticker.remove(handler);
        }
    };
    ticker.add(handler);
    return () => ticker.remove(handler);
};

/**
 * Run a continuous ticker loop until cancelled.
 */
export const loopOnTicker = (step: (deltaMS: number) => void): (() => void) => {
    const ticker = PIXI.Ticker.shared;
    const handler = () => step(ticker.deltaMS);
    ticker.add(handler);
    return () => ticker.remove(handler);
};

/**
 * Pop-in scale animation (overshoot) for a display object.
 */
export const playPopIn = (
    target: PIXI.DisplayObject & { scale: PIXI.ObservablePoint; alpha?: number },
    options?: { duration?: number; fromScale?: number; overshoot?: number; onComplete?: () => void },
): (() => void) => {
    const node = target;
    const duration = options?.duration ?? 280;
    const fromScale = options?.fromScale ?? 0.35;
    const overshoot = options?.overshoot ?? 1.12;
    let elapsed = 0;

    node.scale.set(fromScale);
    if ('alpha' in node) {
        node.alpha = 0;
    }

    return animateOnTicker((deltaMS) => {
        if ((node as PIXI.DisplayObject).destroyed) {
            return true;
        }

        elapsed += deltaMS;
        const t = Math.min(1, elapsed / duration);
        // easeOutBack-ish
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const eased = 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
        const scale = fromScale + (1 - fromScale) * Math.min(eased, overshoot);
        node.scale.set(scale);

        if ('alpha' in node) {
            node.alpha = Math.min(1, t * 1.4);
        }

        if (t >= 1) {
            node.scale.set(1);
            if ('alpha' in node) {
                node.alpha = 1;
            }
            options?.onComplete?.();
            return true;
        }
        return false;
    });
};
