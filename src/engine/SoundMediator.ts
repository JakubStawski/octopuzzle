import { Howl, Howler } from 'howler';
import { gameService } from '../state/stateMachine';

let soundMediatorInstance: SoundMediator | null = null;

/** Play floating +points popup SFX */
export const playScorePopupSound = () => {
    soundMediatorInstance?.playScorePopup();
};

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
     * Score popup sound (+points)
     */
    private _scorePopup: Howl;

    /**
     * Lose marimba sound
     */
    private _lose: Howl;

    /**
     * Countdown tick (3, 2, 1)
     */
    private _countdownTick: Howl;

    /**
     * Countdown "Go!" sound
     */
    private _countdownGo: Howl;

    /**
     * Last countdown value that already played a sound
     */
    private _lastCountdownValue: number | null = null;

    /**
     * Unsubscribe from game service
     */
    private _unsubscribe: () => void;

    /**
     * True after ambience was successfully started at least once
     */
    private _ambienceStarted = false;

    /**
     * Timeout used to restore music after lose SFX
     */
    private _musicDuckRestoreId: ReturnType<typeof setTimeout> | null = null;

    private static readonly MUSIC_VOLUME = 0.1;

    private static readonly MUSIC_DUCK_VOLUME = 0;

    constructor() {
        soundMediatorInstance = this;
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
            volume: SoundMediator.MUSIC_VOLUME,
            onload: () => this._startAmbience(),
        });

        this._ocean = new Howl({
            src: ['./sfx/gentle-ocean-and-birdsong-24068.mp3'],
            loop: true,
            volume: 1,
            onload: () => this._startAmbience(),
        });

        this._scorePopup = new Howl({
            src: ['./sfx/u_o8xh7gwsrj-correct_answer_toy_bi-bling-476370.mp3'],
            volume: 0.85,
        });

        this._lose = new Howl({
            src: ['./sfx/marimba-ringtone-15-201165.mp3'],
            volume: 0.5,
        });

        this._countdownTick = new Howl({
            src: ['./sfx/universfield-bubble-pop-06-351337.mp3'],
            volume: 0.8,
        });

        this._countdownGo = new Howl({
            src: ['./sfx/u_xio2tir4to-bubble-pop-389501.mp3'],
            volume: 0.9,
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

    /**
     * Score popup SFX (+points floating label)
     */
    playScorePopup() {
        this._scorePopup.play();
    }

    private _subscribeEvents() {
        const subscription = gameService.subscribe((state) => {
            if (state.event.type === 'CHOICE' && state.matches('check_choice')) {
                this._clickSound.play();
            }

            if (state.event.type === 'WRONG_CHOICE' || state.event.type === 'TIMEOUT') {
                this._playLose();
            }

            if (state.matches('countdown')) {
                const value = state.context.countdownValue;
                if (value !== this._lastCountdownValue) {
                    this._lastCountdownValue = value;
                    if (value > 0) {
                        this._countdownTick.play();
                    } else {
                        this._countdownGo.play();
                    }
                }
            } else {
                this._lastCountdownValue = null;
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

    /**
     * Play lose SFX while briefly ducking background music
     */
    private _playLose() {
        this._duckBackgroundMusic();
        this._lose.stop();
        const soundId = this._lose.play();

        const restore = () => {
            this._lose.off('end', restore, soundId);
            this._restoreBackgroundMusic();
        };

        this._lose.once('end', restore, soundId);

        const durationMs = Math.max(500, (this._lose.duration(soundId) || 1.5) * 1000);
        this._clearMusicDuckRestore();
        this._musicDuckRestoreId = setTimeout(restore, durationMs + 80);
    }

    private _duckBackgroundMusic() {
        this._clearMusicDuckRestore();
        this._music.fade(this._music.volume(), SoundMediator.MUSIC_DUCK_VOLUME, 120);
    }

    private _restoreBackgroundMusic() {
        this._clearMusicDuckRestore();
        this._music.fade(this._music.volume(), SoundMediator.MUSIC_VOLUME, 450);
    }

    private _clearMusicDuckRestore() {
        if (this._musicDuckRestoreId !== null) {
            clearTimeout(this._musicDuckRestoreId);
            this._musicDuckRestoreId = null;
        }
    }
}
