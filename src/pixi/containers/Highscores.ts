import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import { IHighscoresBoard } from '../types';

/**
 * Highscores PIXI Component
 */
export default class Highscores extends PIXI.Container {
    /**
     * Background of the component
     */
    private _background: PIXI.Sprite;

    /**
     * highscores array from local storage
     */
    private _highscoresBoard: IHighscoresBoard[];

    /**
     * container for text elements
     */
    private _highscoresContainer: PIXI.Container;

    /**
     *
     */

    /**
     * Creator for CreditsCounter
     * @param name container name
     * @param label the component title
     */
    constructor() {
        super();
        this.name = 'Highscores_Board';

        this._init();
    }

    /**
     * initialize container for components
     */
    private _init() {
        this._createHighscoresBackground();
        this._createHighcoresContainer();

        this._listenToGameOver();
    }

    private _createHighscoresBackground() {
        this._background = new PIXI.Sprite(PIXI.Assets.cache.get('highscores'));
        this._background.anchor.set(0.5, 0.5);

        this.addChild(this._background);
    }

    private _listenToGameOver() {
        gameService.subscribe((state) => {
            if (state.event.type === 'GAME_OVER') {
                this._highscoresContainer.children.forEach((element) => {
                    element.destroy();
                });

                this._createHighscores();
            }
        });
    }

    private _createHighcoresContainer() {
        this._highscoresContainer = new PIXI.Container();

        this._highscoresContainer.x = -this.width / 2 + 80;
        this._highscoresContainer.y = -this.height / 2 + 80;

        this.addChild(this._highscoresContainer);
    }

    private _createHighscores() {
        this._highscoresBoard = JSON.parse(localStorage.getItem('highScoreBoard'));

        if (!this._highscoresBoard) return;

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 60,
            fill: '0x000000',
        });

        this._highscoresBoard.forEach((element, index) => {
            const scoreBoardItem = new PIXI.Text(`${element.score} - ${element.date}`, textStyle);
            scoreBoardItem.y += index * (scoreBoardItem.height + 10);
            this._highscoresContainer.addChild(scoreBoardItem);
        });
    }
}
