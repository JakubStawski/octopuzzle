import * as PIXI from 'pixi.js';

import { gameService } from '../../state/stateMachine';
import { animateOnTicker } from '../utils/animateOnTicker';

/**
 * Full-screen countdown overlay: 3 → 2 → 1 before the first round
 */
export default class Countdown extends PIXI.Container {
    private _label: PIXI.Text;

    private _unsubscribe: () => void;

    private _cancelAnim: (() => void) | null = null;

    private _lastShown: string | null = null;

    constructor() {
        super();
        this.name = 'Countdown';
        this._createLabel();
        this._subscribe();
        this.visible = false;
    }

    private _createLabel() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 220,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 22,
            align: 'center',
        });

        this._label = new PIXI.Text('', textStyle);
        this._label.anchor.set(0.5, 0.5);
        this._label.position.set(0, 0);
        this.addChild(this._label);
    }

    private _subscribe() {
        const subscription = gameService.subscribe((state) => {
            if (!state.matches('countdown')) {
                this.visible = false;
                this._lastShown = null;
                this._cancelAnim?.();
                this._cancelAnim = null;
                return;
            }

            const value = state.context.countdownValue;
            const text = value > 0 ? String(value) : 'Go!';
            if (text === this._lastShown) {
                return;
            }

            this._lastShown = text;
            this.visible = true;
            this._label.text = text;
            this._label.anchor.set(0.5, 0.5);
            this._label.position.set(0, 0);
            this._label.alpha = 1;
            this._label.tint = 0xffffff;
            this._playPop();
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    private _playPop() {
        this._cancelAnim?.();
        this._label.anchor.set(0.5, 0.5);
        this._label.position.set(0, 0);
        this._label.scale.set(0.35);
        this._label.alpha = 0;

        let elapsed = 0;
        const duration = 320;

        this._cancelAnim = animateOnTicker((deltaMS) => {
            if (this.destroyed || this._label.destroyed) {
                this._cancelAnim = null;
                return true;
            }

            elapsed += deltaMS;
            const t = Math.min(1, elapsed / duration);
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const eased = 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
            this._label.scale.set(0.35 + 0.65 * Math.min(eased, 1.15));
            this._label.alpha = Math.min(1, t * 1.5);

            if (t >= 1) {
                this._label.scale.set(1);
                this._label.alpha = 1;
                this._cancelAnim = null;
                return true;
            }
            return false;
        });
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        this._cancelAnim?.();
        this._cancelAnim = null;
        super.destroy(options);
    }
}
