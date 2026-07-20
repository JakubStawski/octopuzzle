import * as PIXI from 'pixi.js';

import BoardSquare from './BoardSquare';
import Piece from './Piece';
import { gameService } from '../../state/stateMachine';

import config from '../config.json';

/**
 * Create board that represents current piece
 * and is placed in the middle of the Stage
 */
export default class CenterBoard extends PIXI.Container {
    /**
     * Center board square
     */
    private _boardSquare: PIXI.Container;

    /**
     * Current visible piece
     */
    private _currentPiece;

    /**
     * width
     */
    private _w: number;

    /**
     * height
     */
    private _h: number;

    /**
     * The position of the rt piece
     */
    private _rtPosition: number[];

    /**
     * The position of the lt piece
     */
    private _ltPosition: number[];

    /**
     * The position of the rb piece
     */
    private _rbPosition: number[];

    /**
     * The position of the lb piece
     */
    private _lbPosition: number[];

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Constructor of a center board component
     * @param width number
     * @param height  number
     */
    constructor(width, height) {
        super();
        this._w = width;
        this._h = height;

        this._init();
        this.addChild(this._boardSquare);
    }

    /**
     * Initialize component
     */
    private _init() {
        this._boardSquare = new BoardSquare('', '0x000000');

        this._onPieceRefresh();
    }

    /**
     * Subscribe to the context and listens for changes to the pieces state
     */
    private _onPieceRefresh() {
        const subscription = gameService.subscribe((state) => {
            if (state.matches('announce') || state.matches('game_over') || state.context.player.lives <= 0) {
                if (this._currentPiece && !this._currentPiece.destroyed) {
                    this._currentPiece.destroy();
                    this._currentPiece = undefined;
                }
                return;
            }

            if (!state.matches('idle')) {
                return;
            }

            this._createCurrentPiece(state.context.piece.part, state.context.piece.color.toString());
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    /**
     * Create piece that is displayed in a center of the board
     * @param part 2 letters string that represents the part of the octi
     * @param color number [0 - 3] that represents the color of a piece
     */
    private _createCurrentPiece(part, color) {
        if (this._currentPiece !== undefined && !this._currentPiece.destroyed) {
            this._currentPiece.destroy();
        }
        this._currentPiece = new Piece('CurrentPiece', part, color);

        const position = this._positionPieceOnBoard(part);
        this._currentPiece.x = position[0];
        this._currentPiece.y = position[1];

        this._boardSquare.addChild(this._currentPiece);
    }

    /**
     * Positions given piece on the center board
     * based on the part of the octi
     * @param part part of the octi
     * @returns array of x and y position in number
     */
    private _positionPieceOnBoard(part) {
        this._rtPosition = [config.config.octiPartPositionOnBoard, -config.config.octiPartPositionOnBoard];
        this._ltPosition = [-config.config.octiPartPositionOnBoard, -config.config.octiPartPositionOnBoard];
        this._rbPosition = [config.config.octiPartPositionOnBoard, config.config.octiPartPositionOnBoard];
        this._lbPosition = [-config.config.octiPartPositionOnBoard, config.config.octiPartPositionOnBoard];

        return this[`_${part}Position`];
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        super.destroy(options);
    }
}
