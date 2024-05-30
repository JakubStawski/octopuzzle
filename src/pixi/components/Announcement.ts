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
     * Game over announcement text
     */
    private _gameOverText: PIXI.Text;

    /**
     * Game over overlay
     */
    private _gameOverOverlay: PIXI.Graphics;

    /**
     * Game over sprite
     */
    private _gameOverSprite: PIXI.Sprite;

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
        // this._onAnnouncement();

        this._createGameOverAnnouncement();

        this.visible = false;
    }

    /**
     * Creates game over announcement
     */
    private _createGameOverAnnouncement() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Playground',
            lineJoin: 'round',
            fontSize: 200,
            fill: '0xffffff',
        });

        this._gameOverText = new PIXI.Text('Game over', textStyle);
        this._gameOverText.anchor.set(0.5, 0.5);

        this._createGameOverSprite();

        this.addChild(this._gameOverText);
    }

    /**
     * Creates sad octopus sprite
     */
    private _createGameOverSprite() {
        this._gameOverSprite = new PIXI.Sprite(PIXI.Assets.cache.get('sadOcti'));
        this._gameOverSprite.anchor.set(0.5, 0.5);
        this._gameOverSprite.y = -this._gameOverText.height + 30;
        this.addChild(this._gameOverSprite);
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

    // /**
    //  * Announcement event listener
    //  */

    // private _onAnnouncement() {
    //     gameService.subscribe((state) => {

    //         if (state.value !== 'announce') {
    //             return;
    //         }

    //         const announcements = {
    //             TIMEOUT: 'Time`s out',
    //             WRONG_CHOICE: 'Fail',
    //             COMPLETED: 'octi completed',
    //             EXIT: 'Game over',
    //         };

    //         console.log(announcements[state.event.type]);
    //     });
    // }
}
