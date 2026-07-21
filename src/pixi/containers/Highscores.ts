import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import { loadHighScoreBoard } from '../../engine/game';
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
     * main menu button instance
     */
    private _mainMenuButton: PIXI.Container;

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

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
        this._createTitle();
        this._createHighcoresContainer();

        this._subscribeEvents();
        this._createTableHeader();

        this._createMainMenuButton();
        this._addButtons();
    }

    private _createTitle() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 100,
            fill: '0xffffff',
            stroke: '0x000000',
            strokeThickness: 16,
        });

        const title = new PIXI.Text('Highscores', textStyle);
        title.anchor.set(0.5, 1);
        title.y = -this._background.height / 2 + 55;
        this.addChild(title);
    }

    private _createMainMenuButton() {
        this._mainMenuButton = new Button(() => {
            gameService.send({ type: 'MAIN_MENU' });
        }, 'Main Menu');
        this._mainMenuButton.x = this.width / 2 - this._mainMenuButton.width - 80;
        this._mainMenuButton.y = this.height / 2 - this._mainMenuButton.height - 80;
    }

    private _createTableHeader() {
        this._highscoresHeader = new PIXI.Container();
        this._highscoresHeader.x = -this.width / 2 + 80;
        this._highscoresHeader.y = -this.height / 2 + 120;

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

    private _createRecord(element: IHighscoresBoard, index: number, highlight = false) {
        const recordContainer = new PIXI.Container();

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 50,
            fill: highlight ? 0xffffff : 0xecda81,
            stroke: highlight ? 0x5a4a00 : 0x987800,
            strokeThickness: highlight ? 6 : 5,
        });

        const position = new PIXI.Text(`${index + 1}.`, textStyle);
        position.x = 0;
        recordContainer.addChild(position);

        const score = new PIXI.Text(`${element.score}`, textStyle);
        score.anchor.set(0, 0.5);
        score.y = config.config.highscoresRecordHeight / 2;
        score.x = config.config.highscoresMedalWidth + 200;
        recordContainer.addChild(score);

        const date = new PIXI.Text(`${element.date}`, textStyle);
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

    private _subscribeEvents() {
        const subscription = gameService.subscribe((state) => {
            const shouldRefresh =
                (state.matches('game_over') && state.event.type === 'GAME_OVER') ||
                (state.matches('high_scores') && state.event.type === 'HIGH_SCORES');

            if (shouldRefresh) {
                this._refreshHighscores();
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    private _refreshHighscores() {
        [...this._highscoresContainer.children].forEach((element) => {
            element.destroy();
        });

        this._createHighscores();
    }

    private _createHighcoresContainer() {
        this._highscoresContainer = new PIXI.Container();

        this._highscoresContainer.x = -this.width / 2 + 80;
        this._highscoresContainer.y = -this.height / 2 + 220;

        this.addChild(this._highscoresContainer);
    }

    private _createHighscores() {
        this._highscoresBoard = loadHighScoreBoard();

        if (!this._highscoresBoard.length) return;

        const lastId = Number(localStorage.getItem('lastHighscoreId') || 0);

        this._highscoresBoard.forEach((element, index) => {
            const highlight = !!element.id && element.id === lastId;
            const record = this._createRecord(element, index, highlight);
            record.y = index * config.config.highscoresRecordHeight;
            this._highscoresContainer.addChild(record);
        });
    }

    private _addButtons() {
        if (this._mainMenuButton) this.addChild(this._mainMenuButton);

        this._mainMenuButton.name = 'Button_MainMenu';
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        super.destroy(options);
    }
}
