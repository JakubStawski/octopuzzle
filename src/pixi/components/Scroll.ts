import * as PIXI from 'pixi.js';

export interface ScrollOptions {
    width: number;
    height: number;
    /** Gap from content to scrollbar */
    trackGap?: number;
    trackWidth?: number;
}

/**
 * Masked vertical scroll viewport with Craftpix scroll-bar track + thumb.
 * Supports mouse wheel, content drag, and thumb drag.
 */
export default class Scroll extends PIXI.Container {
    private _viewportWidth: number;

    private _viewportHeight: number;

    private _trackGap: number;

    private _trackWidth: number;

    private _viewport: PIXI.Container;

    private _maskGfx: PIXI.Graphics;

    private _content: PIXI.Container;

    private _track: PIXI.Sprite;

    private _thumb: PIXI.Sprite;

    private _scrollY = 0;

    private _dragMode: 'none' | 'content' | 'thumb' = 'none';

    private _dragStartY = 0;

    private _dragStartScroll = 0;

    private _hovered = false;

    private _onWheel: (e: WheelEvent) => void;

    private _wheelTarget: HTMLElement | null = null;

    /** Vertical inset so thumb doesn't sit flush with track ends */
    private readonly _trackInset = 18;

    constructor(content: PIXI.Container, options: ScrollOptions) {
        super();
        this._viewportWidth = options.width;
        this._viewportHeight = options.height;
        this._trackGap = options.trackGap ?? 12;
        this._trackWidth = options.trackWidth ?? 36;
        this._content = content;

        this._build();
        this._bindPointer();
        this._bindWheel();
        this.refresh();
    }

    private _build() {
        this._viewport = new PIXI.Container();
        this._maskGfx = new PIXI.Graphics();
        this._maskGfx.beginFill(0xffffff);
        this._maskGfx.drawRoundedRect(
            -this._viewportWidth / 2,
            -this._viewportHeight / 2,
            this._viewportWidth,
            this._viewportHeight,
            12,
        );
        this._maskGfx.endFill();

        this._content.x = 0;
        this._viewport.addChild(this._content);
        this._viewport.addChild(this._maskGfx);
        this._viewport.mask = this._maskGfx;
        this.addChild(this._viewport);

        const texture = PIXI.Assets.cache.get('scroll') as PIXI.Texture;

        // Asset is a horizontal capsule — rotate to vertical track
        this._track = new PIXI.Sprite(texture);
        this._track.anchor.set(0.5, 0.5);
        this._track.rotation = Math.PI / 2;
        this._track.width = this._viewportHeight;
        this._track.height = this._trackWidth;
        this._track.x = this._viewportWidth / 2 + this._trackGap + this._trackWidth / 2;
        this._track.y = 0;
        this._track.tint = 0x5a8a6a;
        this._track.eventMode = 'static';
        this._track.cursor = 'pointer';
        this.addChild(this._track);

        this._thumb = new PIXI.Sprite(texture);
        this._thumb.anchor.set(0.5, 0.5);
        this._thumb.rotation = Math.PI / 2;
        // Thinner than track so the track shows as side padding
        this._thumb.height = this._trackWidth * 0.48;
        this._thumb.x = this._track.x;
        this._thumb.tint = 0xffffff;
        this._thumb.eventMode = 'static';
        this._thumb.cursor = 'pointer';
        this.addChild(this._thumb);
    }

    private get _maxScroll() {
        return Math.max(0, this._content.height - this._viewportHeight);
    }

    private get _thumbTravel() {
        return Math.max(0, this._viewportHeight - this._thumb.width - this._trackInset * 2);
    }

    private get _thumbStartY() {
        return -this._viewportHeight / 2 + this._trackInset + this._thumb.width / 2;
    }

