/* eslint-disable no-plusplus */

import { gameService } from '../state/stateMachine';
import { GameContext } from '../state/types';

const PIECE_PARTS = ['lt', 'lb', 'rt', 'rb'] as const;
const PIECE_COLORS = [0, 1, 2, 3] as const;

/** Prefer parts with 2–3 open destinations over forced (1) or wide-open (4) */
const OPEN_SLOT_WEIGHT_PREFERRED = 3;
const OPEN_SLOT_WEIGHT_OTHER = 1;

/** Extra weight per board that is 3/4 and missing this part */
const NEAR_COMPLETE_PART_BOOST = 2;

/** Chance to bias color toward a dominant color on boards that can take this part */
const COLOR_DOMINANCE_BIAS = 0.3;

type WeightedOption<T> = { value: T; weight: number };

/**
 * Pick a value from weighted options (weights must be > 0)
 */
const pickWeighted = <T>(options: WeightedOption<T>[]): T => {
    const total = options.reduce((sum, option) => sum + option.weight, 0);
    let roll = Math.random() * total;

    for (let i = 0; i < options.length; i++) {
        roll -= options[i].weight;
        if (roll <= 0) {
            return options[i].value;
        }
    }

    return options[options.length - 1].value;
};

/**
 * Create string that contains 2 letters that represents which corner
 * of the piece is being given
 * @returns 2 letters string: first is X axis (l/r), second is Y axis (t/b)
 */
export const randomizePiecePart = () => {
    let result = '';
    const charactersX = 'lr';
    const charactersY = 'tb';
    result += charactersX.charAt(Math.floor(Math.random() * 2));
    result += charactersY.charAt(Math.floor(Math.random() * 2));

    return result;
};
/**
 * Formula to animate ease in out cubic transitions
 * @param x number from 0 to 1 representing progress of the animation
 * @returns
 */
export const easeInOutCubic = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/**
 * Randomizes piece part with preference for interesting choices (2–3 open slots)
 * and a boost for missing quarters on near-complete boards.
 * @param context state of the game
 * @returns unique piece part
 */
export const randomizeUniquePiecePart = (context: GameContext) => {
    const sides = Object.keys(context.board) as Array<keyof typeof context.board>;
    const candidates: WeightedOption<string>[] = [];

    for (let p = 0; p < PIECE_PARTS.length; p++) {
        const part = PIECE_PARTS[p];
        let openSlots = 0;
        let nearCompleteBoosts = 0;

        for (let i = 0; i < sides.length; i++) {
            const boardSide = context.board[sides[i]];
            const occupied = Object.keys(boardSide);

            if (occupied.includes(part)) {
                continue;
            }

            openSlots += 1;
            if (occupied.length === 3) {
                nearCompleteBoosts += 1;
            }
        }

        if (openSlots === 0) {
            continue;
        }

        const preferredSlots = openSlots === 2 || openSlots === 3;
        const weight =
            (preferredSlots ? OPEN_SLOT_WEIGHT_PREFERRED : OPEN_SLOT_WEIGHT_OTHER) +
            nearCompleteBoosts * NEAR_COMPLETE_PART_BOOST;

        candidates.push({ value: part, weight });
    }

    if (candidates.length === 0) {
        return randomizePiecePart();
    }

    return pickWeighted(candidates);
};

/**
 * Add visibility change listener to pause the game
 */
export const addVisibilityChangeListener = () => {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            gameService.send({ type: 'BLUR' });
            dispatchEvent(new CustomEvent('windowBlur'));
        } else {
            gameService.send({ type: 'FOCUS' });
            dispatchEvent(new CustomEvent('windowFocus'));
        }
    });
};

/**
 * Generates a color with a light bias toward colors that already dominate
 * on boards where the given part can still be placed.
 * @param context state of the game
 * @param part piece corner that was already chosen
 * @returns number between 0 - 3
 */
