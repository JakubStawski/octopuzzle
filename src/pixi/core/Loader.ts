import * as PIXI from 'pixi.js';

export default class Loader {
    constructor() {
        // Soft edges when sprites are scaled / rotated
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
        PIXI.BaseTexture.defaultOptions.mipmap = PIXI.MIPMAP_MODES.ON;

        PIXI.Assets.init();
        this._loadAssets();
    }

    private _loadAssets() {
        PIXI.Assets.addBundle('octis', {
            'green-lt': './images/webp/octi-green-lt.webp',
            'green-lb': './images/webp/octi-green-lb.webp',
            'green-rt': './images/webp/octi-green-rt.webp',
            'green-rb': './images/webp/octi-green-rb.webp',
            'yellow-lt': './images/webp/octi-yellow-lt.webp',
            'yellow-lb': './images/webp/octi-yellow-lb.webp',
            'yellow-rt': './images/webp/octi-yellow-rt.webp',
            'yellow-rb': './images/webp/octi-yellow-rb.webp',
            'blue-lt': './images/webp/octi-blue-lt.webp',
            'blue-lb': './images/webp/octi-blue-lb.webp',
            'blue-rt': './images/webp/octi-blue-rt.webp',
            'blue-rb': './images/webp/octi-blue-rb.webp',
            'pink-lt': './images/webp/octi-pink-lt.webp',
            'pink-lb': './images/webp/octi-pink-lb.webp',
            'pink-rt': './images/webp/octi-pink-rt.webp',
            'pink-rb': './images/webp/octi-pink-rb.webp',
            health: './images/webp/health.webp',
            frame: './images/webp/frame3.webp',
            star: './images/webp/star.webp',
            timer: './images/webp/timer.webp',
            logo: './images/webp/logo_small.webp',
            sadOcti: './images/webp/sad-octi.webp',
            highscores: './images/webp/highscores-bg.webp',
            'bronze-medal': './images/webp/bronze-medal.webp',
            'silver-medal': './images/webp/silver-medal.webp',
            'gold-medal': './images/webp/gold-medal.webp',
            'button-long': './images/webp/button-long.webp',
            switch: './images/switch.png',
            'rainbow-octi': './images/rainbowOcti-2.png',
        });

        PIXI.Assets.load({
            src: `./fonts/Playground.ttf`,
        });

        PIXI.Assets.loadBundle('octis', this._handleOnProgress.bind(this)).then(() => {
            const assetsLoadedDomEvent = new CustomEvent('assetsLoaded');
            return dispatchEvent(assetsLoadedDomEvent);
        });
    }

    private _handleOnProgress(progress) {
        console.log('Loading progress:', progress);
    }
}
