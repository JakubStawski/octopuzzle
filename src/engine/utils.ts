/* eslint-disable no-plusplus */

/**
 * Create string that contains 2 letters that represents which corner
 * of the piece is being given
 * @returns 2 letters string in which first one is the Y axis and second one is Y axis
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
 * Randomizes piece part which user is able to put in fiven context
 * @param context state of the game
 * @returns unique piece part
 */
export const randomizeUniquePiecePart = (context) => {
    let isUnique = false;
    let part = randomizePiecePart();

    while (!isUnique) {
        let includesCounter = 0;
        Object.keys(context.board).forEach((item) => {
            if (Object.keys(context.board[item]).includes(part)) {
                includesCounter += 1;
            }
        });

        if (includesCounter === 4) {
            part = randomizePiecePart();
            includesCounter = 0;
        } else {
            isUnique = true;
            includesCounter = 0;
        }
    }

    return part;
};

/**
 * Generates a number which represents color of the octi
 * @returns number between 0 - 3
 */
export const randomizePieceColor = () => Math.floor(Math.random() * 4);

/**
 * This is a helper function that finds the count of most frequent color on finished piece
 *
 * @param array the array of colors on finished piece on board
 * @returns object containing color and color count of most frequent color on finished piece
 */
export const findMostFrequentItem = (array) => {
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
 * Sets key bindings to play the game
 * @param gameService
 */
export const setKeyBindings = (gameService) => {
    document.addEventListener('keyup', (e) => {
        const { controllsEnabled } = gameService.getSnapshot().context.settings;
        if (e.keyCode === 38 && controllsEnabled) {
            gameService.send({ type: 'CHOICE', value: 'top' });
            return;
        }

        if (e.keyCode === 40 && controllsEnabled) {
            gameService.send({ type: 'CHOICE', value: 'bottom' });
            return;
        }

        if (e.keyCode === 37 && controllsEnabled) {
            gameService.send({ type: 'CHOICE', value: 'left' });
            return;
        }

        if (e.keyCode === 39 && controllsEnabled) {
            gameService.send({ type: 'CHOICE', value: 'right' });
        }
    });
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
            this.stop();
            this.start();
        }

        return this._remaining;
    }

    public getStateRunning() {
        return this._running;
    }
}
