import * as PIXI from 'pixi.js';
import SideBoard from '../components/SideBoard';

import CenterBoard from '../components/CenterBoard';
import config from '../config.json';

export default class GameBoard extends PIXI.Container {
    /**
     * Top board
     */
    private _topBoard: PIXI.Container;

    /**
     * Bottom board
     */
    private _bottomBoard: PIXI.Container;

    /**
     * Left board
     */
    private _leftBoard: PIXI.Container;

    /**
     * Right board
     */
    private _rightBoard: PIXI.Container;

    /**
     * Center board
     */
    private _centerBoard: PIXI.Container;

    /**
     * Width
     */
    private _w: number;

    /**
     * Height
     */
    private _h: number;

    /**
     * Constructor of the pixi application and its stage
     */
    constructor() {
        super();
        this._init();
    }

    /**
     * Create boards on init
     */
    private _init() {
        this._createTopBoard();
        this._createBottomBoard();
        this._createLeftBoard();
        this._createRightBoard();

        this._createCenterBoard();
    }

    /**
     * Creates top board
     */
    private _createTopBoard() {
        this._topBoard = new SideBoard('top');
        this._topBoard.y = -this._topBoard.height - config.config.gameBoardGap;

        this.addChild(this._topBoard);
    }

    /**
     * Creates bottom board
     */
    private _createBottomBoard() {
        this._bottomBoard = new SideBoard('bottom');
        this._bottomBoard.y = this._bottomBoard.height + config.config.gameBoardGap;

        this.addChild(this._bottomBoard);
    }

    /**
     * Creates left board
     */
    private _createLeftBoard() {
        this._leftBoard = new SideBoard('left');
        this._leftBoard.x = -this._leftBoard.width - config.config.gameBoardGap;

        this.addChild(this._leftBoard);
    }

    /**
     * Creates right board
     */
    private _createRightBoard() {
        this._rightBoard = new SideBoard('right');
        this._rightBoard.x = this._rightBoard.width + config.config.gameBoardGap;
        this.addChild(this._rightBoard);
    }

    /**
     * Creates center board
     */
    private _createCenterBoard() {
        this._centerBoard = new CenterBoard(
            this._w / 3 - 2 * config.config.gameBoardGap,
            this._h / 3 - 2 * config.config.gameBoardGap,
        );

        this.addChild(this._centerBoard);
    }
}
