import * as PIXI from 'pixi.js';

import { animateOnTicker } from '../utils/animateOnTicker';

/**
 * Toggle switch built from the cyan capsule asset + sliding knob
 */
export default class Switch extends PIXI.Container {
    private _track: PIXI.Sprite;

    private _knob: PIXI.Graphics;

    private _value: boolean;

    private _onChange: (value: boolean) => void;

    private _cancelAnim: (() => void) | null = null;

    constructor(initialValue: boolean, onChange: (value: boolean) => void) {
        super();
        this._value = initialValue;
        this._onChange = onChange;
        this._init();
    }

    private _init() {
        this._createTrack();
        this._createKnob();
        this._applyVisualState(false);
        this._createEvents();
    }

    private _createTrack() {
        this._track = new PIXI.Sprite(PIXI.Assets.cache.get('switch'));
        this._track.anchor.set(0.5, 0.5);
        this._track.width = 155;
        this._track.height = 70;
        this.addChild(this._track);
    }

    private _createKnob() {
        const radius = 24;
        this._knob = new PIXI.Graphics();
        this._knob.beginFill(0xffffff);
        this._knob.drawCircle(0, 0, radius);
        this._knob.endFill();
        this._knob.drawCircle(0, 0, radius);
        this._knob.alpha = 0.85;
        this.addChild(this._knob);
    }

    private _knobX(on: boolean) {
        const travel = this._track.width / 2 - 34;
        return on ? travel : -travel;
    }

    private _applyVisualState(animate: boolean) {
        this._track.tint = this._value ? 0xffffff : 0xc8c8c8;
        this._knob.tint = this._value ? 0xffffff : 0xc8c8c8;

        const targetX = this._knobX(this._value);
        if (!animate) {
            this._cancelAnim?.();
            this._cancelAnim = null;
            this._knob.x = targetX;
            return;
        }

        this._cancelAnim?.();
        const startX = this._knob.x;
        const duration = 140;
        let elapsed = 0;

        this._cancelAnim = animateOnTicker((deltaMS) => {
            if (this.destroyed) {
                this._cancelAnim = null;
                return true;
            }

            elapsed += deltaMS;
            const t = Math.min(1, elapsed / duration);
            const eased = t * (2 - t);
            this._knob.x = startX + (targetX - startX) * eased;

            if (t >= 1) {
                this._cancelAnim = null;
                return true;
            }
            return false;
        });
    }

    private _createEvents() {
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => {
            this._value = !this._value;
            this._applyVisualState(true);
            this._onChange(this._value);
        });
    }

    setValue(value: boolean, animate = false) {
        if (this._value === value) {
            return;
        }
        this._value = value;
        this._applyVisualState(animate);
    }

    get value() {
        return this._value;
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._cancelAnim?.();
        this._cancelAnim = null;
        super.destroy(options);
    }
}
