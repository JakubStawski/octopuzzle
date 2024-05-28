import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { gameService } from '../../state/stateMachine';

/**
 * Component that displays players lives
 */
export default class Lives extends PIXI.Container {
    /**
     * Lives icons container
     */
    private _livesIconsContainer: PIXI.Container;

    constructor() {
        super();

        this._init();
    }

    private _init() {
        this._createLivesIcons();
        this._onLivesChange();
    }

    /**
     * Creates PIXI Text component,
     * sets title and number of lives left based context of the state
     */
    private _createLivesIcons() {
        this._livesIconsContainer = new PIXI.Container();
        

        for (let i = 0; i < gameService.initialState.context.player.lives; i += 1) {
            const heartIcon = new PIXI.Sprite(PIXI.Assets.cache.get('heart-icon'));
            heartIcon.width = 40;
            heartIcon.height = 40;

            heartIcon.anchor.set(0.5, 0.5);
            heartIcon.y = 0;

            heartIcon.x = i * (heartIcon.width + 5);
            this._livesIconsContainer.addChild(heartIcon);
        }

        this.addChild(this._livesIconsContainer);
    }

    /**
     * Subscribes the state, listens for changes
     * and sets previously created text to value based on state
     */
    private _onLivesChange() {
        gameService.subscribe((state) => {
            if (state.event.type === 'WRONG_CHOICE' || state.event.type === 'TIMEOUT') {
                if (state.context.player.lives - 1 >= 0) {
                    gsap.to(this._livesIconsContainer.children[state.context.player.lives - 1], {
                        pixi: {
                            alpha: 0.2,
                        },
                        duration: 0.2,
                        delay: 1,
                        ease: 'slow'
                    });
                }
            }
        });
    }
}
