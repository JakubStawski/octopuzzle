import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';
import config from '../config.json';
import { animateOnTicker } from '../utils/animateOnTicker';

/**
 * Component that displays players lives
 */
export default class Lives extends PIXI.Container {
    /**
     * Lives icons container
     */
    private _livesIconsContainer: PIXI.Container;

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * Cancel active fade animation
     */
    private _cancelAnim: (() => void) | null = null;

    /**
     * Last known lives count for detecting loss
     */
    private _previousLives: number;

    constructor() {
        super();

        this._init();
    }

    private _init() {
        this._previousLives = gameService.getSnapshot().context.player.lives;
        this._createLivesIcons();
        this._onLivesChange();
    }

    /**
     * Creates PIXI Text component,
     * sets title and number of lives left based context of the state
     */
    private _createLivesIcons() {
        this._livesIconsContainer = new PIXI.Container();

        const lives = gameService.getSnapshot().context.player.lives;
        for (let i = 0; i < lives; i += 1) {
            const healthIcon = new PIXI.Sprite(PIXI.Assets.cache.get('health'));
            healthIcon.width = config.config.healthIconWidth;
            healthIcon.height = config.config.healthIconHeight;

            healthIcon.anchor.set(0.5, 0.5);
            healthIcon.y = 0;

            healthIcon.x = i * (healthIcon.width + 5);
            this._livesIconsContainer.addChild(healthIcon);
        }

        this.addChild(this._livesIconsContainer);
    }

    private _cancelFade() {
        this._cancelAnim?.();
        this._cancelAnim = null;
    }

    private _fadeLifeIcon(index: number) {
        this._cancelFade();

        const icon = this._livesIconsContainer.children[index];
        if (!icon) {
            return;
        }

        this._cancelAnim = animateOnTicker(() => {
            if (this.destroyed || !icon || icon.destroyed) {
                this._cancelAnim = null;
                return true;
            }

            icon.alpha -= 0.13;

            if (icon.alpha <= 0.2) {
                icon.alpha = 0.2;
                this._cancelAnim = null;
                return true;
            }
            return false;
        });
    }

    /**
     * Subscribes the state, listens for changes
     * and sets previously created text to value based on state
     */
    private _onLivesChange() {
        const subscription = gameService.subscribe((state) => {
            const currentLives = state.context.player.lives;

            if (currentLives < this._previousLives) {
                this._fadeLifeIcon(currentLives);
            }

            this._previousLives = currentLives;
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        this._cancelFade();
        super.destroy(options);
    }
}
