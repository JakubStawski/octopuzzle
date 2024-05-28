import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { gameService } from '../../state/stateMachine';

/**
 * Timer components that shows the player how many time one has left
 */
export default class Timer extends PIXI.Container {
    /**
     * Pixi graphics of the components border
     */
    private _timerContainer: PIXI.Graphics;

    /**
     * Pixi graphics of a progress bar
     */
    private _timerProgressBar: PIXI.Graphics;

    /**
     * width of the rectangle
     */
    private _w: number;

    /**
     * height of the rectangle
     */
    private _h: number;

    /**
     * Constructor of a component
     */
    constructor(width: number, height: number) {
        super();
        this._w = width;
        this._h = height;

        this._init();
    }

    /**
     * Init component
     */
    private _init() {
        this._createTimerContainer();
        this._createProgressbar();

        this._onTimeChange();
    }

    /**
     * Create Pixi graphics of the components border
     */
    private _createTimerContainer() {
        this._timerContainer = new PIXI.Graphics();
        this._timerContainer.pivot.set(0.5);
        this._timerContainer.beginFill(0x23061a);
        this._timerContainer.drawRect(0, 0, this._w, this._h);
        this._timerContainer.y = -this._h;

        // this._createShadow();
        this.addChild(this._timerContainer);
    }

    /**
     * Pixi graphics of a progress bar
     */
    private _createProgressbar() {
        this._timerProgressBar = new PIXI.Graphics();
        this._timerProgressBar.beginFill('0xfc2eb6');
        this._timerProgressBar.drawRect(0, 0, this._timerContainer.width, this._timerContainer.height);
        this._timerProgressBar.pivot.x = 0.5;
        this._timerProgressBar.pivot.y = 0.5;

        this._timerProgressBar.x = 0;
        this._timerProgressBar.y = 0;

        this._timerContainer.addChild(this._timerProgressBar);
    }

    /**
     * Subscribe for the state, listen to changes and add animation
     * that will show the player how much time one has left
     */
    private _onTimeChange() {
        gameService.subscribe((state) => {
            this._handleAnnouncement(state);
            if (state.event.type === 'START' || state.event.type === 'CONTINUE') {
                gsap.fromTo(
                    this._timerProgressBar,
                    {
                        width: this._timerContainer.width,
                    },
                    {
                        width: 0,
                        duration: state.context.player.timeoutID.getTimeLeft() / 1000,
                        ease: 'none',
                    },
                );
            }
        });
    }

    /**
     * Thing that happen after announcement state is set
     * @param state current game state
     */
    private _handleAnnouncement(state) {
        if (state.context.player.lives < 0) {
            this._timerProgressBar.visible = false;
        }

        if (state.value !== 'announce' && state.context.player.lives >= 0) {
            this._timerProgressBar.visible = true;
            return;
        }

        this._timerProgressBar.visible = false;
    }
}
