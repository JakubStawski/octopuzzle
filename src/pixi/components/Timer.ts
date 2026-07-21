import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';

import config from '../config.json';
import { animateOnTicker } from '../utils/animateOnTicker';

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
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Cancel active progress animation
     */
    private _cancelAnim: (() => void) | null = null;

    /**
     * Progress snapshot used when pausing on blur
     */
    private _pausedProgressRatio: number | null = null;

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

    private _cancelProgressAnimation() {
        this._cancelAnim?.();
        this._cancelAnim = null;
    }

    private _startProgressAnimation(durationMs: number, fromFullWidth = true) {
        this._cancelProgressAnimation();

        if (!fromFullWidth && this._pausedProgressRatio !== null) {
            this._timerProgressBar.width = this._timerContainer.width * this._pausedProgressRatio;
        } else {
            this._timerProgressBar.width = this._timerContainer.width;
        }

        const startWidth = this._timerProgressBar.width;
        const fullWidth = this._timerContainer.width;
        const remainingRatio = startWidth / fullWidth;
        const totalDuration = durationMs * remainingRatio;
        let elapsed = 0;

        this._cancelAnim = animateOnTicker((deltaMS) => {
            if (this.destroyed) {
                this._cancelAnim = null;
                return true;
            }

            elapsed += deltaMS;
            this._timerProgressBar.width = startWidth * (1 - elapsed / totalDuration);

            if (this._timerProgressBar.width <= 0) {
                this._timerProgressBar.width = 0;
                this._cancelAnim = null;
                return true;
            }
            return false;
        });
        this._pausedProgressRatio = null;
    }

    /**
     * Subscribe for the state, listen to changes and add animation
     * that will show the player how much time one has left
     */
    private _onTimeChange() {
        const subscription = gameService.subscribe((state) => {
            this._handleAnnouncement(state);

            if (state.event.type === 'BLUR') {
                if (this._timerContainer.width > 0) {
                    this._pausedProgressRatio = this._timerProgressBar.width / this._timerContainer.width;
                }
                this._cancelProgressAnimation();
                return;
            }

            if (state.event.type === 'FOCUS' && state.matches('idle') && state.context.player.timeoutID) {
                this._startProgressAnimation(state.context.player.timeoutID.getTimeLeft(), false);
                return;
            }

            // After countdown, XState keeps the delayed event (`xstate.after(...)`), not `done.*`.
            // Start the bar whenever we freshly enter idle (CONTINUE, countdown→idle, etc.).
            if (state.matches('idle') && state.context.player.timeoutID) {
                const justEnteredIdle =
                    Boolean(state.changed) &&
                    state.history != null &&
                    !state.history.matches('idle');
                if (justEnteredIdle) {
                    this._startProgressAnimation(state.context.player.timeoutID.getTimeLeft(), true);
                }
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    /**
     * Thing that happen after announcement state is set
     * @param state current game state
     */
    private _handleAnnouncement(state) {
        if (state.context.player.lives <= 0) {
            this._timerProgressBar.visible = false;
            return;
        }

        if (state.matches('announce') || state.matches('countdown')) {
            this._timerProgressBar.visible = false;
            return;
        }

        this._timerProgressBar.visible = true;
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        this._cancelProgressAnimation();
        super.destroy(options);
    }
}
