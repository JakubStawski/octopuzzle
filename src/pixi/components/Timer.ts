import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { gameService } from '../../state/stateMachine';

import config from '../config.json';

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
     * Pixi sprite for timer
     */
    private _timerSprite: PIXI.Sprite;

    /**
     * Constructor of a component
     */
    constructor() {
        super();

        this._init();
    }

    /**
     * Init component
     */
    private _init() {
        this._createTimerSprite();
        this._createTimerContainer();
        this._createProgressbar();

        this.addChild(this._timerContainer);
        this.addChild(this._timerSprite);

        this._onTimeChange();
    }

    private _createTimerSprite() {
        this._timerSprite = new PIXI.Sprite(PIXI.Assets.cache.get('timer'));
        this._timerSprite.width = config.config.timerWidth;
        this._timerSprite.height = config.config.timerHeight;

        // this._timerSprite.blendMode = PIXI.BLEND_MODES.LIGHTEN;

        this._timerSprite.anchor.set(0.5, 0.5);
        this._timerSprite.y =
            -config.config.frameHeight * 1.5 +
            this._timerSprite.height +
            config.config.healthIconHeight +
            config.config.scoreIconHeight +
            2 * config.config.playerStatusGap;

        this._timerSprite.x = config.config.frameWidth + config.config.gameBoardGap;
    }

    /**
     * Create Pixi graphics of the components border
     */
    private _createTimerContainer() {
        this._timerContainer = new PIXI.Graphics();
        this._timerContainer.beginFill(0xffffff);
        this._timerContainer.drawRect(0, 0, config.config.timerWidth - 90, config.config.timerHeight - 30);
        this._timerContainer.y =
            -config.config.frameHeight * 1.5 +
            this._timerSprite.height +
            config.config.healthIconHeight +
            config.config.scoreIconHeight +
            2 * config.config.playerStatusGap -
            this._timerContainer.height / 2;

        this._timerContainer.x =
            config.config.frameWidth + config.config.gameBoardGap - this._timerContainer.width / 2 + 30;

        // this._createShadow();
    }

    /**
     * Pixi graphics of a progress bar
     */
    private _createProgressbar() {
        this._timerProgressBar = new PIXI.Graphics();
        this._timerProgressBar.beginFill('0x76d000');
        this._timerProgressBar.drawRect(0, 0, this._timerContainer.width - 120, this._timerContainer.height);

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
