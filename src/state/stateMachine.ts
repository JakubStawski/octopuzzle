import { createMachine, interpret } from 'xstate';
import * as gameEngine from '../engine/game';
import { GameContext, GameState, GameEvent } from './types';

/**
 * Condition for stateMachines announcement state that determines if player lost
 * @param context current state of the game
 * @param event events that has been sent
 * @param condMeta condition meta
 * @returns boolean
 */
const didPlayerLose = (context, event, condMeta) =>
    condMeta.state.event.type === 'TIMEOUT' || condMeta.state.event.type === 'WRONG_CHOICE';

/**
 * Condition for stateMachines announcement state that determines if player won
 * @param context current state of the game
 * @param event events that has been sent
 * @param condMeta condition meta
 * @returns boolean
 */
const didPlayerWin = (context, event, condMeta) => condMeta.state.event.type === 'COMPLETED';

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
            controllsEnabled: true,
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
                },
            },
        },
        announce: {
            entry: [gameEngine.blockUserControlls],
            after: {
                2000: [
                    {
                        target: 'lose',
                        cond: didPlayerLose,
                        actions: [gameEngine.unblockUserControlls],
                    },
                    {
                        target: 'add_score',
                        cond: didPlayerWin,
                    },
                ],
            },
        },
        add_score: {
            entry: [
                gameEngine.calculatePointsAfterCompletion,
                gameEngine.accelerateTime,
                gameEngine.unblockUserControlls,
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
                WRONG_CHOICE: 'announce',
            },
        },
        win: {
            entry: gameEngine.checkCompletion,
            on: {
                COMPLETED: 'announce',
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
                CONTINUE: 'reset',
            },
        },
        high_scores: {
            entry: gameEngine.showHighScores,
            on: {
                CONTINUE: 'main_screen',
            },
        },
        reset: {
            entry: [gameEngine.setInitialState, gameEngine.resetGameView],
            on: {
                CONTINUE: 'idle',
            },
        },
        main_screen: {
            entry: gameEngine.setInitialState,
            on: {
                START: {
                    target: 'idle',
                },
            },
        },
    },
});

export const gameService = interpret(gameMachine).onTransition((context, event) => {});
