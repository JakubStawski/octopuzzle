import * as PIXI from 'pixi.js';

import Button from '../components/Button';
import { gameService } from '../../state/stateMachine';

/**
 * Credits screen — same panel background as highscores
 */
export default class Credits extends PIXI.Container {
    private _background: PIXI.Sprite;

    private _title: PIXI.Text;

    private _body: PIXI.Text;

    private _mainMenuButton: PIXI.Container;

    constructor() {
        super();
        this.name = 'Credits';
        this._init();
    }

    private _init() {
        this._createBackground();
        this._createTitle();
        this._createBody();
        this._createMainMenuButton();
        this.visible = false;
    }

    private _createBackground() {
        this._background = new PIXI.Sprite(PIXI.Assets.cache.get('highscores'));
        this._background.anchor.set(0.5, 0.5);
        this.addChild(this._background);
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

        this._title = new PIXI.Text('Credits', textStyle);
        this._title.anchor.set(0.5, 1);
        this._title.y = -this._background.height / 2 + 55;
        this.addChild(this._title);
    }

    private _createBody() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 42,
            fill: '0xecda81',
            strokeThickness: 4,
            stroke: '0x987800',
            align: 'center',
            lineHeight: 56,
        });

        this._body = new PIXI.Text('Octo`puzzle\nby Jakub Stawski\n\nMade with PixiJS & XState', textStyle);
        this._body.anchor.set(0.5, 0.5);
        this._body.y = -20;
        this.addChild(this._body);
    }

    private _createMainMenuButton() {
        this._mainMenuButton = new Button(() => {
            gameService.send({ type: 'MAIN_MENU' });
        }, 'Main Menu');
        this._mainMenuButton.x = this.width / 2 - this._mainMenuButton.width - 80;
        this._mainMenuButton.y = this.height / 2 - this._mainMenuButton.height - 80;
        this.addChild(this._mainMenuButton);
    }
}
