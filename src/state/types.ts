import { Timer } from '../engine/utils';

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
    countdownValue: number;
}

export type GameEvent =
    | { type: 'START' }
    | { type: 'TIMEOUT'; value?: string }
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
