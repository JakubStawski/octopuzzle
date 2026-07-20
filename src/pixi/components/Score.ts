import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';

import config from '../config.json';

/**
 * Component that displays players score
 */
export default class Score extends PIXI.Container {
    /**
     * PIXI text component which is set to show actual score
     */
    private _scoreText: PIXI.Text;

    /**
     * PIXI text component which is set to show score title
     */
    private _scoreIcon: PIXI.Sprite;

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Active count-up animation frame
     */
    private _rafId: number | null = null;

    /**
     * Constructor of the component
     */
    constructor() {
        super();

        this._init();
    }

    /**
     * Init component
     */
    private _init() {
        this._createScoreIcon();
        this._createScoreText();

        this._onScoreChange();
    }

    /**
     * Create score number based on initial context of the state
     */
    private _createScoreText() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 66,
            fill: '0xffffff',
        });

        this._scoreText = new PIXI.Text(0, textStyle);
        this._scoreText.anchor.set(0, 0.5);

        this._scoreText.x = this._scoreIcon.width;

        this.addChild(this._scoreText);
    }

    /**
     * Creates score star icon
     */
    private _createScoreIcon() {
        this._scoreIcon = new PIXI.Sprite(PIXI.Assets.cache.get('star'));
        this._scoreIcon.width = config.config.scoreIconWidth;
        this._scoreIcon.height = config.config.scoreIconHeight;

        this._scoreIcon.anchor.set(0.5, 0.5);
        this._scoreIcon.y = 0;

        this._scoreIcon.x = 0;
        this.addChild(this._scoreIcon);
    }

    private _cancelCountUp() {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    /**
     * Subscribes the state, listens for changes
     * and sets previously created text to value based on state
     */
    private _onScoreChange() {
        const subscription = gameService.subscribe((state) => {
            const displayed = parseInt(this._scoreText.text, 10) || 0;
            const target = state.context.player.score;

            if (state.matches('main_screen') || state.event.type === 'START') {
                this._cancelCountUp();
                this._scoreText.text = target;
                return;
            }

            if (target > displayed && (state.matches('idle') || state.matches('add_score'))) {
                this._cancelCountUp();

                let points = displayed;
                let start: number;
                const duration = 1000;

                const countUp = (timestamp: number) => {
                    if (this.destroyed) {
                        return;
                    }

                    if (!start) start = timestamp;

                    const elapsed = (timestamp - start) / duration;
                    this._scoreText.text = points;
                    if (points >= target) {
                        this._scoreText.text = target;
                        this._rafId = null;
                        return;
                    }
                    points += Math.ceil(elapsed * (target - points));
                    this._rafId = requestAnimationFrame(countUp);
                };
                this._rafId = requestAnimationFrame(countUp);
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        this._cancelCountUp();
        super.destroy(options);
    }
}
