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

export type AnnounceOutcome = 'win' | 'lose' | null;

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
        timeoutID: Timer | null;
        timeAcceleration: number;
    };
    settings: {
        controlsEnabled: boolean;
        musicEnabled: boolean;
    };
    announceOutcome: AnnounceOutcome;
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
        credits: object;
        rules: object;
        settings: object;
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
    | { type: 'GAME_OVER'; score: number }
    | { type: 'BLUR' }
    | { type: 'FOCUS' }
    | { type: 'MUTE' }
    | { type: 'HIGH_SCORES' }
    | { type: 'CREDITS' }
    | { type: 'RULES' }
    | { type: 'SETTINGS' }
    | { type: 'MAIN_MENU' };