export const randomizePieceColor = (context: GameContext, part: string) => {
    const sides = Object.keys(context.board) as Array<keyof typeof context.board>;
    const dominantColors: number[] = [];

    for (let i = 0; i < sides.length; i++) {
        const boardSide = context.board[sides[i]];
        if (boardSide[part] !== undefined) {
            continue;
        }

        const colors = Object.keys(boardSide).map((key) => boardSide[key].color);
        if (colors.length === 0) {
            continue;
        }

        const { color } = findMostFrequentItem(colors);
        if (color >= 0) {
            dominantColors.push(color);
        }
    }

    if (dominantColors.length > 0 && Math.random() < COLOR_DOMINANCE_BIAS) {
        return dominantColors[Math.floor(Math.random() * dominantColors.length)];
    }

    return PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];
};

/**
 * This is a helper function that finds the count of most frequent color on finished piece
 *
 * @param array the array of colors on finished piece on board
 * @returns object containing color and color count of most frequent color on finished piece
 */
export const findMostFrequentItem = (array: number[]) => {
    const hash = new Map();
    for (let i = 0; i < array.length; i++) {
        if (hash.has(array[i])) {
            hash.set(array[i], hash.get(array[i]) + 1);
        } else {
            hash.set(array[i], 1);
        }
    }

    let maxCount = 0;
    let res = -1;
    hash.forEach((value, key) => {
        if (maxCount < value) {
            res = key;
            maxCount = value;
        }
    });

    return {
        color: res,
        count: maxCount,
    };
};

/**
 * Sends a directional choice if controls are enabled and the game is idle
 */
const trySendChoice = (value: 'top' | 'bottom' | 'left' | 'right') => {
    const snapshot = gameService.getSnapshot();
    const { controlsEnabled } = snapshot.context.settings;

    if (!controlsEnabled || !snapshot.matches('idle')) {
        return;
    }

    gameService.send({ type: 'CHOICE', value });
};

/**
 * Sets key bindings to play the game (arrow keys + WASD)
 */
export const setKeyBindings = () => {
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        if (e.key === 'ArrowUp' || key === 'w') {
            trySendChoice('top');
            return;
        }

        if (e.key === 'ArrowDown' || key === 's') {
            trySendChoice('bottom');
            return;
        }

        if (e.key === 'ArrowLeft' || key === 'a') {
            trySendChoice('left');
            return;
        }

        if (e.key === 'ArrowRight' || key === 'd') {
            trySendChoice('right');
        }
    });
};

/**
 * Sets swipe bindings for touch devices
 */
export const setSwipeBindings = () => {
    let startX = 0;
    let startY = 0;

    document.addEventListener(
        'touchstart',
        (e) => {
            if (e.touches.length !== 1) {
                return;
            }

            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        },
        { passive: true },
    );

    document.addEventListener(
        'touchend',
        (e) => {
            if (e.changedTouches.length !== 1) {
                return;
            }

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (Math.max(absX, absY) < 30) {
                return;
            }

            if (absX > absY) {
                trySendChoice(deltaX > 0 ? 'right' : 'left');
            } else {
                trySendChoice(deltaY > 0 ? 'bottom' : 'top');
            }
        },
        { passive: true },
    );
};

export class Timer {
    /**
     * Timeout id
     */
    private _id: ReturnType<typeof setTimeout>;

    /**
     * Boolean that determines if timer has started
     */
    private _started: number;

    /**
     * remaining time of the timer
     */
    private _remaining: number;

    /**
     * Is timer running
     */
    private _running: boolean;

    /**
     * Callback function
     */
    private _callback: () => void;

    /**
     * Starting time
     */
    public startingTime: number;

    constructor(callback: () => void, delay: number) {
        this.startingTime = delay;
        this._remaining = delay;
        this._callback = callback;
    }

    public start() {
        this._running = true;
        this._started = new Date().getTime();
        this._id = setTimeout(this._callback, this._remaining);
    }

    public stop() {
        this._running = false;
        clearTimeout(this._id);
        this._remaining -= new Date().getTime() - this._started;
    }

    public getTimeLeft() {
        if (this._running) {
            return Math.max(0, this._remaining - (Date.now() - this._started));
        }

        return Math.max(0, this._remaining);
    }

    public getStateRunning() {
        return this._running;
    }
}
