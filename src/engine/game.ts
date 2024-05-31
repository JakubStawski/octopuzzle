import { IHighscoresBoard } from 'src/pixi/types';
import { gameService } from '../state/stateMachine';
import { findMostFrequentItem, randomizePieceColor, randomizeUniquePiecePart, Timer } from './utils';

export const clickSound = new CustomEvent('clickEvent');
export const winSound = new CustomEvent('winEvent');
export const loseSound = new CustomEvent('loseEvent');
export const completeSound = new CustomEvent('completeEvent');
export const gameStartedSound = new CustomEvent('gameStartedEvent');
export const gameOverSound = new CustomEvent('gameOverEvent');

/**
 * Function that randomizes a piece with given context
 * and overrides given context with generated piece
 * @param context state of the game
 */
export const randomizePiece = (context) => {
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
export const checkChoice = (context, event) => {
    if (context.board[event.value][context.piece.part] !== undefined) {
        window.dispatchEvent(loseSound);

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
export const checkCompletion = (context) => {
    let array = [];
    let isCompleted = false;
    Object.keys(context.board).forEach((item) => {
        if (Object.keys(context.board[item]).length === 4) {
            isCompleted = true;
            window.dispatchEvent(winSound);
            gameService.send({ type: 'COMPLETED', value: item });
            array = Object.keys(context.board[item]).map((el) => context.board[item][el].color);
        }
    });

    if (isCompleted) {
        const { count } = findMostFrequentItem(array);

        return;
    }
    gameService.send({ type: 'CONTINUE' });
};

/**
 * Once the piece is completed tighten up
 * the time player have to make decission
 * @param context state of the game
 */
export const accelerateTime = (context) => {
    if (context.player.timeAcceleration * 0.8 <= 0.2) {
        return;
    }
    context.player.timeAcceleration *= 0.8;
};

/**
 * Reset the amount of time player have to make decission to default
 * @param context state of the game
 */
export const resetTimeAcceleration = (context) => {
    context.player.timeAcceleration = 1;
};

/**
 * Finds most frequent color of the completed octi and calculate the points
 * based on object inside the function.
 * Adds score to game state and clears the board after
 * @param context state of the game
 * @param event event object
 */
export const calculatePointsAfterCompletion = (context, event) => {
    let array = [];
    let sideToClear = '';
    Object.keys(context.board).forEach((element) => {
        if (Object.keys(context.board[element]).length === 4) {
            sideToClear = element;
            array = Object.keys(context.board[element]).map((item) => context.board[element][item].color);
        }
    });

    const { count } = findMostFrequentItem(array);
    const scoring = {
        1: 10,
        2: 40,
        3: 100,
        4: 300,
    };

    addScore(context, scoring[count]);

    clearCompletedBoard(sideToClear, context, event);
    gameService.send({ type: 'CONTINUE' });
};

/**
 * Assign piece to chosen part of the board
 * @param context state of the game
 * @param event event object
 */
export const assignPieceToBoard = (context, event) => {
    context.board[event.value][context.piece.part] = { color: context.piece.color };
};

/**
 * Function that deprives player of life and exits the game if player has no more lifes
 * @param context game state
 * @returns
 */
export const loseHp = (context) => {
    context.player.lives -= 1;

    if (context.player.lives < 0) {
        gameService.send({ type: 'GAME_OVER', score: context.player.score });

        return;
    }

    gameService.send({ type: 'CONTINUE' });
};

/**
 * Showing highscores
 * @param context state of the game
 */
export const showHighScores = (context) => {
    console.table({
        'Your score': context.player.score,
    });
};

export const setInitialState = (context) => {
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
        controllsEnabled: true,
    };
};

/**
 * Reset game view
 */
export const resetGameView = () => {
    gameService.send({ type: 'RESET' });
};

/**
 * Adding score to the highscores
 * @param context state of the game
 */
export const addScoreToHighScores = (context) => {
    const curretHighscores = localStorage.getItem('highScoreBoard') || '[]';

    const highScoreBoard = JSON.parse(curretHighscores);
    highScoreBoard.push({
        date: new Date().toLocaleString('pl-PL'),
        score: context.player.score,
    });

    const compareFn = (a: IHighscoresBoard, b: IHighscoresBoard) => {
        if (a.score > b.score) {
            return -1;
        }

        if (a.score > b.score) {
            return 1;
        }

        return 0;
    };
    highScoreBoard.sort(compareFn);

    if (highScoreBoard.length > 10) {
        highScoreBoard.pop();
    }

    localStorage.setItem('highScoreBoard', JSON.stringify(highScoreBoard));
};

/**
 * Adding score to the game state
 * @param context game state
 * @param score number which represents points
 */
export const addScore = (context, score) => {
    context.player.score += score;
};

/**
 * Clears given part of the board
 * @param context game state
 * @param event event object
 */
export const clearCompletedBoard = (sideToClear, context, event) => {
    gameService.send({ type: 'CLEAR', value: sideToClear });
    context.board[sideToClear] = {};
};

/**
 * Mounts timeout with remainingTime that's given in piece object of game state
 * If no decision is made by the player in given time the TIMEOUT event is sent
 * @param context game state
 */
export const mountTimeout = (context) => {
    const timeoutID = new Timer(() => {
        window.dispatchEvent(loseSound);
        gameService.send({ type: 'TIMEOUT' });
    }, context.piece.remainingTime);

    context.player.timeoutID = timeoutID;
    timeoutID.start();
};

/**
 * Unmounts timeout after player makes a choice
 * @param context game state
 */
export const unmountTimeout = (context) => {
    context.player.timeoutID.stop();
};

/**
 * Method that blocks userControlls
 * @param context state of the game
 */
export const blockUserControlls = (context) => {
    context.settings.controllsEnabled = false;
};

/**
 * Method that unblocks userControlls
 * @param context state of the game
 */
export const unblockUserControlls = (context) => {
    context.settings.controllsEnabled = true;
};
