import * as PIXI from 'pixi.js';

import Button from '../components/Button';
import Switch from '../components/Switch';
import { gameService } from '../../state/stateMachine';

/**
 * Settings screen - sound toggle on highscores-style panel
 */
export default class Settings extends PIXI.Container {
    private _background: PIXI.Sprite;

    private _title: PIXI.Text;

    private _soundLabel: PIXI.Text;

    private _soundSwitch: Switch;

    private _mainMenuButton: PIXI.Container;

    private _unsubscribe: () => void;

    constructor() {
        super();
        this.name = 'Settings';
        this._init();
    }

    private _init() {
        this._createBackground();
        this._createTitle();
        this._createSoundRow();
        this._createMainMenuButton();
        this._subscribeEvents();
        this.visible = false;
    }

    private _createBackground() {
        this._background = new PIXI.Sprite(PIXI.Assets.cache.get('highscores'));
        this._background.anchor.set(0.5, 0.5);
        this.addChild(this._background);
    }

    private _createTitle() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 100,
            fill: '0xffffff',
            stroke: '0x000000',
            strokeThickness: 16,
        });

        this._title = new PIXI.Text('Settings', textStyle);
        this._title.anchor.set(0.5, 1);
        this._title.y = -this._background.height / 2 + 55;
        this.addChild(this._title);
    }

    private _createSoundRow() {
        const row = new PIXI.Container();

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 56,
            fill: '0xecda81',
            strokeThickness: 4,
            stroke: '0x987800',
        });

        this._soundLabel = new PIXI.Text('Sound', textStyle);
        this._soundLabel.anchor.set(0, 0.5);
        this._soundLabel.x = -220;

        this._soundSwitch = new Switch(gameService.getSnapshot().context.settings.musicEnabled, () => {
            gameService.send({ type: 'MUTE' });
        });
        this._soundSwitch.x = 160;

        row.addChild(this._soundLabel, this._soundSwitch);
        row.y = -20;
        this.addChild(row);
    }

    private _createMainMenuButton() {
        this._mainMenuButton = new Button(() => {
            gameService.send({ type: 'MAIN_MENU' });
        }, 'Main Menu');
        this._mainMenuButton.x = this.width / 2 - this._mainMenuButton.width - 80;
        this._mainMenuButton.y = this.height / 2 - this._mainMenuButton.height - 80;
        this.addChild(this._mainMenuButton);
    }

    private _subscribeEvents() {
        const subscription = gameService.subscribe((state) => {
            if (state.event.type === 'MUTE') {
                this._soundSwitch.setValue(state.context.settings.musicEnabled, true);
            }
        });
        this._unsubscribe = () => subscription.unsubscribe();
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        this._unsubscribe?.();
        super.destroy(options);
    }
}
