import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import { IHighscoresBoard } from '../types';
import config from '../config.json';
import Button from '../components/Button';

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
     * highscores header
     */
    private _highscoresHeader: PIXI.Container;

    /**
     * button instance
     */
    private _playAgainButton: PIXI.Container;

    /**
     * Creator for CreditsCounter
     * @param name container name
     * @param label the component title
     */
    constructor(button: PIXI.Container) {
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
        this._createTableHeader();
        this._createPlayAgainButton();
        this._addButton();
    }

    private _createPlayAgainButton() {
        this._playAgainButton = new Button(() => gameService.send({ type: 'CONTINUE' }), 'Play again');
        this._playAgainButton.x = this.width / 2 - this._playAgainButton.width - 80;
        this._playAgainButton.y = this.height / 2 - this._playAgainButton.height - 80;
    }

    private _createTableHeader() {
        this._highscoresHeader = new PIXI.Container();
        this._highscoresHeader.x = -this.width / 2 + 80;
        this._highscoresHeader.y = -this.height / 2 + 60;

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 50,
            fill: '0xecda81',
            stroke: '0x987800',
            strokeThickness: 5,
        });

        const position = new PIXI.Text('Position', textStyle);
        position.x = 0;

        const score = new PIXI.Text('Score', textStyle);
        score.x = 275;

        const date = new PIXI.Text('Date', textStyle);
        date.x = 575;

        const separator = new PIXI.Graphics();
        separator
            .beginFill(0xecda81)
            .drawRect(0, 70, this.width - 160, 3)
            .endFill();

        this._highscoresHeader.addChild(position, score, date, separator);
        this.addChild(this._highscoresHeader);
    }

    private _createRecord(element, index) {
        const recordContainer = new PIXI.Container();

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 50,
            fill: '0xecda81',
            stroke: '0x987800',
            strokeThickness: 5,
        });

        // const medals = ['gold', 'silver', 'bronze'];

        // const medal = new PIXI.Sprite(PIXI.Assets.cache.get(`${medals[index]}-medal`));
        // medal.anchor.set(0, 0.5);
        // medal.y = config.config.highscoresRecordHeight / 2;
        // recordContainer.addChild(medal);

        const position = new PIXI.Text(`${index + 1}.`, textStyle);
        position.x = 0;
        recordContainer.addChild(position);

        const score = new PIXI.Text(`${element.score}`, textStyle);
        score.anchor.set(0, 0.5);
        score.y = config.config.highscoresRecordHeight / 2;
        score.x = config.config.highscoresMedalWidth + 200;
        recordContainer.addChild(score);

        const date = new PIXI.Text(`${element.date + 1}.`, textStyle);
        date.anchor.set(0, 0.5);
        date.y = config.config.highscoresRecordHeight / 2;
        date.x = config.config.highscoresMedalWidth + 500;
        recordContainer.addChild(date);

        return recordContainer;
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
        this._highscoresContainer.y = -this.height / 2 + 160;

        this.addChild(this._highscoresContainer);
    }

    private _createHighscores() {
        this._highscoresBoard = JSON.parse(localStorage.getItem('highScoreBoard'));

        if (!this._highscoresBoard) return;

        this._highscoresBoard.forEach((element, index) => {
            const record = this._createRecord(element, index);
            record.y = index * config.config.highscoresRecordHeight;
            this._highscoresContainer.addChild(record);
        });
    }

    private _addButton() {
        if (this._playAgainButton) this.addChild(this._playAgainButton);
        this._playAgainButton.name = 'Button';
    }
}
