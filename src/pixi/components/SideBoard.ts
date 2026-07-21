import * as PIXI from 'pixi.js';
import { BoardSingleSide } from '../../state/types';
import BoardSquare from './BoardSquare';
import Piece from './Piece';
import { gameService } from '../../state/stateMachine';
import { getCompletionPoints } from '../../engine/game';
import config from '../config.json';
import { animateOnTicker, playPopIn } from '../utils/animateOnTicker';

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
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Pending completion animation timeouts
     */
    private _animationTimeouts: ReturnType<typeof setTimeout>[] = [];

    /**
     * Cancel functions for active ticker animations
     */
    private _animationCancels: (() => void)[] = [];

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
        const subscription = gameService.subscribe((state) => {
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
                this._createCurrentPieceMatrix(state.context.board);
                this._createPieceForMatrix(state.context.piece);
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
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
        this._animationCancels.push(playPopIn(this[`_${piece.part}`], { duration: 220, fromScale: 0.4 }));
    }

    /**
     * Check if the side board matrix has been completed
     */
    private _checkIfMatrixIsEmpty() {
        const isFullMatrix = Object.entries(this._currentMatrix).length === 4;

        if (isFullMatrix) {
            this._cancelCompletionAnimation();
            this._piecesContainer.destroy({ children: true });
            this._createPiecesContainer();
            this._currentMatrix = {};
            this._lt = undefined;
            this._lb = undefined;
            this._rt = undefined;
            this._rb = undefined;
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

    private _cancelCompletionAnimation() {
        this._animationTimeouts.forEach((id) => clearTimeout(id));
        this._animationTimeouts = [];
        this._animationCancels.forEach((cancel) => cancel());
        this._animationCancels = [];
    }

    private _playPointsPopup(points: number) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 56,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 8,
            align: 'center',
        });

        const label = new PIXI.Text(`+${points}`, textStyle);
        label.anchor.set(0.5, 0.5);
        label.scale.set(0.35);
        label.alpha = 1;
        this._boardSquare.addChild(label);

        const duration = 900;
        const startY = 0;
        let elapsed = 0;

        const cancel = animateOnTicker((deltaMS) => {
            if (this.destroyed || label.destroyed) {
                return true;
            }

            elapsed += deltaMS;
            const t = Math.min(1, elapsed / duration);
            const eased = 1 - (1 - t) ** 2;

            label.scale.set(0.35 + eased * 1.4);
            label.y = startY - eased * 80;
            label.alpha = 1 - t;

            if (t >= 1) {
                label.destroy();
                return true;
            }
            return false;
        });
        this._animationCancels.push(cancel);
    }

    /**
     * Animate completed octi
     */
    private animateCompletedOcti() {
        this._cancelCompletionAnimation();

        // RIGHT_CHOICE may have just started a pop-in (alpha 0); COMPLETED cancels it
        // before fade-in - snap every part fully visible so the last piece isn't missing
        this._piecesContainer.children.forEach((child) => {
            const piece = child as PIXI.DisplayObject & { scale: PIXI.ObservablePoint };
            piece.alpha = 1;
            piece.scale.set(1);
        });

        const boardSide =
            gameService.getSnapshot().context.board[this._side] || this._currentMatrix;
        const points = getCompletionPoints(boardSide);

        for (let i = 0; i < this._piecesContainer.children.length; i += 1) {
            const child = this._piecesContainer.children[i];

            const timeoutId = setTimeout(() => {
                if (i === 0) {
                    this._playPointsPopup(points);
                }

                const cancel = animateOnTicker(() => {
                    if (this.destroyed || !child || child.destroyed || !this._piecesContainer?.children[i]) {
                        return true;
                    }

                    child.alpha -= 0.08;

                    return child.alpha <= 0;
                });
                this._animationCancels.push(cancel);
            }, 1000);
            this._animationTimeouts.push(timeoutId);
        }
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        this._cancelCompletionAnimation();
        super.destroy(options);
    }
}
