import * as PIXI from 'pixi.js';

import { gameService } from '../../state/stateMachine';
import Button from '../components/Button';
import { animateOnTicker, loopOnTicker } from '../utils/animateOnTicker';

export default class MainMenu extends PIXI.Container {
    /**
     * play Button
     */
    private _playButton: PIXI.Container;

    /**
     * highscores Button
     */
    private _highscoresButton: PIXI.Container;

    /**
     * settings Button
     */
    private _settingsButton: PIXI.Container;

    /**
     * credits Button
     */
    private _creditsButton: PIXI.Container;

    /**
     * logo text, basically game name as pixi text
     */
    private _logo: PIXI.Text;

    /**
     * image under logo
     */
    private _logoSprite: PIXI.Sprite;

    private _cancelIdle: (() => void) | null = null;

    private _entranceCancels: (() => void)[] = [];

    /**
     * Constructor of the pixi application and its stage
     */
    constructor() {
        super();
        this._init();
    }

    /**
     * Create boards on init
     */
    private _init() {
        this._createLogo();
        this._createPlayButton();
        this._createHighscoresButton();
        this._createSettingsButton();
        this._createCreditsButton();
        // Lower the whole menu so logo/buttons sit more comfortably in view
        this.y = 140;
        this._startIdleMotion();
        this._playEntrance();
    }

    /**
     * Soft bob for octopus + gentle logo pulse
     */
    private _startIdleMotion() {
        const octiBaseY = this._logoSprite.y;
        const logoBaseScale = 1;
        let elapsed = 0;

        this._cancelIdle = loopOnTicker((deltaMS) => {
            if (this.destroyed || !this.visible) {
                return;
            }

            elapsed += deltaMS;
            const t = elapsed / 1000;
            this._logoSprite.y = octiBaseY + Math.sin(t * 1.6) * 14;

            const pulse = 1 + Math.sin(t * 2.2) * 0.015;
            this._logo.scale.set(logoBaseScale * pulse);
            this._logoSprite.scale.set(pulse);
        });
    }

    /**
     * Staggered button fade/slide-in
     */
    private _playEntrance() {
        const buttons = [this._playButton, this._highscoresButton, this._settingsButton, this._creditsButton];
        buttons.forEach((btn, index) => {
            const button = btn;
            button.alpha = 0;
            const targetY = button.y;
            button.y = targetY + 30;

            let elapsed = -index * 90;
            const duration = 420;

            const cancel = animateOnTicker((deltaMS) => {
                if (this.destroyed) {
                    return true;
                }

                elapsed += deltaMS;
                if (elapsed < 0) {
                    return false;
                }

                const t = Math.min(1, elapsed / duration);
                const eased = 1 - (1 - t) ** 3;
                button.alpha = eased;
                button.y = targetY + 30 * (1 - eased);

                return t >= 1;
            });

            this._entranceCancels.push(cancel);
        });
    }

    /**
     * create play button
     */
    private _createPlayButton() {
        this._playButton = new Button(() => {
            gameService.send({ type: 'START' });
        }, 'Let`s play!');

        this._playButton.y = -(this._playButton.height + 40) * 1.5 + 80;
        this._playButton.x = -this._playButton.width / 2;

        this.addChild(this._playButton);
    }

    /**
     * creates logo
     */
    private _createLogo() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 200,
            fill: '0xffffff',
            strokeThickness: 20,
            stroke: '0x000000',
        });

        this._logo = new PIXI.Text('Octo`puzzle', textStyle);
        this._logo.anchor.set(0.5, 0.5);

        this._logo.y = -400;
        this._createLogoSprite();
        this.addChild(this._logo);
    }

    /**
     * create rainbow octopus sprite
     */
    private _createLogoSprite() {
        this._logoSprite = new PIXI.Sprite(PIXI.Assets.cache.get('rainbow-octi'));
        this._logoSprite.anchor.set(0.5, 0.5);
        this._logoSprite.y = -this._logoSprite.height + 100;
        this.addChild(this._logoSprite);
    }

    /**
     * create highscores button
     */
    private _createHighscoresButton() {
        this._highscoresButton = new Button(() => {
            gameService.send({ type: 'HIGH_SCORES' });
        }, 'Highscores');

        this._highscoresButton.y = -(this._highscoresButton.height + 40) * 0.5 + 80;
        this._highscoresButton.x = -this._highscoresButton.width / 2;

        this.addChild(this._highscoresButton);
    }

    /**
     * create settings button
     */
    private _createSettingsButton() {
        this._settingsButton = new Button(() => {
            gameService.send({ type: 'SETTINGS' });
        }, 'Settings');

        this._settingsButton.y = (this._settingsButton.height + 40) * 0.5 + 80;
        this._settingsButton.x = -this._settingsButton.width / 2;

        this.addChild(this._settingsButton);
    }

    /**
     * create credits button
     */
    private _createCreditsButton() {
        this._creditsButton = new Button(() => {
            gameService.send({ type: 'CREDITS' });
        }, 'Credits');

        this._creditsButton.y = (this._creditsButton.height + 40) * 1.5 + 80;
        this._creditsButton.x = -this._creditsButton.width / 2;

        this.addChild(this._creditsButton);
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._cancelIdle?.();
        this._cancelIdle = null;
        this._entranceCancels.forEach((cancel) => cancel());
        this._entranceCancels = [];
        super.destroy(options);
    }
}
