import { IHighscoresBoard } from '../pixi/types';
import { gameService } from '../state/stateMachine';
import { BoardSingleSide, GameContext, GameEvent } from '../state/types';
import { findMostFrequentItem, randomizePieceColor, randomizeUniquePiecePart, Timer } from './utils';

const COMPLETION_SCORING: Record<number, number> = {
    1: 10,
    2: 50,
    3: 100,
    4: 200,
};

/** Base decision window before acceleration (ms) */
export const BASE_DECISION_TIME_MS = 5000;

/** Multiply remaining time by this on each clear after grace */
const TIME_ACCEL_FACTOR = 0.9;

/** Floor so long runs stay playable (~2.0 s) */
const MIN_TIME_ACCELERATION = 2.0 / (BASE_DECISION_TIME_MS / 1000);

/** First N clears do not tighten the timer */
const GRACE_CLEARS = 3;

/** Soft recovery toward 1.0 after losing a life */
const LIFE_LOSS_ACCEL_RECOVERY = 0.15;

/**
 * Points for a completed octopus based on matching color count
 */
export const getCompletionPoints = (side: BoardSingleSide): number => {
    const colors = Object.keys(side).map((part) => side[part].color);
    const { count } = findMostFrequentItem(colors);
    return COMPLETION_SCORING[count] || 0;
};

/**
 * Function that randomizes a piece with given context
 * and overrides given context with generated piece
 * @param context state of the game
 */
export const randomizePiece = (context: GameContext) => {
    const part = randomizeUniquePiecePart(context);

    context.piece = {
        remainingTime: BASE_DECISION_TIME_MS * context.player.timeAcceleration,
        part,
        color: randomizePieceColor(context, part),
    };
};

/**
 * Function that checks if the chosen part already exists in chosen board part
 * Sends an 'WRONG_CHOICE' event if so, and 'RIGHT_CHOICE' if the chosen board part
 * was able to accept the choice
 *
 * @param context state of the game
 * @param event event object
 * @returns
 */
export const checkChoice = (context: GameContext, event: GameEvent) => {
    if (event.type !== 'CHOICE') {
        return;
    }

    if (context.board[event.value][context.piece.part] !== undefined) {
        gameService.send({ type: 'WRONG_CHOICE' });

        return;
    }

    gameService.send({ type: 'RIGHT_CHOICE', value: event.value });
};

/**
 * Function that checks if the choice that was made by player completes the octi
 * If so, 'COMPLETED' event is sent, and 'CONTINUE' event is sent otherwise
 *
 * @param context state of the game
 */
export const checkCompletion = (context: GameContext) => {
    let isCompleted = false;
    Object.keys(context.board).forEach((item) => {
        if (Object.keys(context.board[item]).length === 4) {
            isCompleted = true;
            gameService.send({ type: 'COMPLETED', value: item });
        }
    });

    if (!isCompleted) {
        gameService.send({ type: 'CONTINUE' });
    }
};

/**
 * Once the piece is completed tighten up
 * the time player have to make a decision.
 * Grace clears keep full pressure off early game; floor prevents ~1s timers.
 * @param context state of the game
 */
export const accelerateTime = (context: GameContext) => {
    context.player.clearsCompleted += 1;

    if (context.player.clearsCompleted <= GRACE_CLEARS) {
        return;
    }

    const next = context.player.timeAcceleration * TIME_ACCEL_FACTOR;
    if (next < MIN_TIME_ACCELERATION) {
        context.player.timeAcceleration = MIN_TIME_ACCELERATION;
        return;
    }

    context.player.timeAcceleration = next;
};

/**
 * Soften timer pressure after a life loss without wiping the skill curve
 * @param context state of the game
 */
export const softenTimeAcceleration = (context: GameContext) => {
    context.player.timeAcceleration = Math.min(1, context.player.timeAcceleration + LIFE_LOSS_ACCEL_RECOVERY);
};

/**
 * Finds most frequent color of the completed octi and calculate the points
 * based on object inside the function.
 * Adds score to game state and clears the board after
 * @param context state of the game
 * @param event event object
 */
export const calculatePointsAfterCompletion = (context: GameContext) => {
    let sideToClear = '';
    let points = 0;
    Object.keys(context.board).forEach((element) => {
        if (Object.keys(context.board[element]).length === 4) {
            sideToClear = element;
            points = getCompletionPoints(context.board[element]);
        }
    });

    addScore(context, points);

    clearCompletedBoard(sideToClear, context);
    gameService.send({ type: 'CONTINUE' });
};

