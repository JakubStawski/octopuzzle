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
