import * as PIXI from 'pixi.js';
import { gameService } from '../../state/stateMachine';

/**
 * Timer components that shows the player how many time one has left
 */
export default class Announcement extends PIXI.Container {
    /**
     * Pixi text for announcement state
     */
    private _announcementText: PIXI.Text;

    /**
     * Constructor of a component
     */
    constructor() {
        super();
        this._init();
    }

    /**
     * Init component
     */
    private _init() {
        this._createAnnouncementText();

        gameService.subscribe((state) => {
            this._handleAnnouncement(state);
        });
    }

    /**
     * Create Announcement Text
     */
    private _createAnnouncementText() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 24,
            fill: '0xffffff',
        });

        this._announcementText = new PIXI.Text('', textStyle);

        this._announcementText.anchor.x = 0.5;
        this._announcementText.anchor.y = 0.5;
        this._announcementText.x = this.width / 2;
        this._announcementText.y = this.height / 2;
        this._announcementText.visible = false;

        this.addChild(this._announcementText);
    }

    /**
     * Thing that happen after announcement state is set
     * @param state current game state
     */
    private _handleAnnouncement(state) {
        if (state.context.player.lives < 0) {
            this._announcementText.visible = true;
        }

        if (state.value !== 'announce' && state.context.player.lives >= 0) {
            this._announcementText.visible = false;
            return;
        }

        const announcements = {
            TIMEOUT: 'Time`s out',
            WRONG_CHOICE: 'Fail',
            COMPLETED: 'octi completed',
            EXIT: 'Game over',
        };

        this._announcementText.text = announcements[state.event.type];
        this._announcementText.visible = true;
    }
}
