import * as PIXI from 'pixi.js';
import GameBoard from './containers/GameBoard';

import config from './config.json';

import Loader from './Loader';
import PlayerPanel from './containers/PlayerPanel';

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
     * Constructor of the pixi application and its stage
     */
    constructor() {
        this._app = new PIXI.Application({
            resizeTo: document.querySelector('canvas'),
            resolution: 1,
            width: 2560,
            height: 1440,
            backgroundAlpha: 0,
        });

        this._resources = new Loader(this);

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
        this._app.stage.width = this._app.screen.width - config.config.mainStagePadding;
        this._app.stage.height = this._app.screen.height - config.config.mainStagePadding;
    }

    /**
     * Init the game
     */
    private _init() {
        this._createGameBoard();
        this._createPlayerPanel();
        this._resize();
    }

    /**
     * Create container that contains game board with all side boards
     */
    private _createGameBoard() {
        this._gameBoard = new GameBoard();
        this._gameBoard.y = config.config.playerPanelHeight - config.config.gameBoardGap;

        this._app.stage.addChild(this._gameBoard);
    }

    /**
     * Create container that contains all the info of the player state
     */
    private _createPlayerPanel() {
        this._playerPanel = new PlayerPanel('', '0x000000', this._app.screen.width, config.config.playerPanelHeight);

        this._playerPanel.y = -this._app.stage.height / 2;

        this._playerPanel.name = 'PlayerPanel';
        this._playerPanel.x = 0;

        this._app.stage.addChild(this._playerPanel);
    }

    set resources(resources) {
        this._resources = resources;
    }

    get resources() {
        return this._resources;
    }
}
