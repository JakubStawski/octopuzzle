import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import config from '../config.json';

/**
 * Component that displays players lives
 */
export default class Button extends PIXI.Container {
    /**
     * Button sprite
     */
    private _buttonSprite: PIXI.Sprite;

    /**
     * text of the button
     */
    private _buttonText: PIXI.Text;

    /**
     * button onclick handler
     */
    private _callback: () => void;

    /**
     * text value
     */
    private _label: string;

    /**
     * Buttons icon name, the same as asset sprite name
     */
    private _icon: string;

    constructor(callback: () => void, label: string, icon?: string) {
        super();

        this._callback = callback;
        this._icon = icon;
        this._label = label;
        this._init();
    }

    private _init() {
        this._createButton();
        this._createEvents();
    }

    private _createButton() {
        if (this._icon) {
            this._buttonSprite = new PIXI.Sprite(PIXI.Assets.cache.get(this._icon));
            this._buttonSprite.anchor.set(0.5, 0.5);
            this.addChild(this._buttonSprite);
        }

        if (!this._icon) {
            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Playground',
                lineJoin: 'round',
                fontSize: 48,
                fill: '0xffffff',
                stroke: '0x000000',
                strokeThickness: 7.5,
            });

            this._buttonSprite = new PIXI.Sprite(PIXI.Assets.cache.get('button-long'));
            this._buttonText = new PIXI.Text(this._label, textStyle);
            this._buttonText.anchor.set(0.5, 0.5);

            this._buttonText.x = this._buttonSprite.width / 2;
            this._buttonText.y = this._buttonSprite.height / 2;

            this.addChild(this._buttonSprite, this._buttonText);
        }
    }

    private _createEvents() {
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this._callback);
    }
}
