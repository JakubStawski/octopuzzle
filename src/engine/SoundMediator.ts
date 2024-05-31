import { Howl, Howler } from 'howler';

export default class SoundMediator {
    /**
     * Click sound howl
     */
    private _clickSound: Howl;

    /**
     * Music howl
     */
    private _music: Howl;

    /**
     * Ocean howl
     */
    private _ocean: Howl;

    /**
     * Win marimba sound
     */
    private _win: Howl;

    /**
     * Lose marimba sound
     */
    private _lose: Howl;

    constructor() {
        this._init();

        this._addSoundsListeners();
    }

    private _init() {
        this._clickSound = new Howl({
            src: ['./sfx/click-21156.mp3'],
        });

        this._music = new Howl({
            src: ['./sfx/ukewave-74471.mp3'],
            loop: true,
            volume: 0.1,
        });

        this._ocean = new Howl({
            src: ['./sfx/gentle-ocean-and-birdsong-24068.mp3'],
            loop: true,
            volume: 1,
        });

        this._win = new Howl({
            src: ['./sfx/marimba-bloop-2-188149.mp3'],
            volume: 0.8,
        });

        this._lose = new Howl({
            src: ['./sfx/marimba-ringtone-15-201165.mp3'],
            volume: 0.6,
        });
    }

    private _addSoundsListeners() {
        window.addEventListener('clickEvent', () => {
            this._clickSound.play();
        });

        window.addEventListener('gameStartedEvent', () => {
            this._music.play();
            this._ocean.play();
        });

        window.addEventListener('winEvent', () => {
            this._win.play();
        });

        window.addEventListener('loseEvent', () => {
            this._lose.play();
        });
    }
}
