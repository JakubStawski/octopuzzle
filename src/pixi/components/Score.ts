import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { gameService } from '../../state/stateMachine';

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
    private _scoreTitle: PIXI.Text;

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
        this._createScoreText();

        this._onScoreChange();
    }

    /**
     * Create both the title and actual score number based on initial context of the state
     */
    private _createScoreText() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Alien Encounters Regular',
            lineJoin: 'round',
            fontSize: 40,
            fill: '0xffffff',
        });

        const textStyleSmall = new PIXI.TextStyle({
            fontFamily: 'Alien Encounters Regular',
            lineJoin: 'round',
            fontSize: 20,
            fill: '0xffffff',
        });

        this._scoreTitle = new PIXI.Text('Score:', textStyleSmall);
        this._scoreText = new PIXI.Text('0', textStyle);

        this._scoreTitle.anchor.set(0, 0.5);
        this._scoreText.anchor.set(0, 0.5);

        this._scoreText.x = this._scoreTitle.width + 20;

        this.addChild(this._scoreText);
        this.addChild(this._scoreTitle);
    }

    /**
     * Subscribes the state, listens for changes
     * and sets previously created text to value based on state
     */
    private _onScoreChange() {
        gameService.subscribe((state) => {
            if (state.event.type === 'COMPLETED' || state.event.type === 'CONTINUE') {
                this._scoreText.text = state.context.player.score;

            }
        });
    }
}
