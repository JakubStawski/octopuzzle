import * as PIXI from 'pixi.js';
import config from '../config.json';

/**
 * Component that displays single piece
 */
export default class Piece extends PIXI.Container {
    /**
     * 2 letters string that represents the part of the piece
     * (eg. 'lt' means left top as the first letters suggests)
     */
    private _part: string;

    /**
     * color number, colors.json file indicates
     * the color text value based on number
     */
    private _color: number;

    /**
     * color number, colors.json file indicates
     * the color text value based on number
     */
    private _colorString: string;

    /**
     * octi pixi sprite
     */
    private _octiSprite: PIXI.Sprite;

    /**
     *  Contructor for piece component
     * @param name name that displays in debugger
     * @param part two letters string that determines which part of the octi is that
     * @param color number [0 - 3] that determines the color of the piece
     */
    constructor(name: string, part: string, color) {
        super();
        this.name = name;
        this._part = part;

        this._interpretColor(color);
        this._init();
    }

    /**
     * Init component
     */
    private _init() {
        this._createSprite();
    }

    /**
     * Interpret number using colors.json file
     * @param color color number [0 - 3]
     */
    private _interpretColor(color) {
        this._colorString = config.colors[color.toString()];
    }

    /**
     * Method that creates a sprite of an arrow (piece)
     *
     */
    private _createSprite() {
        this._octiSprite = PIXI.Sprite.from(PIXI.Assets.cache.get(`${this._colorString}-${this._part}`));

        this._octiSprite.width = config.config.octiWidth;
        this._octiSprite.height = config.config.octiHeight;
        this._octiSprite.anchor.set(0.5, 0.5);

        this.addChild(this._octiSprite);
    }
}
