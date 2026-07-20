import * as PIXI from 'pixi.js';

import { animateOnTicker } from '../utils/animateOnTicker';

/**
 * Interactive button with hover / press feedback
 */
export default class Button extends PIXI.Container {
    /**
     * Button sprite
     */
    private _buttonSprite: PIXI.Sprite;

    /**
     * text of the button
     */
    private _buttonText: PIXI.Text;

    /**
     * button onclick handler
     */
    private _callback: () => void;

    /**
     * text value
     */
    private _label: string;

    /**
     * Buttons icon name, the same as asset sprite name
     */
    private _icon: string;

    private _hover = false;

    private _pressed = false;

    private _cancelScaleAnim: (() => void) | null = null;

    constructor(callback: () => void, label: string, icon?: string) {
        super();

        this._callback = callback;
        this._icon = icon;
        this._label = label;
        this._init();
    }

    private _init() {
        this._createButton();
        this._createEvents();
    }

    private _createButton() {
        if (this._icon) {
            this._buttonSprite = new PIXI.Sprite(PIXI.Assets.cache.get(this._icon));
            this._buttonSprite.anchor.set(0.5, 0.5);
            this.addChild(this._buttonSprite);
        }

        if (!this._icon) {
            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Playground',
                lineJoin: 'round',
                fontSize: 48,
                fill: '0xffffff',
                stroke: '0x000000',
                strokeThickness: 7.5,
            });

            this._buttonSprite = new PIXI.Sprite(PIXI.Assets.cache.get('button-long'));
            this._buttonSprite.anchor.set(0.5, 0.5);
            this._buttonSprite.x = this._buttonSprite.width / 2;
            this._buttonSprite.y = this._buttonSprite.height / 2;

            this._buttonText = new PIXI.Text(this._label, textStyle);
            this._buttonText.anchor.set(0.5, 0.5);
            this._buttonText.x = this._buttonSprite.x;
            this._buttonText.y = this._buttonSprite.y;

            this.addChild(this._buttonSprite, this._buttonText);
        }
    }

    private _targetScale() {
        if (this._pressed) return 0.94;
        if (this._hover) return 1.06;
        return 1;
    }

    private _animateScaleTo(target: number) {
        this._cancelScaleAnim?.();
        const start = this._buttonSprite.scale.x;
        const duration = 120;
        let elapsed = 0;

        this._cancelScaleAnim = animateOnTicker((deltaMS) => {
            if (this.destroyed) {
                this._cancelScaleAnim = null;
                return true;
            }

            elapsed += deltaMS;
            const t = Math.min(1, elapsed / duration);
            const eased = 1 - (1 - t) ** 3;
            const scale = start + (target - start) * eased;
            this._buttonSprite.scale.set(scale);
            if (this._buttonText) {
                this._buttonText.scale.set(scale);
            }

            if (t >= 1) {
                this._cancelScaleAnim = null;
                return true;
            }
            return false;
        });
    }

    private _createEvents() {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', () => {
            this._hover = true;
            this._animateScaleTo(this._targetScale());
        });

        this.on('pointerout', () => {
            this._hover = false;
            this._pressed = false;
            this._animateScaleTo(this._targetScale());
        });

        this.on('pointerdown', () => {
            this._pressed = true;
            this._animateScaleTo(this._targetScale());
            this._callback();
        });

        this.on('pointerup', () => {
            this._pressed = false;
            this._animateScaleTo(this._targetScale());
        });

        this.on('pointerupoutside', () => {
            this._pressed = false;
            this._animateScaleTo(this._targetScale());
        });
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._cancelScaleAnim?.();
        this._cancelScaleAnim = null;
        super.destroy(options);
    }
}
