import * as PIXI from 'pixi.js';
import display from '@pixi/display';
import config from '../config.json';

/**
 * Board color square PIXI Component, a container for pieces
 */
export default class BoardSquare extends PIXI.Container {
    /**
     * Background of the component
     */
    private _background: string;

    /**
     * width of the rectangle
     */
    private _w: number;

    /**
     * height of the rectangle
     */
    private _h: number;

    /**
     * Rectangle
     */
    private _rectangle: PIXI.Graphics;

    /**
     * Frame sprite
     */
    private _frame: PIXI.Sprite;

    /**
     * Creator for CreditsCounter
     * @param name container name
     * @param label the component title
     */
    constructor(name: string, background: string) {
        super();
        this._background = background;
        this.name = name;

        this.sortableChildren = true;

        this._createFrame();
        this._createRectangle();

        this.addChild(this._rectangle);
        this.addChild(this._frame);
    }

    /**
     * Method that creates rectangle with set width and height,
     * setting the name, the pivot of the component
     * and fills that with given color
     */
    private _createRectangle() {
        this._rectangle = new PIXI.Graphics();
        this._rectangle.name = `${this.name}_Graphics;`;
        this._rectangle.visible = true;

        this._rectangle.beginFill(this._background, 0.75);

        this._rectangle.drawRect(
            -config.config.octiWidth,
            -config.config.octiHeight,
            config.config.octiWidth * 2,
            config.config.octiHeight * 2,
        );
    }

    /**
     * Creates drop shadow filter
     */
    private _createFrame() {
        this._frame = new PIXI.Sprite(PIXI.Assets.cache.get('frame'));
        this._frame.anchor.set(0.5);
    }
}
