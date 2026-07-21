import { Howl, Howler } from 'howler';
import { gameService } from '../state/stateMachine';

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

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * True after ambience was successfully started at least once
     */
    private _ambienceStarted = false;

    constructor() {
        this._init();
        this._subscribeEvents();
        this._unlockAmbienceOnFirstGesture();
    }

    private _init() {
        this._clickSound = new Howl({
            src: ['./sfx/click-21156.mp3'],
        });

        this._music = new Howl({
            src: ['./sfx/ukewave-74471.mp3'],
            loop: true,
            volume: 0.1,
            onload: () => this._startAmbience(),
        });

        this._ocean = new Howl({
            src: ['./sfx/gentle-ocean-and-birdsong-24068.mp3'],
            loop: true,
            volume: 1,
            onload: () => this._startAmbience(),
        });

        this._win = new Howl({
            src: ['./sfx/marimba-bloop-2-188149.mp3'],
            volume: 0.7,
        });

        this._lose = new Howl({
            src: ['./sfx/marimba-ringtone-15-201165.mp3'],
            volume: 0.5,
        });

        this._setVolume(gameService.initialState.context.settings.musicEnabled);
        this._startAmbience();
    }

    private _setVolume(musicEnabled: boolean) {
        Howler.volume(musicEnabled ? 1 : 0);
    }

    private _startAmbience() {
        if (!this._music.playing()) {
            this._music.play();
        }
        if (!this._ocean.playing()) {
            this._ocean.play();
        }

        if (this._music.playing() || this._ocean.playing()) {
            this._ambienceStarted = true;
        }
    }

    /**
     * Browsers often block autoplay until a user gesture - retry then.
     */
    private _unlockAmbienceOnFirstGesture() {
        const unlock = () => {
            this._startAmbience();
            if (this._ambienceStarted) {
                window.removeEventListener('pointerdown', unlock);
                window.removeEventListener('keydown', unlock);
            }
        };

        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    }

    private _subscribeEvents() {
        const subscription = gameService.subscribe((state) => {
            if (state.event.type === 'CHOICE' && state.matches('check_choice')) {
                this._clickSound.play();
            }

            if (state.event.type === 'WRONG_CHOICE' || state.event.type === 'TIMEOUT') {
                this._lose.play();
            }

            if (state.event.type === 'COMPLETED') {
                this._win.play();
            }

            if (state.event.type === 'MUTE') {
                this._setVolume(state.context.settings.musicEnabled);
            }

            // Keep trying to start ambience on menu / start in case autoplay was blocked
            if (state.matches('main_screen') || state.event.type === 'START') {
                this._startAmbience();
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }
}
