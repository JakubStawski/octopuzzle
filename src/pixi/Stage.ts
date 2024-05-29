import * as PIXI from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import GameBoard from './containers/GameBoard';

import config from './config.json';

import Loader from './Loader';
import PlayerPanel from './containers/PlayerPanel';
import Lives from './components/Lives';
import Score from './components/Score';
import Timer from './components/Timer';

export interface IOctisGame extends PIXI.Application {
    resources: object;
}

export default class Stage {
    /**
     * Pixi application
     */
    private _app: PIXI.Application;

    /**
     * Game board container
     */
    private _gameBoard: PIXI.Container;

    /**
     * Panel that contains lives, times and score of the player
     */
    private _playerPanel: PIXI.DisplayObject;

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
    private _gameContainer: PIXI.Container;

    /**
     * Constructor of the pixi application and its stage
     */
    constructor() {
        this._app = new PIXI.Application({
            resizeTo: document.querySelector('canvas'),
            resolution: 2,
            width: 1800,
            height: 1800,
            backgroundAlpha: 0,
        });

        this._resources = new Loader();

        globalThis.__PIXI_APP__ = this._app;
        if (!document.querySelector('canvas')) {
            document.querySelector('body').appendChild(this._app.view as HTMLCanvasElement);
        }

        this._app.stage.scale.set(1, 1);
        this._app.stage.position.set(this._app.renderer.screen.width / 2, this._app.renderer.screen.height / 2);
        window.addEventListener('resize', this._resize.bind(this));

        window.addEventListener('assetsLoaded', this._init.bind(this));
    }

    /**
     * Resize function
     */
    private _resize() {
        // this._app.stage.width = this._app.screen.width - config.config.mainStagePadding;
        // this._app.stage.height = this._app.screen.height - config.config.mainStagePadding;
    }

    /**
     * Init the game
     */
    private _init() {
        this._gameContainer = new PIXI.Container();
        this._gameContainer.name = 'Game_MainContainer';
        this._app.stage.addChild(this._gameContainer);

        this._gameContainer.width = this._app.screen.width - config.config.mainStagePadding;
        this._gameContainer.height = this._app.screen.height - config.config.mainStagePadding;

        this._gameContainer.y += 20;

        this._createGameBoard();
        // this._createPlayerPanel();
        this._resize();
        this._createLives();
        this._createScore();
        this._createTimer();

        this._createLogo();
    }

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
     * Create container that contains all the info of the player state
     */
    private _createPlayerPanel() {
        this._playerPanel = new PlayerPanel('', '0x000000', this._app.screen.width, config.config.playerPanelHeight);

        this._playerPanel.y = -this._app.stage.height / 2;

        this._playerPanel.name = 'PlayerPanel';
        this._playerPanel.x = 0;

        this._gameContainer.addChild(this._playerPanel);
    }

    set resources(resources) {
        this._resources = resources;
    }

    get resources() {
        return this._resources;
    }
}
