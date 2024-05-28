import * as PIXI from 'pixi.js';

export default class Loader {
    constructor() {
        PIXI.Assets.init();
        this._loadAssets();
    }

    private _loadAssets() {
        PIXI.Assets.addBundle('octis', {
            'green-lt': './images/octi-green-lt.png',
            'green-lb': './images/octi-green-lb.png',
            'green-rt': './images/octi-green-rt.png',
            'green-rb': './images/octi-green-rb.png',
            'yellow-lt': './images/octi-yellow-lt.png',
            'yellow-lb': './images/octi-yellow-lb.png',
            'yellow-rt': './images/octi-yellow-rt.png',
            'yellow-rb': './images/octi-yellow-rb.png',
            'white-lt': './images/octi-white-lt.png',
            'white-lb': './images/octi-white-lb.png',
            'white-rt': './images/octi-white-rt.png',
            'white-rb': './images/octi-white-rb.png',
            'pink-lt': './images/octi-pink-lt.png',
            'pink-lb': './images/octi-pink-lb.png',
            'pink-rt': './images/octi-pink-rt.png',
            'pink-rb': './images/octi-pink-rb.png',
            'heart-icon': './images/heart-icon.png',
            frame: './images/frame2.png',
        });

        PIXI.Assets.load({
            src: `./fonts/Alien-Encounters-Regular.ttf`,
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
