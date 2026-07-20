import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import GameBoard from '../containers/GameBoard';
import { easeInOutCubic } from '../../engine/utils';

import config from '../config.json';

import Loader from './Loader';
import Lives from '../components/Lives';
import Score from '../components/Score';
import Timer from '../components/Timer';
import Highscores from '../containers/Highscores';
import Credits from '../containers/Credits';
import Settings from '../containers/Settings';
import MainMenu from '../containers/MainMenu';
import { animateOnTicker } from '../utils/animateOnTicker';

export interface IOctisGame extends PIXI.Application {
    resources: object;
}

export default class Stage {
    private static readonly DESIGN_SIZE = 1800;

    /**
     * Pixi application
     */
    private _app: PIXI.Application;

    /**
     * Game board container
     */
    private _gameBoard: PIXI.Container;

    /**
     * Resources loaded by loader
     */

    private _resources: unknown;

    /**
     * Score component
     */
    private _livesBoard: PIXI.Container;

    /**
     * Score component
     */
    private _scoreBoard: PIXI.Container;

    /**
     * Timer component
     */
    private _timer: PIXI.Container;

    /**
     * Logo component
     */
    private _logo: PIXI.Sprite;

    /**
     * Game and all game components container
     */
    private _gameContainer: PIXI.Container | null = null;

    /**
     * High scores board
     */
    private _highscores: PIXI.Container | null = null;

    /**
     * Credits screen
     */
    private _credits: PIXI.Container | null = null;

    /**
     * Settings screen
     */
    private _settings: PIXI.Container | null = null;

    /**
     * main menu container
     */
    private _mainMenu: PIXI.Container | null = null;

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Cancel active game-over animation
     */
    private _cancelGameOverAnim: (() => void) | null = null;

    /**
     * Constructor of the pixi application and its stage
     */
    constructor() {
        const existingCanvas = document.querySelector('canvas');

        this._app = new PIXI.Application({
            width: Stage.DESIGN_SIZE,
            height: Stage.DESIGN_SIZE,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            autoDensity: true,
            backgroundAlpha: 0,
            sharedTicker: true,
        });

        this._resources = new Loader();

        globalThis.__PIXI_APP__ = this._app;
        if (!existingCanvas) {
            document.querySelector('body').appendChild(this._app.view as HTMLCanvasElement);
        }

        this._app.stage.scale.set(1, 1);
        this._app.stage.position.set(Stage.DESIGN_SIZE / 2, Stage.DESIGN_SIZE / 2);
        window.addEventListener('resize', this._resize.bind(this));
        this._resize();

        window.addEventListener('assetsLoaded', this._init.bind(this));

        this._subscribeEvents();
    }

    /**
     * Fit square canvas into the viewport without distorting aspect ratio
     */
    private _resize() {
        const view = this._app.view as HTMLCanvasElement;
        const scale = Math.min(window.innerWidth / Stage.DESIGN_SIZE, window.innerHeight / Stage.DESIGN_SIZE);
        const displaySize = Math.floor(Stage.DESIGN_SIZE * scale);

        view.style.width = `${displaySize}px`;
        view.style.height = `${displaySize}px`;
    }

    /**
     * create Main Menu
     */
    private _createMainMenu() {
        this._mainMenu = new MainMenu();

        this._app.stage.addChild(this._mainMenu);
    }

    /**
     * Init the game
     */
    private _init() {
        this._resize();

        this._createMainMenu();
        this._createGameElements();
        this._createHighScores();
        this._createCredits();
        this._createSettings();
        this._syncScreens(gameService.getSnapshot());
    }

    private _createGameElements() {
        this._createGameContainer();
        this._createLogo();
        this._createGameBoard();
        this._createLives();
        this._createScore();
        this._createTimer();
    }

    /**
     * Create game container
     */
    private _createGameContainer() {
        this._gameContainer = new PIXI.Container();
        this._gameContainer.name = 'Game_MainContainer';
        this._gameContainer.visible = false;
        this._gameContainer.alpha = 1;
        this._gameContainer.y = 20;
        this._app.stage.addChild(this._gameContainer);
    }

    /**
     * Creates logo and adds it to the stage
     */
    private _createLogo() {
        this._logo = new PIXI.Sprite(PIXI.Assets.cache.get('logo'));
        this._logo.anchor.set(0.5, 0.5);
        this._logo.name = 'Game_Logo';

        this._logo.y = -config.config.frameHeight * 1.5 - config.config.gameBoardGap * 2 - 20;
        this._gameContainer.addChild(this._logo);
    }

    /**
     * Create container that contains game board with all side boards
     */
    private _createGameBoard() {
        this._gameBoard = new GameBoard();
        this._gameBoard.y = config.config.playerPanelHeight - config.config.gameBoardGap;

        this._gameContainer.addChild(this._gameBoard);
    }

