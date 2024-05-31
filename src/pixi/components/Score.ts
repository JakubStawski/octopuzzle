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

    /**
     * Subscribes the state, listens for changes
     * and sets previously created text to value based on state
     */
    private _onScoreChange() {
        gameService.subscribe((state) => {
            if (state.event.type === 'COMPLETED' || state.event.type === 'CONTINUE') {
                let points = parseInt(this._scoreText.text, 10);
                let start: number;
                const duration = 1000;
                const countUp = (timestamp: number) => {
                    if (!start) start = timestamp;

                    const elapsed = (timestamp - start) / duration;
                    this._scoreText.text = points;
                    if (points >= state.context.player.score) return;
                    points += Math.ceil(elapsed * (state.context.player.score - points));
                    requestAnimationFrame(countUp);
                };
                requestAnimationFrame(countUp);
            }
        });
    }
}
