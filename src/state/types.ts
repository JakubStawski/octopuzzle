import { Timer } from '../engine/utils';

export interface ToggleContext {
    count: number;
}

export type ToggleEvent = {
    type: 'TOGGLE';
};

export interface BoardSingleSide {
    lt?: {
        color: number;
    };
    lb?: {
        color: number;
    };
    rt?: {
        color: number;
    };
    rb?: {
        color: number;
    };
}

export interface Board {
    top: BoardSingleSide;
    left: BoardSingleSide;
    right: BoardSingleSide;
    bottom: BoardSingleSide;
}

export interface GameContext {
    board: Board;
    piece: {
        remainingTime: number;
        part: string;
        color: number;
    };
    player: {
        score: number;
        lives: number;
        timeoutID: Timer;
        timeAcceleration: number;
    };
    settings: {
        controllsEnabled: boolean;
    };
}

export interface GameState {
    value: string;
    context: GameContext;
    states: {
        main_screen: object;
        idle: object;
        check_choice: object;
        announce: object;
        win: object;
        lose: object;
        add_score: object;
        high_scores: object;
        game_over: object;
    };
}

export type GameEvent =
    | { type: 'START' }
    | { type: 'TIMEOUT'; value?: string }
    | { type: 'EXIT'; score?: number }
    | { type: 'CONTINUE' }
    | { type: 'CHOICE'; value: string }
    | { type: 'WRONG_CHOICE' }
    | { type: 'RIGHT_CHOICE'; value: string }
    | { type: 'COMPLETED'; value: string }
    | { type: 'CLEAR'; value: string }
    | { type: 'GAME_OVER'; score: number };
