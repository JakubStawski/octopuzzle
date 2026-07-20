import { assign, createMachine, interpret } from 'xstate';
import * as gameEngine from '../engine/game';
import { GameContext, GameState, GameEvent } from './types';

/**
 * Game state machine
 * Can be visually shown on xstate visualizer
 */
export const gameMachine = createMachine<GameContext, GameEvent, GameState>({
    initial: 'main_screen',
    id: 'game',
    context: {
        board: {
            top: {},
            left: {},
            right: {},
            bottom: {},
        },
        piece: {
            remainingTime: 3000,
            part: 'lt',
            color: 2,
        },
        player: {
            score: 0,
            lives: 4,
            timeoutID: null,
            timeAcceleration: 1,
        },
        settings: {
            controlsEnabled: true,
            musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
        },
        announceOutcome: null,
    },
    on: {
        MUTE: {
            actions: [
                assign({
                    settings: (context) => ({
                        ...context.settings,
                        musicEnabled: !context.settings.musicEnabled,
                    }),
                }),
                gameEngine.persistMusicSetting,
            ],
        },
        BLUR: {
            actions: gameEngine.pauseTimeout,
        },
        FOCUS: {
            actions: gameEngine.resumeTimeout,
        },
    },
    states: {
        idle: {
            entry: [gameEngine.randomizePiece, gameEngine.mountTimeout],
            on: {
                CHOICE: {
                    target: 'check_choice',
                    actions: [gameEngine.unmountTimeout],
                },
                TIMEOUT: {
                    target: 'announce',
                    actions: assign({ announceOutcome: () => 'lose' as const }),
                },
            },
        },
        announce: {
            entry: [gameEngine.blockUserControls],
            after: {
                2000: [
                    {
                        target: 'lose',
                        cond: (context) => context.announceOutcome === 'lose',
                        actions: [gameEngine.unblockUserControls],
                    },
                    {
                        target: 'add_score',
                        cond: (context) => context.announceOutcome === 'win',
                        actions: [gameEngine.unblockUserControls],
                    },
                ],
            },
        },
        add_score: {
            entry: [
                gameEngine.calculatePointsAfterCompletion,
                gameEngine.accelerateTime,
                gameEngine.unblockUserControls,
            ],
            on: {
                CONTINUE: {
                    target: 'idle',
                },
            },
        },
        check_choice: {
            entry: [gameEngine.checkChoice],
            on: {
                RIGHT_CHOICE: { target: 'win', actions: gameEngine.assignPieceToBoard },
                WRONG_CHOICE: {
                    target: 'announce',
                    actions: assign({ announceOutcome: () => 'lose' as const }),
                },
            },
        },
        win: {
            entry: gameEngine.checkCompletion,
            on: {
                COMPLETED: {
                    target: 'announce',
                    actions: assign({ announceOutcome: () => 'win' as const }),
                },
                CONTINUE: 'idle',
            },
        },
        lose: {
            entry: [gameEngine.resetTimeAcceleration, gameEngine.loseHp],
            on: {
                CONTINUE: {
                    target: 'idle',
                },
                GAME_OVER: 'game_over',
            },
        },
        game_over: {
            entry: [gameEngine.addScoreToHighScores],
            on: {
                MAIN_MENU: {
                    target: 'main_screen',
                    actions: [gameEngine.setInitialState],
                },
            },
        },
        high_scores: {
            on: {
                MAIN_MENU: 'main_screen',
            },
        },
        main_screen: {
            entry: gameEngine.setInitialState,
            on: {
                START: {
                    target: 'idle',
                },
                HIGH_SCORES: {
                    target: 'high_scores',
                },
                SETTINGS: {
                    target: 'settings',
                },
                CREDITS: {
                    target: 'credits',
                },
            },
        },
        settings: {
            on: {
                MAIN_MENU: 'main_screen',
            },
        },
        credits: {
            on: {
                MAIN_MENU: 'main_screen',
            },
        },
    },
});

export const gameService = interpret(gameMachine);