    /**
     * Create highscores container
     */
    private _createHighScores() {
        this._highscores = new Highscores();
        this._highscores.position.set(0, 0);
        this._highscores.visible = false;
        this._app.stage.addChild(this._highscores);
    }

    /**
     * Create credits container
     */
    private _createCredits() {
        this._credits = new Credits();
        this._credits.position.set(0, 0);
        this._app.stage.addChild(this._credits);
    }

    /**
     * Create settings container
     */
    private _createSettings() {
        this._settings = new Settings();
        this._settings.position.set(0, 0);
        this._app.stage.addChild(this._settings);
    }

    /**
     * Create lives display
     */
    private _createLives() {
        this._livesBoard = new Lives();

        this._livesBoard.x = config.config.frameWidth / 2 + config.config.healthIconWidth;
        this._livesBoard.y = -config.config.frameHeight * 1.5 + this._livesBoard.height;

        this._gameContainer.addChild(this._livesBoard);
    }

    /**
     * creates score display
     */
    private _createScore() {
        this._scoreBoard = new Score();

        this._scoreBoard.x = config.config.frameWidth / 2 + config.config.healthIconWidth;
        this._scoreBoard.y =
            -config.config.frameHeight * 1.5 +
            this._scoreBoard.height +
            this._livesBoard.height +
            config.config.playerStatusGap;

        this._gameContainer.addChild(this._scoreBoard);
    }

    /**
     * Create timer that represents how much time player has left for decision
     */
    private _createTimer() {
        this._timer = new Timer();
        this._timer.x = 0;
        this._timer.y = 0;

        this._gameContainer.addChild(this._timer);
    }

    /**
     * Subscribe xstate events — screens driven by state.value
     */
    private _subscribeEvents() {
        const subscription = gameService.subscribe((state) => {
            if (state.matches('game_over') && state.event.type === 'GAME_OVER') {
                this._gameOverHandler();
            }

            this._syncScreens(state);
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    private _syncScreens(state) {
        if (!this._mainMenu) {
            return;
        }

        if (state.matches('main_screen')) {
            if (state.history?.value === 'game_over') {
                this._resetHandler();
            }

            this._setScreenVisibility({ menu: true });
            return;
        }

        if (state.matches('high_scores')) {
            this._setScreenVisibility({ highscores: true });
            return;
        }

        if (state.matches('credits')) {
            this._setScreenVisibility({ credits: true });
            return;
        }

        if (state.matches('settings')) {
            this._setScreenVisibility({ settings: true });
            return;
        }

        if (state.matches('game_over')) {
            return;
        }

        this._setScreenVisibility({ game: true });
    }

    private _setScreenVisibility(flags: {
        menu?: boolean;
        game?: boolean;
        highscores?: boolean;
        credits?: boolean;
        settings?: boolean;
    }) {
        if (this._mainMenu) this._mainMenu.visible = !!flags.menu;
        if (this._gameContainer) {
            this._gameContainer.visible = !!flags.game;
            if (flags.game) {
                this._gameContainer.alpha = 1;
            }
        }
        if (this._highscores) {
            this._highscores.visible = !!flags.highscores;
            if (flags.highscores) {
                this._highscores.alpha = 1;
            }
        }
        if (this._credits) this._credits.visible = !!flags.credits;
        if (this._settings) this._settings.visible = !!flags.settings;
    }

    /**
     * destroy everything after game and recreate for next session
     */
    private _resetHandler() {
        this._cancelGameOverAnim?.();
        this._cancelGameOverAnim = null;

        if (this._gameContainer) {
            this._gameContainer.destroy({ children: true });
            this._gameContainer = null;
        }

        this._createGameElements();
    }

    /**
     * Fade out the board and show highscores only
     */
    private _gameOverHandler() {
        this._cancelGameOverAnim?.();
        this._cancelGameOverAnim = null;

        const duration = 1200;
        let elapsed = 0;

        this._highscores.alpha = 0;
        this._highscores.visible = true;
        if (this._mainMenu) this._mainMenu.visible = false;
        if (this._credits) this._credits.visible = false;
        if (this._settings) this._settings.visible = false;

        this._cancelGameOverAnim = animateOnTicker((deltaMS) => {
            if (!this._gameContainer || !this._highscores) {
                this._cancelGameOverAnim = null;
                return true;
            }

            elapsed += deltaMS;
            const cubicAnimatedValue = easeInOutCubic(Math.min(1, elapsed / duration));

            this._gameContainer.alpha = 1 - cubicAnimatedValue;
            this._highscores.alpha = cubicAnimatedValue;

            if (cubicAnimatedValue >= 1) {
                this._gameContainer.visible = false;
                this._cancelGameOverAnim = null;
                return true;
            }
            return false;
        });
    }

    set resources(resources) {
        this._resources = resources;
    }

    get resources() {
        return this._resources;
    }
}
