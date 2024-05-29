import * as PIXI from 'pixi.js';

import Score from '../components/Score';
import Timer from '../components/Timer';
import Announcement from '../components/Announcement';

/**
 * Player Panel PIXI Component, a container for lives and score
 */
export default class PlayerPanel extends PIXI.Container {
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
     * Timer component
     */
    private _timer: PIXI.Container;

    /**
     * Announcement component
     */
    private _announcement;

    /**
     * Creator for CreditsCounter
     * @param name container name
     * @param label the component title
     */
    constructor(name: string, background: string, width: number, height: number) {
        super();
        this._background = background;
        this.name = name;

        this._w = width;
        this._h = height;

        this._init();
    }

    /**
     * initialize container for components
     */
    private _init() {
        this._createRectangle();
        // this._createLives();
        // this._createScore();
        this._createTimer();
        this._createAnnouncement();
    }

    private _createAnnouncement() {
        this._announcement = new Announcement();
        this._announcement.x = 0;

        this.addChild(this._announcement);
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
        this._rectangle.beginFill(this._background, 0.85);

        this._rectangle.drawRect(0, 0, this._w, this._h);
        this._rectangle.pivot.x = this._rectangle.width / 2;
        this._rectangle.pivot.y = this._rectangle.height / 2;

        this._rectangle.x = 0;
        this._rectangle.y = 0;

        // this._createShadow();

        this.addChild(this._rectangle);
    }

    /**
     * Create timer that represents how much time player has left for decision
     */
    private _createTimer() {
        this._timer = new Timer(this._w, 6);
        this._timer.x = -this._w / 2;
        this._timer.y = this._h / 2 + 6;

        this.addChild(this._timer);
    }

    /**
     * creates score display
     */
    private _createScore() {
        this._scoreBoard = new Score();
        this._scoreBoard.x = -this._w / 2 + this._scoreBoard.width / 4;

        this.addChild(this._scoreBoard);
    }
}
