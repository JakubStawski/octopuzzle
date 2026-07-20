import { IHighscoresBoard } from 'src/pixi/types';
import { gameService } from '../state/stateMachine';
import { BoardSingleSide, GameContext } from '../state/types';
import { findMostFrequentItem, randomizePieceColor, randomizeUniquePiecePart, Timer } from './utils';

const COMPLETION_SCORING: Record<number, number> = {
    1: 10,
    2: 40,
    3: 100,
    4: 300,
};

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
    context.piece = {
        remainingTime: 5000 * context.player.timeAcceleration,
        part: randomizeUniquePiecePart(context),
        color: randomizePieceColor(),
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
export const checkChoice = (context: GameContext, event: { value: string }) => {
    if (context.board[event.value][context.piece.part] !== undefined) {
        gameService.send({ type: 'WRONG_CHOICE' });

        return;
    }

    gameService.send({ type: 'RIGHT_CHOICE', value: event.value });
};

/**
 * Funtion that checks if the choice that was made by player completes the octi
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
 * the time player have to make decission
 * @param context state of the game
 */
export const accelerateTime = (context: GameContext) => {
    if (context.player.timeAcceleration * 0.8 <= 0.2) {
        return;
    }
    context.player.timeAcceleration *= 0.8;
};

/**
 * Reset the amount of time player have to make decission to default
 * @param context state of the game
 */
export const resetTimeAcceleration = (context: GameContext) => {
    context.player.timeAcceleration = 1;
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
export const assignPieceToBoard = (context: GameContext, event: { value: string }) => {
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
        lives: 4,
        timeoutID: null,
        timeAcceleration: 1,
    };
    context.settings = {
        controlsEnabled: true,
        musicEnabled: context.settings.musicEnabled,
    };
    context.announceOutcome = null;
    context.countdownValue = 3;
};

/**
 * Adding score to the highscores
 * @param context state of the game
 */
export const addScoreToHighScores = (context: GameContext) => {
    const currentHighscores = localStorage.getItem('highScoreBoard') || '[]';

    const highScoreBoard: IHighscoresBoard[] = JSON.parse(currentHighscores);
    const entryId = Date.now();
    highScoreBoard.push({
        date: new Date().toLocaleString('pl-PL'),
        score: context.player.score,
        id: entryId,
    });

    const compareFn = (a: IHighscoresBoard, b: IHighscoresBoard) => {
        if (a.score > b.score) {
            return -1;
        }

        if (a.score < b.score) {
            return 1;
        }

        return 0;
    };
    highScoreBoard.sort(compareFn);

    if (highScoreBoard.length > 10) {
        highScoreBoard.pop();
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