    refresh() {
        this._content.pivot.set(0, 0);
        this._content.y = -this._viewportHeight / 2 - this._scrollY;

        const ratio =
            this._content.height <= this._viewportHeight ? 1 : this._viewportHeight / this._content.height;
        // Keep thumb readable but shorter than a full proportional bar
        const thumbLen = Math.max(56, this._viewportHeight * ratio * 0.45);
        this._thumb.width = thumbLen;

        const progress = this._maxScroll <= 0 ? 0 : this._scrollY / this._maxScroll;
        this._thumb.y = this._thumbStartY + progress * this._thumbTravel;

        const canScroll = this._maxScroll > 0;
        this._track.visible = canScroll;
        this._thumb.visible = canScroll;
    }

    setScroll(y: number) {
        this._scrollY = Math.max(0, Math.min(this._maxScroll, y));
        this.refresh();
    }

    private _bindPointer() {
        this._viewport.eventMode = 'static';
        this._viewport.hitArea = new PIXI.Rectangle(
            -this._viewportWidth / 2,
            -this._viewportHeight / 2,
            this._viewportWidth,
            this._viewportHeight,
        );
        this._viewport.cursor = 'grab';

        const markHover = () => {
            this._hovered = true;
        };
        const clearHover = () => {
            if (this._dragMode === 'none') {
                this._hovered = false;
            }
        };

        this._viewport.on('pointerover', markHover);
        this._viewport.on('pointerout', clearHover);
        this._track.on('pointerover', markHover);
        this._track.on('pointerout', clearHover);
        this._thumb.on('pointerover', markHover);
        this._thumb.on('pointerout', clearHover);

        this._viewport.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            this._hovered = true;
            this._startDrag('content', e);
            this._viewport.cursor = 'grabbing';
        });

        this._thumb.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            e.stopPropagation();
            this._hovered = true;
            this._startDrag('thumb', e);
        });

        this._track.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            if (e.target === this._thumb) {
                return;
            }
            this._hovered = true;
            const local = this.toLocal(e.global);
            const progress =
                this._thumbTravel <= 0 ? 0 : (local.y - this._thumbStartY) / this._thumbTravel;
            this.setScroll(progress * this._maxScroll);
        });

        this.eventMode = 'static';
        this.hitArea = new PIXI.Rectangle(
            -this._viewportWidth / 2,
            -this._viewportHeight / 2,
            this._viewportWidth + this._trackGap + this._trackWidth + 20,
            this._viewportHeight,
        );
    }

    private _startDrag(mode: 'content' | 'thumb', e: PIXI.FederatedPointerEvent) {
        this._dragMode = mode;
        this._dragStartY = e.global.y;
        this._dragStartScroll = this._scrollY;

        const app = globalThis.__PIXI_APP__ as PIXI.Application | undefined;
        if (!app) {
            return;
        }

        const onMove = (ev: PIXI.FederatedPointerEvent) => {
            if (this._dragMode === 'none') {
                return;
            }

            const dy = ev.global.y - this._dragStartY;
            if (this._dragMode === 'content') {
                this.setScroll(this._dragStartScroll - dy);
            } else if (this._dragMode === 'thumb' && this._thumbTravel > 0) {
                this.setScroll(this._dragStartScroll + (dy / this._thumbTravel) * this._maxScroll);
            }
        };

        const onUp = () => {
            this._dragMode = 'none';
            this._viewport.cursor = 'grab';
            app.stage.off('pointermove', onMove);
            app.stage.off('pointerup', onUp);
            app.stage.off('pointerupoutside', onUp);
        };

        app.stage.eventMode = 'static';
        app.stage.on('pointermove', onMove);
        app.stage.on('pointerup', onUp);
        app.stage.on('pointerupoutside', onUp);
    }

    private _bindWheel() {
        this._onWheel = (e: WheelEvent) => {
            if (!this.worldVisible || !this._hovered) {
                return;
            }

            e.preventDefault();
            this.setScroll(this._scrollY + e.deltaY * 0.6);
        };

        const app = globalThis.__PIXI_APP__ as PIXI.Application | undefined;
        this._wheelTarget = (app?.view as HTMLCanvasElement) || document.querySelector('canvas');
        this._wheelTarget?.addEventListener('wheel', this._onWheel, { passive: false });
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._wheelTarget?.removeEventListener('wheel', this._onWheel);
        this._wheelTarget = null;
        super.destroy(options);
    }
}