/**
 * Assign piece to chosen part of the board
 * @param context state of the game
 * @param event event object
 */
export const assignPieceToBoard = (context: GameContext, event: GameEvent) => {
    if (event.type !== 'RIGHT_CHOICE') {
        return;
    }

    context.board[event.value][context.piece.part] = { color: context.piece.color };
};

/**
 * Function that deprives player of life and exits the game if player has no more lifes
 * @param context game state
 * @returns
 */
export const loseHp = (context: GameContext) => {
    context.player.lives -= 1;

    if (context.player.lives <= 0) {
        gameService.send({ type: 'GAME_OVER', score: context.player.score });

        return;
    }

    gameService.send({ type: 'CONTINUE' });
};

export const setInitialState = (context: GameContext) => {
    if (context.player.timeoutID) {
        context.player.timeoutID.stop();
        context.player.timeoutID = null;
    }

    context.board = {
        top: {},
        left: {},
        right: {},
        bottom: {},
    };
    context.piece = {
        remainingTime: 3000,
        part: 'lt',
        color: 2,
    };
    context.player = {
        score: 0,
        lives: 3,
        timeoutID: null,
        timeAcceleration: 1,
        clearsCompleted: 0,
    };
    context.settings = {
        controlsEnabled: true,
        musicEnabled: context.settings.musicEnabled,
    };
    context.announceOutcome = null;
    context.countdownValue = 3;
};

/**
 * Safely read high scores from localStorage
 */
export const loadHighScoreBoard = (): IHighscoresBoard[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem('highScoreBoard') || '[]');
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (entry): entry is IHighscoresBoard =>
                !!entry &&
                typeof entry === 'object' &&
                typeof entry.score === 'number' &&
                typeof entry.date === 'string',
        );
    } catch {
        return [];
    }
};

/**
 * Adding score to the highscores
 * @param context state of the game
 */
export const addScoreToHighScores = (context: GameContext) => {
    const highScoreBoard = loadHighScoreBoard();
    const entryId = Date.now();
    highScoreBoard.push({
        date: new Date().toLocaleString('pl-PL'),
        score: context.player.score,
        id: entryId,
    });

    highScoreBoard.sort((a, b) => b.score - a.score);

    if (highScoreBoard.length > 10) {
        highScoreBoard.length = 10;
    }

    localStorage.setItem('highScoreBoard', JSON.stringify(highScoreBoard));
    localStorage.setItem('lastHighscoreId', String(entryId));
};

/**
 * Adding score to the game state
 * @param context game state
 * @param score number which represents points
 */
export const addScore = (context: GameContext, score: number) => {
    context.player.score += score;
};

/**
 * Clears given part of the board
 * @param context game state
 * @param event event object
 */
export const clearCompletedBoard = (sideToClear: string, context: GameContext) => {
    gameService.send({ type: 'CLEAR', value: sideToClear });
    context.board[sideToClear] = {};
};

/**
 * Mounts timeout with remainingTime that's given in piece object of game state
 * If no decision is made by the player in given time the TIMEOUT event is sent
 * @param context game state
 */
export const mountTimeout = (context: GameContext) => {
    const timeoutID = new Timer(() => {
        gameService.send({ type: 'TIMEOUT' });
    }, context.piece.remainingTime);

    context.player.timeoutID = timeoutID;
    timeoutID.start();
};

/**
 * Unmounts timeout after player makes a choice
 * @param context game state
 */
export const unmountTimeout = (context: GameContext) => {
    context.player.timeoutID?.stop();
};

/**
 * Pause decision timer (e.g. when tab is hidden)
 */
export const pauseTimeout = (context: GameContext) => {
    if (context.player.timeoutID?.getStateRunning()) {
        context.player.timeoutID.stop();
    }
};

/**
 * Resume decision timer after tab becomes visible again
 */
export const resumeTimeout = (context: GameContext) => {
    if (context.player.timeoutID && !context.player.timeoutID.getStateRunning()) {
        context.player.timeoutID.start();
    }
};

/**
 * Persist music preference after MUTE assign
 */
export const persistMusicSetting = (context: GameContext) => {
    localStorage.setItem('musicEnabled', context.settings.musicEnabled.toString());
};

/**
 * Method that blocks user controls
 * @param context state of the game
 */
export const blockUserControls = (context: GameContext) => {
    context.settings.controlsEnabled = false;
};

/**
 * Method that unblocks user controls
 * @param context state of the game
 */
export const unblockUserControls = (context: GameContext) => {
    context.settings.controlsEnabled = true;
};
