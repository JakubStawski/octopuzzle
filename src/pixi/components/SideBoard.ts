import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';
import { BoardSingleSide } from '../../state/types';
import BoardSquare from './BoardSquare';
import Piece from './Piece';
import { gameService } from '../../state/stateMachine';
import config from '../config.json';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

/**
 * The side board component, that's the place
 * where all parts of the one octi is stored
 */
export default class SideBoard extends PIXI.Container {
    /**
     * Side board square
     */
    private _boardSquare: PIXI.Container;

    /**
     * Which side this component represents (eg. 'top', 'left')
     */
    private _side: string;

    /**
     * Left top piece component
     */
    private _lt?: Piece;

    /**
     * Left bottom piece component
     */
    private _lb?: Piece;

    /**
     * Right top piece component
     */
    private _rt?: Piece;

    /**
     * Right bottom piece component
     */
    private _rb?: Piece;

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
     * Container for all pieces on matrix
     */
    private _piecesContainer: PIXI.Container;

    /**
     * Current visible pieces matrix
     */
    private _currentMatrix: BoardSingleSide;

    /**
     * width
     */
    private _w: number;

    /**
     * height
     */
    private _h: number;

    /**
     * Constructor of a side board component
     * @param name name displayed in a debugger
     * @param width number
     * @param height number
     */
    constructor(name) {
        super();
        this.name = `${name}Board`;
        this._side = name;

        this._currentMatrix = {};

        this._init();
        this.addChild(this._boardSquare);
    }

    /**
     * Init component
     */
    private _init() {
        this._boardSquare = new BoardSquare('', '0x000000');
        this._createPiecesContainer();

        this._onBoardRefresh();
    }

    /**
     * Subscribe to the context and listens for changes in state
     */
    private _onBoardRefresh() {
        gameService.subscribe((state) => {
            if (state.event.type === 'CHOICE' && state.event.value === this._side) {
                this._createCurrentPieceMatrix(state.context.board);
            }

            if (state.event.type === 'COMPLETED' && state.event.value === this._side) {
                this.animateCompletedOcti();
            }

            if (state.event.type === 'CLEAR' && state.event.value === this._side) {
                this._checkIfMatrixIsEmpty();
            }

            if (state.event.type === 'RIGHT_CHOICE' && state.event.value === this._side) {
                this._createPieceForMatrix(state.context.piece);
            }
        });
    }

    /**
     * Creates container for the pieces to be stored in
     * adds component to parent container
     */
    private _createPiecesContainer() {
        this._piecesContainer = new PIXI.Container();

        this._boardSquare.addChild(this._piecesContainer);
    }

    /**
     * Creates matrix based on the current board object
     * @param board object that contains info about
     * the current pieces position in it
     */
    private _createCurrentPieceMatrix(board) {
        this._currentMatrix = board[this._side];
    }

    /**
     * Creates Piece to be stored in side board and places it in the right position
     * @param piece object from states context
     */
    private _createPieceForMatrix(piece) {
        this[`_${piece.part}`] = new Piece(`PiecePart_${piece.part}`, piece.part, piece.color);

        const position = this._positionPieceOnBoard(piece.part);
        this[`_${piece.part}`].x = position[0];
        this[`_${piece.part}`].y = position[1];

        this._piecesContainer.addChild(this[`_${piece.part}`]);
    }

    /**
     * Check if the side board matrix has been completed
     */
    private _checkIfMatrixIsEmpty() {
        const isFullMatrix = Object.entries(this._currentMatrix).length === 4;

        if (isFullMatrix) {
            this._piecesContainer.destroy();
            this._createPiecesContainer();
        }
    }

    /**
     * Positions given piece on the side board
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

    /**
     * Animate completed octi
     */
    private animateCompletedOcti() {
        for (let i = 0; i < this._piecesContainer.children.length; i += 1) {
            gsap.to(this._piecesContainer.children[i], {
                pixi: {
                    scale: 0.3,
                    alpha: 0,
                },
                duration: 0.2,
                delay: 1 + i * 0.05,
                ease: 'bounce.out',
            });
        }
    }
}
